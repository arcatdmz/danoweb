/**
 * utils.ts
 *
 * Utility methods and types
 */
import { ServerRequest, Response } from "https://deno.land/std/http/server.ts";

/**
 * Parse request url to return request path and query parameters
 */
export function parseUrl(url: string) {
  // split the url by ?
  const paths = url.split("?");

  // remove the trailing slash
  const path = paths[0].replace(/\/$/, "");

  // parse the query string
  let query: QueryParameters = {};
  if (paths.length > 1) {
    paths[1].split("&").forEach(q_ => {
      const q = q_.split("=");
      if (q.length < 2) {
        query[decodeURIComponent(q[0])] = null;
      } else {
        const [key, value] = q;
        query[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });
  }

  // return the parsed results
  return { path, query };
}

/**
 * Query parameters
 */
export interface QueryParameters {
  [key: string]: string;
}

/**
 * Request handler
 */
export interface RequestHandler {
  handle(path: string, options?: RequestHandlerOptions): Promise<Response>;
}

/**
 * Option parameter for request handlers
 */
export interface RequestHandlerOptions {
  req: ServerRequest;
  method: string;
  query: QueryParameters;
}
