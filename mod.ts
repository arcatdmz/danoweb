import {
  ServerRequest,
  Response,
  serve
} from "https://deno.land/std/http/server.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";
import { extname } from "https://deno.land/std/fs/path.ts";
import { contentType } from "https://deno.land/std/media_types/mod.ts";

const { cwd, stat, open } = Deno;

const userDir = `${cwd()}/src`;
const systemDir = `${cwd()}/lib`;
const s = serve("127.0.0.1:8000");
const te = new TextEncoder();

async function main() {
  for await (const req of s) {
    switch (req.method.toLowerCase()) {
      case "post":
        req.respond({
          body: te.encode("Not implemented\n"),
          status: Status.NotImplemented
        });
        break;
      case "get":
        handleGet(req);
        break;
    }
  }
}

async function handleGet(req: ServerRequest) {
  // parse query string
  const paths = req.url.split("?");
  let query: { [key: string]: string } = {};
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

  // parse file name
  const fileName = paths[0].replace(/\/$/, "");
  return (await serveSystemFile(req, fileName)) || serveUserFile(req, fileName);
}

async function serveSystemFile(req: ServerRequest, fileName: string) {
  const filePath = `${systemDir}/${fileName}`;
  try {
    const fileInfo = await stat(filePath);
    if (fileInfo.isDirectory()) {
      return serveSystemFile(
        req,
        (fileName.substr(-1) === "/" ? "" : "/") + "index.html"
      );
    }
    await req.respond(await serveFile(filePath));
    return true;
  } catch (e) {
    return false;
  }
}

async function serveUserFile(req: ServerRequest, fileName: string) {
  const filePath = `${userDir}/${fileName}`;
  let response: Response;
  try {
    const fileInfo = await stat(filePath);
    if (fileInfo.isDirectory()) {
      response = {
        body: te.encode("Directory listing prohibited\n"),
        status: Status.Unauthorized
      };
    } else {
      response = await serveFile(filePath);
    }
  } catch (e) {
    response = {
      body: te.encode("File not found\n"),
      status: Status.NotFound
    };
  } finally {
    req.respond(response);
  }
}

async function serveFile(filePath: string): Promise<Response> {
  const mediaType = contentType(extname(filePath)) || "text/plain";
  const file = await open(filePath);
  const fileInfo = await stat(filePath);
  const headers = new Headers();
  headers.set("content-length", fileInfo.len.toString());
  headers.set("content-type", mediaType);
  const res = {
    body: file,
    status: Status.OK,
    headers
  };
  return res;
}

main();
