import test from "node:test";
import assert from "node:assert/strict";
import T from "../vendor/three.min.cjs";
import { CampusBombing } from "../src/tools/bombing.js";

test("bombing: lifecycle, cancellation and damage invariants", () => {
  const B = CampusBombing;
  for (const angle of [0, 0.4, Math.PI / 2, 2.2, Math.PI])
    for (const p of [
      { x: 0, z: 0 },
      { x: 75, z: 58 },
      { x: -75, z: -58 },
    ]) {
      const plan = B.plan(p, angle);
      assert.equal(plan.length, 1);
      assert(
        plan.every((p) => Math.abs(p.x) <= 70.001 && Math.abs(p.z) <= 53.001),
      );
      assert.equal(
        new Set(plan.map((p) => p.x.toFixed(4) + "," + p.z.toFixed(4))).size,
        1,
      );
      for (let i = 1; i < plan.length; i++)
        assert(plan[i].delay > plan[i - 1].delay);
    }
  const root = new T.Group(),
    impacts = [],
    progress = [],
    terrain = { heightAt: () => 6 };
  let disposed = 0;
  const effect = B.create(
    T,
    root,
    terrain,
    (p, power) => impacts.push({ p, power }),
    (done, total) => progress.push({ done, total }),
    (x, z) => (x > 0 ? 18 : 6),
  );
  effect.start({ x: 20, z: 0 }, 0, 2);
  assert(effect.active());
  root.traverse((o) => {
    if (o.geometry) o.geometry.addEventListener("dispose", () => disposed++);
  });
  effect.update(1);
  assert.equal(impacts.length, 0, "Must fall before impact");
  for (let i = 0; i < 100; i++) effect.update(0.05);
  assert.equal(impacts.length, 1);
  assert(impacts.every((h) => h.power === 2 && h.p.y === (h.p.x > 0 ? 18 : 6)));
  assert.equal(progress.at(-1).done, 1);
  assert.equal(impacts[0].p.x, 20, "Single bomb lands at the selected point");
  assert(!effect.active());
  assert.equal(root.children.length, 0);
  assert(disposed > 0);
  effect.start({ x: 20, z: 15 }, 0.4, 3);
  effect.update(0.5);
  effect.clear();
  for (let i = 0; i < 100; i++) effect.update(0.05);
  assert.equal(impacts.length, 1, "Cancelled bombs must never land");
  assert.equal(root.children.length, 0);
  effect.start({ x: 0, z: 0 }, 0, 1);
  effect.update(1.4);
  const partial = impacts.length;
  assert.equal(partial, 2);
  effect.clear();
  effect.update(10);
  assert.equal(
    impacts.length,
    partial,
    "Completed action must not produce additional impacts",
  );
  console.log(
    JSON.stringify({
      boundedTarget: "passed",
      singleImpact: "passed",
      roofContact: "passed",
      frozenPower: "passed",
      completionCleanup: "passed",
      cancelBeforeAndDuring: "passed",
    }),
  );

  const span = B.plan({ x: 0, z: 0 }, 0);
  assert.equal(
    Math.max(...span.map((p) => p.x)) - Math.min(...span.map((p) => p.x)),
    0,
  );
  assert.equal(
    Math.max(...span.map((p) => p.z)) - Math.min(...span.map((p) => p.z)),
    0,
  );
});
