import { RequestHandlerOptions, RequestHandler } from "../utils.ts";
import { serveFile } from "../io.ts";

const { stat } = Deno;

export interface SystemFileRequestHandlerOptions {
  systemDir: string;
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
    const { systemDir } = this.options;
    if (path === "/lib" || path.indexOf("/lib/") !== 0) return null;
    const filePath = systemDir + path.substr("/lib".length);
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
      return null;
    }
  }
}
