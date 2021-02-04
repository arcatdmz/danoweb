import { Response, Status } from "../deps.ts";

import { RequestHandlerOptions, RequestHandler } from "../utils.ts";
import { serveHead, serveFile, serveJSON } from "../io.ts";

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

  async handle(
    path: string,
    options: RequestHandlerOptions
  ): Promise<Response | null> {
    const { systemDir, systemPath } = this.options;
    if (path === systemPath || path.indexOf(`${systemPath}/`) !== 0)
      return null;
    const filePath = systemDir + path.substr(systemPath.length);
    try {
      const fileInfo = await stat(filePath);
      if (fileInfo.isDirectory) {
        return this.handle(
          (path.substr(-1) === "/" ? "" : "/") + "index.html",
          options
        );
      }
      if (options.method === "head") {
        return serveHead(filePath, fileInfo);
      }
      return serveFile(filePath, fileInfo);
    } catch (e) {
      return this.handleError(options);
    }
  }

  private handleError(options: RequestHandlerOptions) {
    if (options.method === "head") {
      return serveHead();
    }
    const { encoder } = this.options;
    const res = serveJSON(
      {
        error: "system file not found",
      },
      encoder
    );
    res.status = Status.Forbidden;
    return res;
  }
}
