import { Status, Response, extname, contentType } from "../deps.ts";

import { RequestHandlerOptions, RequestHandler } from "../utils.ts";
import { serveJSON } from "../io.ts";
import { AuthHandler } from "../auth.ts";

export interface APIRequestHandlerOptions {
  encoder: TextEncoder;
  address: string;
  environment: string;
  debug: boolean;
  auth: AuthHandler;
}

/**
 * Handle requests to /api endpoint
 */
export class APIRequestHandler implements RequestHandler {
  private options: APIRequestHandlerOptions;

  constructor(options: APIRequestHandlerOptions) {
    this.options = options;
  }

  async handle(path: string, options: RequestHandlerOptions) {
    if (path.indexOf("/api/") !== 0) return null;
    path = path.substr("/api".length);

    return this.server(path, options) || this.auth(path, options);
  }

  server(path: string, _options: RequestHandlerOptions) {
    if (path !== "/server") return null;
    const { encoder, address, debug } = this.options;
    return serveJSON({ address, debug }, encoder);
  }

  auth(path: string, options: RequestHandlerOptions) {
    if (path !== "/auth") return null;
    const { encoder, auth } = this.options;
    const { req } = options;
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
    return serveJSON(
      {
        success: true
      },
      encoder
    );
  }
}
