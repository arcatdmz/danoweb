import { sep, Response, serve, Status } from "./deps.ts";

import { parseUrl, RequestHandlerOptions } from "./utils.ts";
import { serveFile } from "./io.ts";
import { BasicAuthHandler } from "./auth.ts";

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
const userDir = `${cwd() + sep}public`;
const systemDir = `${cwd() + sep}lib`;
const editorFile = `${systemDir + sep}editor.html`;
const notfoundFile = `${systemDir + sep}notfound.html`;
const encoder = new TextEncoder();
const auth = new BasicAuthHandler({ denolop: "test" });

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
  encoder,
  systemDir
});
const userFileHandler = new UserFileRequestHandler({
  encoder,
  userDir,
  auth
});

// main loop
async function main() {
  console.log("server ready at", address);
  console.log("user dir:", userDir);
  console.log("sysem dir:", systemDir);
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
    (await systemFileHandler.handle(path, options)) ||
    (await editorHandler.handle(path, options)) ||
    (await userFileHandler.handle(path, options));
  if (!res) {
    res = await serveFile(notfoundFile);
    res.status = Status.NotFound;
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
