import {
  ServerRequest,
  Response,
  serve
} from "https://deno.land/std/http/server.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";
import { extname } from "https://deno.land/std/fs/path.ts";
import { contentType } from "https://deno.land/std/media_types/mod.ts";

interface QueryParameters {
  [key: string]: string;
}

const { cwd, env, open, stat } = Deno;

const debug = env()["DENO_ENV"] === "development";
const userDir = `${cwd()}/public`;
const systemDir = `${cwd()}/lib`;
const editorFile = `${systemDir}/editor.html`;
const address = "127.0.0.1:8000";
const s = serve(address);
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

  // parse request path
  const reqPath = paths[0].replace(/\/$/, "");

  // handle API request
  if (reqPath.indexOf("/api/") === 0) {
    const api = handleAPIRequest(req, reqPath.substr("/api".length), query);
    if (api) return api;
  }

  // handle edit request
  if (query.mode === "edit") {
    return serveEditor(req, reqPath);
  }

  // serve a file
  return (await serveSystemFile(req, reqPath)) || serveUserFile(req, reqPath);
}

function handleAPIRequest(
  req: ServerRequest,
  reqPath: string,
  query: QueryParameters
) {
  let response: Response;
  if (reqPath === "/server") {
    response = {
      body: te.encode(JSON.stringify({ address, debug }))
    };
  }
  if (response) {
    const headers = new Headers();
    headers.set("content-type", contentType(extname(reqPath)));
    response.headers = headers;
    return req.respond(response);
  }
  return null;
}

async function serveSystemFile(req: ServerRequest, reqPath: string) {
  if (reqPath.indexOf("/lib/") !== 0) return false;
  const filePath = systemDir + reqPath.substr("/lib".length);
  try {
    const fileInfo = await stat(filePath);
    if (fileInfo.isDirectory()) {
      return serveSystemFile(
        req,
        (reqPath.substr(-1) === "/" ? "" : "/") + "index.html"
      );
    }
    await req.respond(await serveFile(filePath));
    return true;
  } catch (e) {
    return false;
  }
}

async function serveUserFile(req: ServerRequest, reqPath: string) {
  const filePath = userDir + reqPath;
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

async function serveEditor(req: ServerRequest, reqPath: string) {
  const filePath = userDir + reqPath;
  let response: Response;
  try {
    const fileInfo = await stat(filePath);
    if (fileInfo.isDirectory()) {
      response = {
        body: te.encode("Directory listing prohibited\n"),
        status: Status.Unauthorized
      };
    } else {
      response = await serveFile(editorFile);
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
