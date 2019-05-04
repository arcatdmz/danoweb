import { Status } from "../deps.ts";

import { RequestHandlerOptions, RequestHandler } from "../utils.ts";
import { serveFile } from "../io.ts";

const { stat } = Deno;

export interface UserFileRequestHandlerOptions {
  encoder: TextEncoder;
  userDir: string;
}

/**
 * Serve user files
 */
export class UserFileRequestHandler implements RequestHandler {
  private options: UserFileRequestHandlerOptions;

  constructor(options: UserFileRequestHandlerOptions) {
    this.options = options;
  }

  async handle(path: string, options: RequestHandlerOptions) {
    switch (options.method) {
      case "get":
        return this.handleGet(path, options);
      default:
        return null;
    }
  }

  async handleGet(path: string, _options: RequestHandlerOptions) {
    const { userDir, encoder } = this.options;
    const filePath = userDir + path;
    try {
      const fileInfo = await stat(filePath);
      if (fileInfo.isDirectory()) {
        return {
          body: encoder.encode("Directory listing prohibited\n"),
          status: Status.Unauthorized
        };
      }
      return await serveFile(filePath);
    } catch (e) {
      return null;
    }
  }
}

/**
 * code from https://github.com/denoland/deno_std/blob/master/http/server.ts#L133
 * @param it
 */
async function readAllIterator(
  it: AsyncIterableIterator<Uint8Array>
): Promise<Uint8Array> {
  const chunks = [];
  let len = 0;
  for await (const chunk of it) {
    chunks.push(chunk);
    len += chunk.length;
  }
  if (chunks.length === 0) {
    // No need for copy
    return chunks[0];
  }
  const collected = new Uint8Array(len);
  let offset = 0;
  for (let chunk of chunks) {
    collected.set(chunk, offset);
    offset += chunk.length;
  }
  return collected;
}
