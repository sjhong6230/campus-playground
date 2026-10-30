import test from "node:test";
import assert from "node:assert/strict";
import { createScoreStore } from "../src/core/scores.js";
import {
  createQualityController,
  resolutionRatio,
} from "../src/rendering/quality.js";
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
test("HSSH keeps the existing Hansung best score across the school ID rename", () => {
  const data = new Map([["hshs-playground-best", "900"]]);
  const storage = {
    getItem: (key) => data.get(key),
    setItem: (key, value) => data.set(key, value),
  };
  const hansung = createScoreStore("hssh", storage);
  assert.equal(hansung.read(), 900);
  hansung.write(1200);
  assert.equal(data.get("hshs-playground-best"), "1200");
  assert.equal(createScoreStore("hssh", storage).read(), 1200);
  assert.equal(createScoreStore("sshs", storage).read(), 0);
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
  assert.equal(renderer.shadowMap.autoUpdate, false);
  assert.equal(q.minimumFrameMs, 1000 / 60);
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
  assert.equal(q.minimumFrameMs, 1000 / 30);
  select.value = "high";
  select.onchange();
  assert.equal(renderer.shadowMap.enabled, true);
  assert(material.needsUpdate);
  assert(sun.shadow.needsUpdate);
  assert.equal(renderer.ratio, 1.6);
  assert.equal(q.shadowInterval, 0.08);
  assert.equal(dirty, 2);
  canvas.clientWidth = 3840;
  canvas.clientHeight = 2160;
  q.resize();
  assert(
    canvas.clientWidth * canvas.clientHeight * renderer.ratio ** 2 <= 4_000_001,
  );
});

test("desktop resolution has a pixel budget, including after resize", () => {
  for (const [w, h] of [
    [1920, 1080],
    [2560, 1440],
    [3840, 2160],
  ]) {
    const ratio = resolutionRatio(w, h, 2, 1, "auto");
    assert(w * h * ratio ** 2 <= 1_800_001);
    assert.equal(resolutionRatio(w, h, 2, 0.6, "auto"), ratio * 0.6);
  }
  assert.equal(resolutionRatio(390, 844, 3, 1, "auto"), 1.25);
  assert.equal(resolutionRatio(1280, 720, 1, 1, "auto"), 1);
});
test("catalog shortcuts are unique and all tools have start actions", () => {
  assert.equal(new Set(tools.map((t) => t.id)).size, tools.length);
  assert.equal(new Set(tools.map((t) => t.key)).size, tools.length);
  assert.deepEqual(
    Object.keys(createToolActions({})).sort(),
    tools.map((t) => t.id).sort(),
  );
});
