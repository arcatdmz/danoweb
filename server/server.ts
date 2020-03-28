import { resolve, sep, Response, serve, Status } from "./deps.ts";

import { getEnv, parseUrl, RequestHandlerOptions } from "./utils.ts";
import { serveFile, serveJSON } from "./io.ts";
import { BasicAuthHandler } from "./auth.ts";

import { APIRequestHandler } from "./handlers/api.ts";
import { EditorRequestHandler } from "./handlers/editor.ts";
import { SystemFileRequestHandler } from "./handlers/systemFile.ts";
import { UserFileRequestHandler } from "./handlers/userFile.ts";

const { cwd } = Deno;

// get environment variables
const { env, clientEnv } = getEnv([
  "DENO_ENV",
  "API_KEY",
  "AUTH_DOMAIN",
  "DATABASE_URL",
  "PROJECT_ID",
  "STORAGE_BUCKET",
  "MESSAGING_SENDER_ID",
  "APP_ID",
  "DATABASE_PREFIX"
]);

// start the web server
const address = `${env.HOST || "127.0.0.1"}:${env.PORT || 8000}`;
const s = serve(address);

// prepare stuff
const debug = env.DENO_ENV === "development";
const systemPath = "/lib";
const userDir =
  (typeof env.USER_DIR === "string" && resolve(env.USER_DIR)) ||
  `${cwd() + sep}public`;
const systemDir = `${cwd() + sep}lib`;
const editorFile = `${systemDir + sep}editor.html`;
const notfoundFile = `${systemDir + sep}notfound.html`;
const encoder = new TextEncoder();
const auth = new BasicAuthHandler({ danoweb: env.USER_PASSWORD || "test" });

// setup request handlers
const apiHandler = new APIRequestHandler({
  encoder,
  address,
  env: clientEnv,
  debug,
  auth,
  userDir,
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
    let res: Response | null;
    switch (method) {
      case "head":
        res = await handleHead(path, options);
        break;
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

async function handleHead(path: string, options: RequestHandlerOptions) {
  let res: Response | null =
    (await systemFileHandler.handle(path, options)) ||
    (await userFileHandler.handle(path, options));
  if (!res) {
    res = serveJSON(
      {
        error: "not implemented\n"
      },
      encoder
    );
    res.status = Status.NotImplemented;
  }
  return res;
}

async function handleGet(path: string, options: RequestHandlerOptions) {
  let res: Response | null =
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
  let res: Response | null = await apiHandler.handle(path, options);
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
  let res: Response | null = await userFileHandler.handle(path, options);
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
