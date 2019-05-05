import { Status } from "../deps.ts";

import { RequestHandlerOptions, RequestHandler } from "../utils.ts";
import { serveFile, serveJSON } from "../io.ts";

const { stat } = Deno;

export interface SystemFileRequestHandlerOptions {
  encoder: TextEncoder;
  systemDir: string;
  systemPath: string;
}

/**
 * Serve system files
 */
export class SystemFileRequestHandler implements RequestHandler {
  private options: SystemFileRequestHandlerOptions;

  constructor(options: SystemFileRequestHandlerOptions) {
    this.options = options;
  }

  async handle(path: string, options: RequestHandlerOptions) {
    const { encoder, systemDir, systemPath } = this.options;
    if (path === systemPath || path.indexOf(`${systemPath}/`) !== 0)
      return null;
    const filePath = systemDir + path.substr(systemPath.length);
    try {
      const fileInfo = await stat(filePath);
      if (fileInfo.isDirectory()) {
        return this.handle(
          (path.substr(-1) === "/" ? "" : "/") + "index.html",
          options
        );
      }
      return serveFile(filePath);
    } catch (e) {
      const res = serveJSON(
        {
          error: "system file not found; system file cannot be modified"
        },
        encoder
      );
      res.status = Status.Forbidden;
      return res;
    }
  }
}
