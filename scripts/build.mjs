import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve, join } from "node:path";
import { build } from "esbuild";
import { schools } from "../src/schools/index.js";
import { validateSchools } from "../src/schools/validate.js";

export const root = fileURLToPath(new URL("../", import.meta.url));
const read = (file) => readFile(join(root, file), "utf8");
const safeScript = (text) => text.replace(/<\/script/gi, "<\\/script");
export async function buildAll() {
  validateSchools(schools);
  const compile = async (entry) => {
    const result = await build({
      absWorkingDir: root,
      entryPoints: [entry],
      bundle: true,
      write: false,
      format: "iife",
      target: "es2022",
      legalComments: "inline",
    });
    return result.outputFiles[0].text;
  };
  const [
    gameJS,
    lobbyJS,
    gameCSS,
    lobbyCSS,
    vendor,
    license,
    gameHTML,
    lobbyHTML,
  ] = await Promise.all([
    compile("src/main.js"),
    compile("src/ui/lobby.js"),
    read("src/styles/game.css"),
    read("src/styles/lobby.css"),
    read("vendor/three.min.cjs"),
    read("vendor/THREE-LICENSE.txt"),
    read("src/ui/game.html"),
    read("src/ui/lobby.html"),
  ]);
  const template = gameHTML
    .replace("/* GAME_CSS */", () => gameCSS)
    .replace("/* VENDOR_JS */", () => safeScript(vendor))
    .replace("/* GAME_JS */", () => safeScript(gameJS))
    .replace(
      "<head>",
      () => "<head>\n<!-- Three.js license:\n" + license + "\n-->",
    );
  const metadata = schools.map(
    ({ createLayout, paintGround, ...meta }) => meta,
  );
  const data = JSON.stringify({ schools: metadata, template }).replace(
    /</g,
    "\\u003c",
  );
  const combined = lobbyHTML
    .replace("/* LOBBY_CSS */", () => lobbyCSS)
    .replace("/* CAMPUS_DATA */", () => data)
    .replace("/* LOBBY_JS */", () => safeScript(lobbyJS));
  await mkdir(join(root, "dist"), { recursive: true });
  await writeFile(join(root, "dist/Campus-Playground.html"), combined);
  for (const school of schools)
    await writeFile(
      join(root, "dist", school.id.toUpperCase() + "-Playground.html"),
      template.replaceAll("{{schoolId}}", school.id),
    );
  await writeFile(
    join(root, "dist/build-info.json"),
    JSON.stringify(
      {
        schools: schools.map((s) => s.id),
        combinedBytes: Buffer.byteLength(combined),
        engineCopies: 1,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Built ${schools.length} schools; shared engine once; ${(Buffer.byteLength(combined) / 1024 / 1024).toFixed(2)} MiB`,
  );
  return { combined, template, metadata };
}
if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
)
  await buildAll();
