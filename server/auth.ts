import { ServerRequest } from "./deps.ts";

export interface AuthHandler {
  check(req: ServerRequest);
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export interface BasicAuthDb {
  [username: string]: string;
}

export class BasicAuthHandler implements AuthHandler {
  private db: BasicAuthDb;
  constructor(db: BasicAuthDb) {
    this.db = db;
  }
  check(req: ServerRequest) {
    const auth = req.headers.get("authorization");
    if (!auth || !/^Basic \s*[a-zA-Z0-9]+=*\s*$/.test(auth)) {
      throw new AuthError("authentication required");
    }
    let authenticated = false;
    try {
      const [username, password] = atob(
        /^Basic \s*([a-zA-Z0-9]+=*)\s*$/.exec(auth)[1]
      ).split(":", 2);
      authenticated = this.db[username] === password;
    } catch (e) {
      // do nothing
    }
    return authenticated;
  }
}
