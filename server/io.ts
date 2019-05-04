/**
 * io.ts
 *
 * Utility methods involving disk I/O
 */
import { Response, Status, extname, sep, contentType } from "./deps.ts";

const { open, stat } = Deno;

export async function serveFile(filePath: string): Promise<Response> {
  filePath = filePath.replace(/\//g, sep);
  const mediaType = contentType(extname(filePath)) || "text/plain";
  const file = await open(filePath);
  const fileInfo = await stat(filePath);
  const headers = new Headers();
  headers.set("content-length", fileInfo.len.toString());
  headers.set("content-type", mediaType);
  return {
    body: file,
    status: Status.OK,
    headers
  };
}
