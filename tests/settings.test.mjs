import test from "node:test";
import assert from "node:assert/strict";
import { createScoreStore } from "../src/core/scores.js";
import { createQualityController } from "../src/rendering/quality.js";
import { tools } from "../src/tools/catalog.js";
import { createToolActions } from "../src/tools/actions.js";
test("scores retain legacy keys and cannot cross school boundaries", () => {
  const data = new Map([["sshs-playground-best", "900"]]);
  const storage = {
    getItem: (k) => data.get(k),
    setItem: (k, v) => data.set(k, v),
  };
  const seoul = createScoreStore("sshs", storage),
    incheon = createScoreStore("ishs", storage);
  assert.equal(seoul.read(), 900);
  assert.equal(incheon.read(), 0);
  incheon.write(1200);
  assert.equal(seoul.read(), 900);
  assert.equal(incheon.read(), 1200);
  seoul.write(1500);
  assert.equal(incheon.read(), 1200);
  assert.equal(seoul.read(), 1500);
  const blocked = createScoreStore("blocked", {
    getItem() {
      throw Error();
    },
    setItem() {
      throw Error();
    },
  });
  assert.equal(blocked.read(), 0);
  assert.doesNotThrow(() => blocked.write(1));
});
test("quality adaptation and low/high shadow restoration", () => {
  globalThis.devicePixelRatio = 2;
  globalThis.localStorage = { getItem: () => null, setItem: () => {} };
  const renderer = {
    ratio: 1,
    shadowMap: {},
    setPixelRatio(n) {
      this.ratio = n;
    },
    getPixelRatio() {
      return this.ratio;
    },
    info: { render: { calls: 20 } },
  };
  const material = { needsUpdate: false },
    scene = { traverse: (fn) => fn({ material }) },
    sun = { shadow: {} },
    select = {},
    canvas = { dataset: {} };
  let dirty = 0,
    time = 0;
  const q = createQualityController({
    T: { PCFSoftShadowMap: 2 },
    renderer,
    scene,
    sun,
    select,
    canvas,
    toast: () => {},
    onShadowDirty: () => dirty++,
    getTime: () => time,
  });
  assert.equal(renderer.ratio, 1.25);
  assert.equal(q.minimumFrameMs, 14);
  for (let i = 0; i < 60; i++) {
    time += 0.1;
    q.record(0.1, time);
  }
  assert(renderer.ratio < 1.25);
  assert(q.shadowInterval >= 0.16);
  assert.equal(canvas.dataset.fps, 10);
  select.value = "low";
  select.onchange();
  assert.equal(renderer.shadowMap.enabled, false);
  assert.equal(q.minimumFrameMs, 29);
  select.value = "high";
  select.onchange();
  assert.equal(renderer.shadowMap.enabled, true);
  assert(material.needsUpdate);
  assert(sun.shadow.needsUpdate);
  assert.equal(renderer.ratio, 1.6);
  assert.equal(q.shadowInterval, 0.08);
  assert.equal(dirty, 2);
});
test("catalog shortcuts are unique and all tools have start actions", () => {
  assert.equal(new Set(tools.map((t) => t.id)).size, tools.length);
  assert.equal(new Set(tools.map((t) => t.key)).size, tools.length);
  assert.deepEqual(
    Object.keys(createToolActions({})).sort(),
    tools.map((t) => t.id).sort(),
  );
});
