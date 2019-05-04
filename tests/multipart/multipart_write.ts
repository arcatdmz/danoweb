import { MultipartWriter } from "../../server/deps.ts";

const { open } = Deno;

async function write() {
  const buf = new Deno.Buffer();
  const mw = new MultipartWriter(buf);
  await mw.writeField("field1", "deno");
  await mw.writeField("deno", "land");
  const file = await open("../../server/public/test.txt");
  await mw.writeFile("file", "test.txt", file);
  await mw.close();
  return buf;
}

write().then(buf => console.log(buf.toString()));
