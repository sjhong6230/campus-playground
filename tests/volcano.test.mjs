import test from "node:test";
import assert from "node:assert/strict";
import T from "../vendor/three.min.cjs";
import { createCampusFire } from "../src/effects/fire.js";
import { createCampusVolcano } from "../src/tools/volcano.js";

test("volcano: lifecycle, cancellation and damage invariants", () => {
  const root = new T.Group(),
    fire = createCampusFire(T, root);
  for (let i = 0; i < 200; i++) fire.fire(new T.Vector3(i, 0, 0), 1, i);
  fire.update(0.8);
  assert.equal(fire.stats().sources, 0);
  for (let k = 0; k < 200; k++) {
    for (let i = 0; i < 100; i++) fire.fire(new T.Vector3(i, 0, 0), 1, i);
    fire.update(0.05);
  }
  assert.equal(fire.stats().sources, 100);
  assert(fire.stats().smoke <= 384 && fire.stats().sparks <= 192);
  assert.equal(root.children.length, 4);
  fire.clear();
  assert.equal(fire.stats().smoke, 0);
  assert(root.children.every((m) => m.geometry.instanceCount === 0));
  const terrain = { heightAt: () => 6, volcano: () => {} },
    hits = [],
    fx = { fire: () => {}, ash: () => {} };
  let finished = 0;
  const v = createCampusVolcano(
    T,
    root,
    terrain,
    fx,
    (p, mode, power) => hits.push({ p, mode, power }),
    () => finished++,
  );
  v.start(new T.Vector3(0, 6, 0), 2);
  assert.equal(hits.length, 1);
  for (let i = 0; i < 170; i++) v.update(0.05);
  assert.equal(finished, 1);
  assert(!v.active());
  assert.equal(hits.filter((h) => h.mode === "volcanicBomb").length, 24);
  assert(hits.some((h) => h.mode === "lava"));
  assert(hits.every((h) => h.power === 2));
  const snap = v.snapshot(),
    count = hits.length;
  v.restore(snap);
  assert.equal(hits.length, count);
  v.update(1);
  assert.equal(hits.length, count);
  v.clear();
  assert.equal(root.children.length, 4);
  v.start(new T.Vector3(), 1);
  v.update(0.3);
  v.clear();
  const cancelled = hits.length;
  v.update(20);
  assert.equal(hits.length, cancelled);
  assert.equal(finished, 1);
  console.log(
    "Batched fire bounds/cleanup, 24 ballistic impacts, lava damage, frozen POWER, cooling restore and cancellation passed",
  );
});
