/**
 * io.ts
 *
 * I/O-related utility methods and classes
 */
import { Response, Status, extname, sep, contentType } from "./deps.ts";

const { open, stat } = Deno;

export async function serveFile(filePath: string): Promise<Response> {
  filePath = filePath.replace(/\//g, sep);
  const mediaType = contentType(extname(filePath)) || "text/plain";
  const file = await open(filePath);
  const fileInfo = await stat(filePath);
  const headers = new Headers();
  headers.set("content-length", fileInfo.len.toString());
  headers.set("content-type", mediaType);
  return {
    body: file,
    status: Status.OK,
    headers
  };
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
