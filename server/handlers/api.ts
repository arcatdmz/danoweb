import { Status, Response, sep } from "../deps.ts";

import { RequestHandlerOptions, RequestHandler } from "../utils.ts";
import { serveJSON } from "../io.ts";
import { AuthHandler } from "../auth.ts";
import { Tar } from "../tar.ts";

export interface APIRequestHandlerOptions {
  encoder: TextEncoder;
  address: string;
  env: { [index: string]: string };
  debug: boolean;
  auth: AuthHandler;
  userDir: string;
  systemPath: string;
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
    const pathPrefix = this.options.systemPath + "/api";
    if (path.indexOf(`${pathPrefix}/`) !== 0) return null;
    path = path.substr(pathPrefix.length);

    return (
      this.info(path, options) ||
      this.auth(path, options) ||
      this.download(path, options)
    );
  }

  info(path: string, _options: RequestHandlerOptions) {
    if (path !== "/info") return null;
    const { encoder, address, debug, env } = this.options;
    return serveJSON({ address, debug, env }, encoder);
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

  async download(path: string, options: RequestHandlerOptions) {
    if (path !== "/download") return null;
    const { encoder, auth, userDir } = this.options;
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

    const headers = new Headers();
    headers.set("content-type", "application/tar");
    headers.set("content-disposition", 'attachment;filename="danoweb.tar"');

    const tar = new Tar(),
      dirs = [userDir],
      promises: Promise<void>[] = [];
    while (dirs.length > 0) {
      const dir = dirs.pop() as string;
      for (const item of await Deno.readdir(dir)) {
        const filePath = dir + sep + item.name;
        if (item.isDirectory()) {
          dirs.push(filePath);
        } else {
          const relativePath = filePath
            .substr(userDir.length + 1)
            .split(sep)
            .join("/");
          promises.push(
            tar.append(relativePath, {
              filePath
            })
          );
        }
      }
    }
    await Promise.all(promises);
    const body = tar.getReader();
    return {
      body,
      headers
    } as Response;
  }
}
