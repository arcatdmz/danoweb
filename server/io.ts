/**
 * io.ts
 *
 * Utility methods involving disk I/O
 */
import { Response } from "https://deno.land/std/http/server.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";
import { extname } from "https://deno.land/std/fs/path.ts";
import { contentType } from "https://deno.land/std/media_types/mod.ts";

const { open, stat } = Deno;

export async function serveFile(filePath: string): Promise<Response> {
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
