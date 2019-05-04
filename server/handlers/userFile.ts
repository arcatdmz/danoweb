import { Status, FormFile, isFormFile, MultipartReader } from "../deps.ts";

import { RequestHandlerOptions, RequestHandler } from "../utils.ts";
import { serveFile } from "../io.ts";

const { stat } = Deno;

export interface UserFileRequestHandlerOptions {
  encoder: TextEncoder;
  userDir: string;
}

/**
 * Serve user files
 */
export class UserFileRequestHandler implements RequestHandler {
  private options: UserFileRequestHandlerOptions;

  constructor(options: UserFileRequestHandlerOptions) {
    this.options = options;
  }

  async handle(path: string, options: RequestHandlerOptions) {
    switch (options.method) {
      case "get":
        return this.handleGet(path, options);
      case "put":
        return this.handlePut(path, options);
      default:
        return null;
    }
  }

  async handleGet(path: string, _options: RequestHandlerOptions) {
    const { userDir, encoder } = this.options;
    const filePath = userDir + path;
    try {
      const fileInfo = await stat(filePath);
      if (fileInfo.isDirectory()) {
        return {
          body: encoder.encode("Directory listing prohibited\n"),
          status: Status.Unauthorized
        };
      }
      return await serveFile(filePath);
    } catch (e) {
      return null;
    }
  }

  async handlePut(path: string, options: RequestHandlerOptions) {
    const { req } = options;

    // get content-type
    const contentType = req.headers.get("content-type");
    const params = contentType.split(";");
    if (params[0] !== "multipart/form-data" || params.length < 2) return null;

    // get boundary string
    const boundary = /^\s*boundary="?(.+)"?$/.exec(params[1]);
    if (!boundary) return null;
    const boundaryString = boundary[1];

    // parse multipart/form-data
    const stream = req.bodyStream();
    const reader = new MultipartReader(new Reader(stream), boundaryString);
    const result = await reader.readForm(1 << 30 /* 1MB */);

    // get file content
    let file: FormFile;
    for (let key in result) {
      if (isFormFile(result[key])) file = result[key] as FormFile;
      else {
        // handle the other parameters
      }
    }
    if (!file) return null;
    console.log("file posted:", file, path);
  }
}

class Reader {
  private stream: AsyncIterableIterator<Uint8Array>;
  private chunk: IteratorResult<Uint8Array>;
  private chunkOffset: number;
  constructor(stream: AsyncIterableIterator<Uint8Array>) {
    this.stream = stream;
  }
  async read(p: Uint8Array) {
    let { stream, chunk, chunkOffset } = this;
    if (!chunk) {
      this.chunk = chunk = await stream.next();
      this.chunkOffset = chunkOffset = 0;
    }
    let nread: number;
    if (chunk.value) {
      const chunkLeft = chunk.value.byteLength - chunkOffset;
      nread = Math.min(p.byteLength, chunkLeft);
      if (nread > 0) p.set(chunk.value);
      const nothingLeft = chunkOffset + chunkLeft >= chunk.value.byteLength;
      if (nothingLeft) {
        this.chunk = null;
        this.chunkOffset = 0;
      }
    } else {
      nread = 0;
    }
    this.chunkOffset += nread;
    const eof = chunk.done;
    return { nread, eof };
  }
}
