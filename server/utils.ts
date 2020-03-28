/**
 * utils.ts
 *
 * Utility methods and types
 */
import { config, ServerRequest, Response } from "./deps.ts";

/**
 * Get environment variables
 * @param clientVars variable names to be passed to the browser
 */
export function getEnv(clientVars: string[]) {
  // load .env and get environment variables
  try {
    config({ export: true });
  } catch (e) {
    // do nothing
  }
  const { env: env_ } = Deno;
  const env = env_();
  const clientEnv = Object.keys(env)
    .filter((key) => clientVars.includes(key))
    .reduce<typeof env>((obj, key) => {
      obj[key] = env[key];
      return obj;
    }, {});
  return { env, clientEnv };
}

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
    paths[1].split("&").forEach((q_) => {
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
  [key: string]: string | null;
}

/**
 * Request handler
 */
export interface RequestHandler {
  handle(
    path: string,
    options?: RequestHandlerOptions
  ): Promise<Response | null>;
}

/**
 * Option parameter for request handlers
 */
export interface RequestHandlerOptions {
  req: ServerRequest;
  method: string;
  query: QueryParameters;
}
