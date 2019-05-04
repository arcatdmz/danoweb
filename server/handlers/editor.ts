import { Response } from "https://deno.land/std/http/server.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";

import { RequestHandlerOptions, RequestHandler } from "../utils.ts";

import { serveFile } from "../io.ts";

const { stat } = Deno;

export interface EditorRequestHandlerOptions {
  encoder: TextEncoder;
  userDir: string;
  editorFile: string;
}

/**
 * Serve the editor file
 */
export class EditorRequestHandler implements RequestHandler {
  private options: EditorRequestHandlerOptions;

  constructor(options: EditorRequestHandlerOptions) {
    this.options = options;
  }

  async handle(path: string, options: RequestHandlerOptions) {
    if (options.query.mode !== "edit") return null;
    const { encoder, userDir, editorFile: editorPath } = this.options;

    const filePath = userDir + path;
    let response: Response;
    try {
      const fileInfo = await stat(filePath);
      if (fileInfo.isDirectory()) {
        response = {
          body: encoder.encode("Directory listing prohibited\n"),
          status: Status.Unauthorized
        };
      } else {
        response = await serveFile(editorPath);
      }
    } catch (e) {
      response = {
        body: encoder.encode("File not found\n"),
        status: Status.NotFound
      };
    }
    return response;
  }
}
