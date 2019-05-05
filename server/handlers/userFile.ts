import {
  Status,
  FormFile,
  isFormFile,
  MultipartReader,
  Response
} from "../deps.ts";

import { RequestHandlerOptions, RequestHandler } from "../utils.ts";
import { serveFile, StreamReader, Uint8ArrayReader } from "../io.ts";

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

  async handleGet(
    path: string,
    options: RequestHandlerOptions
  ): Promise<Response> {
    // get parameters
    const { userDir, encoder } = this.options;
    const { query } = options;
    const filePath = userDir + path;

    // return JSON if query contains `action=check`
    const check = query.action === "check";
    const headers = new Headers();
    if (check) {
      headers.set("content-type", "application/json");
    }

    // get info
    try {
      const fileInfo = await stat(filePath);

      // path points to a directory
      if (fileInfo.isDirectory()) {
        return {
          body: encoder.encode(
            JSON.stringify({ success: true, type: "directory" })
          ),
          status: check ? Status.Unauthorized : undefined,
          headers
        };
      }

      // path points to a file
      if (check) {
        return {
          body: encoder.encode(JSON.stringify({ success: true, type: "file" })),
          headers
        };
      }
      return await serveFile(filePath);
    } catch (e) {
      if (check) {
        return {
          body: encoder.encode(JSON.stringify({ success: false })),
          headers
        };
      }
      return null;
    }
  }

  async handlePut(
    path: string,
    options: RequestHandlerOptions
  ): Promise<Response> {
    const { userDir, encoder } = this.options;
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
    // using StreamReader:
    const stream = req.bodyStream();
    const reader = new MultipartReader(
      new StreamReader(stream),
      boundaryString
    );

    // using Uint8ArrayReader:
    // const arr = await req.body();
    // const reader = new MultipartReader(
    //   new Uint8ArrayReader(arr),
    //   boundaryString
    // );

    // using Deno.Buffer:
    // const arr = await req.body();
    // const reader = new MultipartReader(new Deno.Buffer(arr), boundaryString);

    // console.log("boundary:", boundaryString);
    // console.log("<req-body>");
    // console.log(new TextDecoder("utf-8").decode(arr));
    // console.log("</req-body>");

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
    const headers = new Headers();
    headers.set("content-type", "application/json");
    return {
      body: encoder.encode(
        JSON.stringify({
          success: true,
          path,
          filename: file.filename,
          size: file.size,
          type: file.type
        })
      ),
      headers
    };
  }
}
