if (Deno.args.length < 2) {
  console.error("provide target file path");
}
try {
  const stat = Deno.statSync(Deno.args[1]);
  console.log("stat", stat.name, stat.path);
  const lstat = Deno.lstatSync(Deno.args[1]);
  console.log("lstat", lstat.name, lstat.path);
} catch (e) {
  console.error("specified file not found");
}
