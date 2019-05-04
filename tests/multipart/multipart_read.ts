import { MultipartReader } from "../../server/deps.ts";

const { open } = Deno;

async function read() {
  const f = await open("./multipart.txt");
  const mr = new MultipartReader(
    f,
    "--------------------------379547176858933057039353"
  );
  const result = await mr.readForm(20);
  return result["deno"]; // => land
}

read().then(res => console.log(res));
