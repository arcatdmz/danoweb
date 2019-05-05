import { Response, extname, contentType } from "../deps.ts";

import { RequestHandlerOptions, RequestHandler } from "../utils.ts";
import { serveJSON } from "../io";

export interface APIRequestHandlerOptions {
  encoder: TextEncoder;
  address: string;
  environment: string;
  debug: boolean;
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

    const response: Response = this.server(path, options);
    if (!response) return null;

    const headers = new Headers();
    headers.set("content-type", contentType(extname(path)));
    response.headers = headers;
    return response;
  }

  server(path: string, _options: RequestHandlerOptions) {
    if (path !== "/server") return null;
    const { encoder, address, debug } = this.options;
    return serveJSON({ address, debug }, encoder);
  }
}
