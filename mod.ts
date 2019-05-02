import {
  ServerRequest,
  Response,
  serve
} from "https://deno.land/std/http/server.ts";
import { extname } from "https://deno.land/std/fs/path.ts";
import { contentType } from "https://deno.land/std/media_types/mod.ts";

const { cwd, stat, open } = Deno;

const currentDir = `${cwd()}/src`;
const s = serve("127.0.0.1:8000");

async function main() {
  for await (const req of s) {
    const fileName = req.url.replace(/\/$/, "");
    const filePath = currentDir + fileName;
    let response: Response;
    try {
      const fileInfo = await stat(filePath);
      if (fileInfo.isDirectory()) {
        response = {
          body: new TextEncoder().encode("Directory listing prohibited\n"),
          status: 403
        };
      } else {
        response = await serveFile(req, filePath);
      }
    } catch (e) {
      response = {
        body: new TextEncoder().encode("File not found\n"),
        status: 404
      };
    } finally {
      req.respond(response);
    }
  }
}

async function serveFile(
  req: ServerRequest,
  filename: string
): Promise<Response> {
  const file = await open(filename);
  const fileInfo = await stat(filename);
  const headers = new Headers();
  headers.set("content-length", fileInfo.len.toString());
  headers.set("content-type", contentType(extname(filename)) || "text/plain");
  const res = {
    status: 200,
    body: file,
    headers
  };
  return res;
}

main();
