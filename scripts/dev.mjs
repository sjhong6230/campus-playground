import { watch } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "./serve.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
// A fresh process reloads school modules too; no stale ESM registry during edits.
function rebuild() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["scripts/build.mjs"], {
      cwd: root,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error("Build failed")),
    );
  });
}
await rebuild();
const server = serve();
let timer,
  running = false,
  dirty = false;
async function schedule() {
  if (running) {
    dirty = true;
    return;
  }
  running = true;
  do {
    dirty = false;
    try {
      await rebuild();
      console.log("Reload the browser to see changes.");
    } catch (error) {
      console.error(error.message);
    }
  } while (dirty);
  running = false;
}
const watchers = ["src", "vendor"].map((dir) =>
  watch(join(root, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(schedule, 150);
  }),
);
process.on("SIGINT", () => {
  clearTimeout(timer);
  watchers.forEach((w) => w.close());
  server.close();
  process.exit(0);
});
