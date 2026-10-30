import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { buildAll, root } from "../scripts/build.mjs";
import { join } from "node:path";
test("offline bundle embeds one engine and every registered campus", async () => {
  const { combined, template, metadata } = await buildAll();
  assert.equal(await readFile(join(root, "dist/index.html"), "utf8"), combined);
  const encoded = combined.match(
    /<script id="campus-data" type="application\/json">([\s\S]*?)<\/script>/,
  )[1];
  const payload = JSON.parse(encoded);
  assert.equal(payload.template, template);
  assert.equal(payload.schools.length, metadata.length);
  assert(!/<script[^>]+src=|<link[^>]+rel="stylesheet"/.test(template));
  for (const page of [combined, template]) {
    assert(page.includes('id="site-notice"'));
    assert(page.includes("data-open-notice"));
    assert(page.includes("connect-src 'none'"));
    assert(page.includes('name="referrer" content="no-referrer"'));
    assert(!page.includes("<!-- SITE_NOTICE -->"));
    assert(!page.includes("<!-- THREE_LICENSE -->"));
  }
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
    const notice = html.match(/<dialog id="site-notice"[\s\S]*?<\/dialog>/)[0];
    assert(notice.includes("Copyright © 2010-2023 three.js authors"));
    assert(notice.includes("Permission is hereby granted"));
    assert(notice.includes("issues/new?template=rights.yml"));
    assert(notice.includes("IP 주소"));
    for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g))
      new vm.Script(script);
  }
});
