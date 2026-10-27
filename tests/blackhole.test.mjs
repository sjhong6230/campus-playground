import test from "node:test";
import assert from "node:assert/strict";
import T from "../vendor/three.min.cjs";
import { CampusBlackHole } from "../src/tools/blackhole.js";
import { createCampusShockwave } from "../src/effects/shockwave.js";

test("blackhole: lifecycle, cancellation and damage invariants", () => {
  const B = CampusBlackHole,
    root = new T.Group(),
    camera = new T.PerspectiveCamera();
  let finishes = 0;
  const hole = B.create(T, root, () => finishes++);
  const field = hole.start(new T.Vector3(0, 14, 0), 2);
  let disposed = 0;
  root.traverse((o) => {
    if (o.geometry) o.geometry.addEventListener("dispose", () => disposed++);
  });
  const bodies = [5, 12, 20, 28].map((x) => ({
    p: new T.Vector3(x, 6, 0),
    v: new T.Vector3(),
    r: new T.Vector3(),
    spin: new T.Vector3(),
    sleep: true,
  }));
  let deformed = false;
  for (let i = 0; i < 180; i++) {
    hole.update(1 / 60, camera);
    const f = hole.field();
    if (f)
      for (const b of bodies) {
        B.pull(b, f, 1 / 60);
        if (b.stretch > 1) deformed = true;
        assert(b.p.toArray().every(Number.isFinite));
      }
  }
  assert(
    bodies.every((b) => b.consumed),
    "Nearby fragments must be swallowed",
  );
  assert(deformed);
  assert(bodies.every((b) => b.drawScale === 0));
  assert(field.radius <= 24 * Math.sqrt(2));
  const distant = { p: new T.Vector3(60, 14, 0) };
  assert.equal(
    B.pull(distant, field, 1 / 60),
    false,
    "Distant debris stays untouched",
  );
  hole.update(0.21, camera);
  assert(
    bodies.every(
      (b) =>
        !b.consumed &&
        b.drawScale === 1 &&
        b.stretch === 1 &&
        b.active &&
        !b.sleep,
    ),
    "All captured bodies must be ejected intact",
  );
  assert(bodies.every((b) => b.p.y > 0 && b.v.length() > 70));
  assert.equal(field.captured.size, 0);
  assert(!hole.active());
  assert.equal(finishes, 1);
  assert.equal(root.children.length, 0);
  assert(disposed >= 4);
  hole.start(new T.Vector3(), 1);
  hole.clear();
  hole.update(20, camera);
  assert.equal(finishes, 1, "Cancel must not trigger final Shockwave");
  assert.equal(root.children.length, 0);
  console.log(
    JSON.stringify({
      capture: "passed",
      sameDebrisEjected: "passed",
      tidalStretch: "passed",
      finiteMotion: "passed",
      cleanup: "passed",
      cancel: "passed",
    }),
  );

  const fronts = [];
  let completed = 0;
  const wave = createCampusShockwave(
    T,
    root,
    { heightAt: (x, z) => (x > 0 ? 6 : 0) },
    (p, power, radius) => fronts.push({ power, radius }),
    () => completed++,
  );
  wave.start(new T.Vector3(0, 24, 0), 2);
  assert(wave.active());
  assert.equal(fronts.length, 0);
  for (let i = 0; i < 90; i++) wave.update(1 / 60);
  assert.equal(completed, 1);
  assert(!wave.active());
  assert.equal(root.children.length, 0);
  assert(
    fronts.every(
      (f, i) => f.power === 2 && (!i || f.radius > fronts[i - 1].radius),
    ),
  );
  assert(Math.abs(fronts.at(-1).radius - 32 * Math.sqrt(2)) < 1e-8);
  wave.start(new T.Vector3(), 1);
  wave.update(0.2);
  wave.clear();
  const n = fronts.length;
  wave.update(2);
  assert.equal(fronts.length, n);
  assert.equal(completed, 1);
  console.log("Expanding damage front, captured POWER and cancellation passed");
});
