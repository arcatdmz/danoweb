import { Status } from "https://deno.land/std/http/http_status.ts";

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
      default:
        return null;
    }
  }

  async handleGet(path: string, options: RequestHandlerOptions) {
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
}
