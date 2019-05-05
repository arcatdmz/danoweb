import { config, resolve, sep, Response, serve, Status } from "./deps.ts";

import { parseUrl, RequestHandlerOptions } from "./utils.ts";
import { serveFile, serveJSON } from "./io.ts";
import { BasicAuthHandler } from "./auth.ts";

import { APIRequestHandler } from "./handlers/api.ts";
import { EditorRequestHandler } from "./handlers/editor.ts";
import { SystemFileRequestHandler } from "./handlers/systemFile.ts";
import { UserFileRequestHandler } from "./handlers/userFile.ts";

// load .env and get environment variables
const dotenv = config({ export: true });
const { cwd, env: env_ } = Deno;
const env = env_();

// start the web server
const address = `127.0.0.1:${env.PORT || 8000}`;
const s = serve(address);

// prepare stuff
const environment = env.DENO_ENV;
const debug = environment === "development";
const systemPath = "/lib";
const userDir =
  (typeof dotenv.USER_DIR === "string" && resolve(dotenv.USER_DIR)) ||
  `${cwd() + sep}public`;
const systemDir = `${cwd() + sep}lib`;
const editorFile = `${systemDir + sep}editor.html`;
const notfoundFile = `${systemDir + sep}notfound.html`;
const encoder = new TextEncoder();
const auth = new BasicAuthHandler({ danoweb: "test" });

// setup request handlers
const apiHandler = new APIRequestHandler({
  encoder,
  address,
  environment,
  debug,
  auth,
  systemPath
});
const editorHandler = new EditorRequestHandler({
  encoder,
  userDir,
  editorFile
});
const systemFileHandler = new SystemFileRequestHandler({
  encoder,
  systemDir,
  systemPath
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
    let res: Response;
    switch (method) {
      case "get":
        res = await handleGet(path, options);
        break;
      case "post":
        res = await handlePost(path, options);
        break;
      case "put":
        res = await handlePut(path, options);
        break;
      default:
        res = serveJSON(
          {
            error: "not implemented\n"
          },
          encoder
        );
        res.status = Status.NotImplemented;
        break;
    }
    req.respond(res);

    // verbose logging
    console.log(
      JSON.stringify({
        time: new Date(),
        method,
        path,
        query,
        status: res.status || Status.OK
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

async function handlePost(path: string, options: RequestHandlerOptions) {
  let res: Response = await apiHandler.handle(path, options);
  if (!res) {
    res = serveJSON(
      {
        error: "not found"
      },
      encoder
    );
    res.status = Status.NotFound;
  }
  return res;
}

async function handlePut(path: string, options: RequestHandlerOptions) {
  let res: Response = await userFileHandler.handle(path, options);
  if (!res) {
    res = serveJSON(
      {
        error: "internal server error"
      },
      encoder
    );
    res.status = Status.InternalServerError;
  }
  return res;
}

main();
