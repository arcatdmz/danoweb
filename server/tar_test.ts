/**
 * Tar test
 *
 * create output.tar in the current directory containing output.txt and dir/tar.ts.
 */

import { Uint8ArrayReader } from "./io.ts";
import { Tar, FileWriter } from "./tar.ts";

const encoder = new TextEncoder();

const tar = new Tar();
const content = encoder.encode("hello tar world!");
tar
  .append("output.txt", {
    reader: new Uint8ArrayReader(content),
    contentSize: content.byteLength,
  })
  .then(() =>
    tar.append("dir/tar.ts", {
      filePath: "./tar.ts",
    })
  )
  .then(async () => {
    const writer = new FileWriter("output.tar");
    const wrote = await Deno.copy(writer, tar.getReader());
    console.log("wrote", wrote, "bytes");
    writer.dispose();
  });
