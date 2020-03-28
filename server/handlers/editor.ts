import { Response } from "../deps.ts";

import { RequestHandlerOptions, RequestHandler } from "../utils.ts";
import { serveFile, redirect } from "../io.ts";

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

  async handle(
    path: string,
    options: RequestHandlerOptions
  ): Promise<Response | null> {
    if (options.query.mode !== "edit") return null;
    const { encoder, userDir, editorFile: editorPath } = this.options;
    const filePath = userDir + path;
    try {
      const fileInfo = await stat(filePath);
      if (fileInfo.isDirectory()) {
        path = path.charAt(path.length - 1) === "/" ? path : `${path}/`;
        return redirect(`${path}index.html?mode=edit`, encoder);
      }
      return serveFile(editorPath);
    } catch (e) {
      // file not found
      return serveFile(editorPath);
    }
  }
}
