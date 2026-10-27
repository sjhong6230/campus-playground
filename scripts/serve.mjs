import http from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
export function serve(port = Number(process.env.PORT) || 4173) {
  const root = fileURLToPath(new URL("../dist/", import.meta.url));
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      const file = resolve(
        root,
        "." + (pathname === "/" ? "/Campus-Playground.html" : pathname),
      );
      if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      const bytes = await readFile(file);
      res.writeHead(200, {
        "Content-Type":
          extname(file) === ".html"
            ? "text/html; charset=utf-8"
            : "application/json",
        "Cache-Control": "no-store",
      });
      res.end(bytes);
    } catch {
      res.writeHead(404);
      res.end("Not found. Run the build first.");
    }
  });
  server.listen(port, "127.0.0.1", () =>
    console.log(`Local: http://127.0.0.1:${port}`),
  );
  return server;
}
if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
)
  serve();
