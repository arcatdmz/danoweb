import {
  Status,
  FormFile,
  isFormFile,
  MultipartReader,
  Response,
  sep
} from "../deps.ts";

import { RequestHandlerOptions, RequestHandler } from "../utils.ts";
import {
  serveFile,
  serveJSON,
  redirect,
  saveFormFile,
  StreamReader
} from "../io.ts";
import { AuthHandler } from "../auth.ts";

const { stat } = Deno;

export interface UserFileRequestHandlerOptions {
  encoder: TextEncoder;
  userDir: string;
  auth: AuthHandler;
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

    // get info
    try {
      const fileInfo = await stat(filePath);

      // path points to a directory
      if (fileInfo.isDirectory()) {
        if (check) {
          return serveJSON({ success: true, type: "directory" }, encoder);
        }
        path = path.charAt(path.length - 1) === "/" ? path : `${path}/`;
        return redirect(`${path}index.html`, encoder);
      }

      // path points to a file
      if (check) {
        return serveJSON({ success: true, type: "file" }, encoder);
      }
      return await serveFile(filePath);
    } catch (e) {
      if (check) {
        return serveJSON({ success: false }, encoder);
      }
      return null;
    }
  }

  async handlePut(
    path: string,
    options: RequestHandlerOptions
  ): Promise<Response> {
    const { userDir, encoder, auth } = this.options;
    const { req } = options;

    // get authentication header
    try {
      if (!auth.check(req)) {
        throw new Error("authentication failed");
      }
    } catch (e) {
      const res = serveJSON(
        {
          success: false,
          error: e.message
        },
        encoder
      );
      res.status = Status.Unauthorized;
      return res;
    }

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

    // get file content
    const result = await reader.readForm(1 << 30 /* 1MB */);
    const file = result["content"] as FormFile;
    let json: any, status: number;
    if (isFormFile(file)) {
      try {
        // save file
        const filePath = (userDir + path).replace(/\//g, sep);
        await saveFormFile(file, filePath);

        // return file overview
        json = {
          success: true,
          path,
          filename: file.filename,
          size: file.size,
          type: file.type
        };
      } catch (e) {
        json = { success: false, error: "saving file failed", details: e };
      }
    } else {
      json = { success: false, error: "no file submitted" };
      status = Status.BadRequest;
    }
    const res = serveJSON(json, encoder);
    res.status = status;
    return res;
  }
}
