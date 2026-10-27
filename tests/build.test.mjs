import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { buildAll, root } from "../scripts/build.mjs";
import { join } from "node:path";
test("offline bundle embeds one engine and every registered campus", async () => {
  const { combined, template, metadata } = await buildAll();
  const encoded = combined.match(
    /<script id="campus-data" type="application\/json">([\s\S]*?)<\/script>/,
  )[1];
  const payload = JSON.parse(encoded);
  assert.equal(payload.template, template);
  assert.equal(payload.schools.length, metadata.length);
  assert(!/<script[^>]+src=|<link[^>]+rel="stylesheet"/.test(template));
  assert.equal(
    (combined.match(/WebGLRenderer/g) || []).length,
    (JSON.stringify(template).match(/WebGLRenderer/g) || []).length,
    "Only one engine in the payload",
  );
  for (const school of metadata) {
    const html = await readFile(
      join(root, "dist", school.id.toUpperCase() + "-Playground.html"),
      "utf8",
    );
    assert(html.includes(`data-school="${school.id}"`));
    assert(!html.includes("{{schoolId}}"));
    for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g))
      new vm.Script(script);
  }
});
