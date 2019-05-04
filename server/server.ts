import {
  ServerRequest,
  Response,
  serve
} from "https://deno.land/std/http/server.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";

import { parseUrl, RequestHandlerOptions } from "./utils.ts";

import { APIRequestHandler } from "./handlers/api.ts";
import { EditorRequestHandler } from "./handlers/editor.ts";
import { SystemFileRequestHandler } from "./handlers/systemFile.ts";
import { UserFileRequestHandler } from "./handlers/userFile.ts";

const { cwd, env } = Deno;

// start the web server
const address = "127.0.0.1:8000";
const s = serve(address);

// prepare stuff
const environment = env()["DENO_ENV"];
const debug = environment === "development";
const userDir = `${cwd()}/public`;
const systemDir = `${cwd()}/lib`;
const editorFile = `${systemDir}/editor.html`;
const encoder = new TextEncoder();

// setup request handlers
const apiHandler = new APIRequestHandler({
  encoder,
  address,
  environment,
  debug
});
const editorHandler = new EditorRequestHandler({
  encoder,
  userDir,
  editorFile
});
const systemFileHandler = new SystemFileRequestHandler({
  systemDir
});
const userFileHandler = new UserFileRequestHandler({
  encoder,
  userDir
});

// main loop
async function main() {
  for await (const req of s) {
    switch (req.method.toLowerCase()) {
      case "get":
        handleGet(req);
        break;
      default:
        req.respond({
          body: encoder.encode("Not implemented\n"),
          status: Status.NotImplemented
        });
        break;
    }
  }
}

async function handleGet(req: ServerRequest) {
  const { path, query } = parseUrl(req.url);
  const options: RequestHandlerOptions = {
    req,
    query
  };
  let res: Response =
    (await apiHandler.handle(path, options)) ||
    (await editorHandler.handle(path, options)) ||
    (await systemFileHandler.handle(path, options)) ||
    (await userFileHandler.handle(path, options));
  if (!res) {
    res = {
      body: encoder.encode("File not found\n"),
      status: Status.NotFound
    };
  }
  return req.respond(res);
}

main();
