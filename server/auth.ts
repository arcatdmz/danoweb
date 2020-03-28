import { ServerRequest } from "./deps.ts";

export interface AuthHandler {
  check(req: ServerRequest): boolean;
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
    const res = auth && /^Basic \s*([a-zA-Z0-9]+=*)\s*$/.exec(auth);
    if (!auth || !res) {
      throw new AuthError("authentication required");
    }
    let authenticated = false;
    try {
      const [username, password] = atob(res[1]).split(":", 2);
      authenticated = this.db[username] === password;
    } catch (e) {
      // do nothing
    }
    return authenticated;
  }
}
