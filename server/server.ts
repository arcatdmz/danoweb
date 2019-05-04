import { Response, serve, Status } from "./deps.ts";

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
    // parse the request
    const { path, query } = parseUrl(req.url);
    const method = req.method.toLowerCase();
    const options: RequestHandlerOptions = {
      req,
      method,
      query
    };

    // handle the request
    let response: Response;
    switch (method) {
      case "get":
        response = await handleGet(path, options);
        break;
      case "put":
        response = await handlePut(path, options);
        break;
      default:
        response = {
          body: encoder.encode("Not implemented\n"),
          status: Status.NotImplemented
        };
        break;
    }
    req.respond(response);

    // verbose logging
    console.log(
      JSON.stringify({
        time: new Date(),
        method,
        path,
        query,
        status: response.status || Status.OK
      })
    );
  }
}

async function handleGet(path: string, options: RequestHandlerOptions) {
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
  return res;
}

async function handlePut(path: string, options: RequestHandlerOptions) {
  let res: Response = await userFileHandler.handle(path, options);
  if (!res) {
    res = {
      body: encoder.encode("Internal server error\n"),
      status: Status.InternalServerError
    };
  }
  return res;
}

main();
