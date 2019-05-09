/**
 * Tar test
 *
 * create output.tar in the current directory containing output.txt and dir/output2.txt.
 */

import { Tar } from "./tar.ts";

const encoder = new TextEncoder();

const tar = new Tar();
tar.append("output.txt", encoder.encode("hello tar world!"));
const out = tar.append(
  "dir/output2.txt",
  encoder.encode("this is a file in a directory")
);

Deno.writeFileSync("output.tar", out, { create: true });
