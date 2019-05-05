import { Response, Status } from "../deps.ts";

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
    try {
      const fileInfo = await stat(filePath);
      if (fileInfo.isDirectory()) {
        return {
          body: encoder.encode("Directory listing prohibited\n"),
          status: Status.Forbidden
        };
      }
    } catch (e) {
      // file not found
    } finally {
      return serveFile(editorPath);
    }
  }
}
