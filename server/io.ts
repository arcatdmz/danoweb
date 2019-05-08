/**
 * io.ts
 *
 * I/O-related utility methods and classes
 */
import {
  Response,
  Status,
  extname,
  sep,
  posix,
  win32,
  ensureDir,
  move,
  contentType,
  FormFile
} from "./deps.ts";

const { open, stat, writeFile } = Deno;

export function serveHead(filePath?: string, fileInfo?: Deno.FileInfo) {
  const headers = new Headers();
  if (filePath && fileInfo) {
    const mediaType = contentType(extname(filePath));
    headers.set("content-length", fileInfo.len.toString());
    headers.set("content-type", mediaType);
  }
  return {
    body: null,
    status: fileInfo ? Status.OK : Status.NotFound,
    headers
  };
}

export async function serveFile(
  filePath: string,
  fileInfo?: Deno.FileInfo
): Promise<Response> {
  filePath = filePath.replace(/\//g, sep);
  const mediaType = contentType(extname(filePath)) || "text/plain";
  const file = await open(filePath);
  if (!fileInfo) fileInfo = await stat(filePath);
  const headers = new Headers();
  headers.set("content-length", fileInfo.len.toString());
  headers.set("content-type", mediaType);
  return {
    body: file,
    status: Status.OK,
    headers
  };
}

export function serveJSON(json: any, encoder: TextEncoder): Response {
  const body = encoder.encode(JSON.stringify(json));
  const headers = new Headers();
  headers.set("content-length", body.byteLength.toString());
  headers.set("content-type", "application/json");
  return {
    body,
    headers
  };
}

export function serveHeadOfResponse(res: Response) {
  const { status, headers } = res;
  return {
    body: null,
    status,
    headers
  };
}

export function redirect(redirect: string, encoder: TextEncoder) {
  const res = serveJSON(
    {
      success: true,
      redirect
    },
    encoder
  );
  const headers = new Headers();
  headers.set("location", redirect);
  res.headers = headers;
  res.status = Status.PermanentRedirect;
  return res;
}

export async function saveFormFile(formFile: FormFile, path: string) {
  // ensure that the parent directory exists
  const { dirname } = sep === "\\" ? win32 : posix;
  await ensureDir(dirname(path));

  // save the file
  if (formFile.tempfile) {
    return move(formFile.tempfile, path, { overwrite: true });
  } else {
    return writeFile(path, formFile.content, { create: true });
  }
}

export class Uint8ArrayReader implements Deno.Reader {
  private offset: number;
  private arr: Uint8Array;

  constructor(arr: Uint8Array) {
    this.arr = arr;
    this.offset = 0;
  }

  async read(p: Uint8Array): Promise<Deno.ReadResult> {
    const n = Math.min(p.byteLength, this.arr.byteLength - this.offset);
    p.set(this.arr.slice(this.offset, this.offset + n));
    this.offset += n;
    return { nread: n, eof: this.offset === this.arr.byteLength };
  }
}

export class StreamReader {
  private stream: AsyncIterableIterator<Uint8Array>;
  private chunk: IteratorResult<Uint8Array>;
  private chunkOffset: number;

  constructor(stream: AsyncIterableIterator<Uint8Array>) {
    this.stream = stream;
  }

  async read(p: Uint8Array): Promise<Deno.ReadResult> {
    let { stream, chunk, chunkOffset } = this;
    if (!chunk) {
      this.chunk = chunk = await stream.next();
      this.chunkOffset = chunkOffset = 0;
    }
    let nread: number;
    if (chunk.value) {
      const chunkLeft = chunk.value.byteLength - chunkOffset;
      nread = Math.min(p.byteLength, chunkLeft);
      if (nread > 0) p.set(chunk.value);
      const nothingLeft = chunkOffset + chunkLeft >= chunk.value.byteLength;
      if (nothingLeft) {
        this.chunk = null;
        this.chunkOffset = 0;
      }
    } else {
      nread = 0;
    }
    this.chunkOffset += nread;
    const eof = chunk.done;
    return { nread, eof };
  }
}
