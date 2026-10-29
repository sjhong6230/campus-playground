import test from "node:test";
import assert from "node:assert/strict";
import { getSchool } from "../src/schools/index.js";

test("GSA field is lower and level while every building keeps its foundation height", () => {
  const l = getSchool("gsa").createLayout();
  for (const u of [-l.field.w / 2, 0, l.field.w / 2])
    for (const v of [-l.field.d / 2, 0, l.field.d / 2]) {
      const p = l.point(l.field, u, v);
      assert(Math.abs(l.elevationAt(p.x, p.z) + 1.5) < 1e-8);
    }
  for (const b of l.buildings)
    for (const s of b.segments)
      for (const u of [-s.w / 2, 0, s.w / 2])
        for (const v of [-s.d / 2, 0, s.d / 2]) {
          const p = l.point(s, u, v);
          assert.equal(l.elevationAt(p.x, p.z), b.baseY, b.name);
        }
  // The approach must climb smoothly to the upper campus, not be a sharp hole.
  let previous = -1.5;
  for (let step = 0; step <= 16; step++) {
    const p = l.point(l.field, 0, -l.field.d / 2 - step / 4);
    const h = l.elevationAt(p.x, p.z);
    assert(h >= previous - 1e-8 && h <= 1.5);
    previous = h;
  }
  assert.equal(previous, 1.5);
});

for (const id of ["dgshs", "djshs", "hshs", "sjshs", "bsis", "gbs", "iasa"])
  test(`${id}: playing field and building pads match their visible geometry`, () => {
    const l = getSchool(id).createLayout();
    for (const b of l.buildings)
      for (const s of b.segments)
        for (const u of [-s.w / 2 + 0.01, 0, s.w / 2 - 0.01])
          for (const v of [-s.d / 2 + 0.01, 0, s.d / 2 - 0.01]) {
            const p = l.point(s, u, v);
            assert.equal(l.elevationAt(p.x, p.z), b.baseY, b.name);
          }
    for (const u of [-l.field.w / 2 + 0.01, 0, l.field.w / 2 - 0.01])
      for (const v of [-l.field.d / 2 + 0.01, 0, l.field.d / 2 - 0.01]) {
        const p = l.point(l.field, u, v);
        assert.equal(l.elevationAt(p.x, p.z), l.field.height);
      }
    assert(l.trees.length <= l.maxTrees);
    if (l.tennis?.height != null)
      for (const u of [-l.tennis.w / 2 + 0.01, 0, l.tennis.w / 2 - 0.01])
        for (const v of [-l.tennis.d / 2 + 0.01, 0, l.tennis.d / 2 - 0.01]) {
          const p = l.point(l.tennis, u, v);
          assert.equal(l.elevationAt(p.x, p.z), l.tennis.height);
        }
  });
