import test from "node:test";
import assert from "node:assert/strict";
import { getSchool } from "../src/schools/index.js";
import { local } from "../src/schools/shared/layout.js";

test("KBSH represents the new Jigok campus with three wings, an open atrium and a separate dormitory", () => {
  const l = getSchool("kbsh").createLayout();
  const main = l.buildings[0],
    dorm = l.buildings[1];
  assert.equal(main.floors, 4);
  assert.equal(dorm.floors, 4);
  assert.equal(new Set(main.segments.slice(0, 3).map((s) => s.angle)).size, 3);
  for (const s of main.segments) {
    const p = local(s, -22, -18);
    assert(
      Math.abs(p.u) >= s.w / 2 || Math.abs(p.v) >= s.d / 2,
      "Keep the central atrium open",
    );
  }
  assert(dorm.x > main.x);
  assert(l.observatory && l.tennis && l.courtKind === "basketball");
  assert.notEqual(getSchool("kbsh").id, getSchool("gbs").id);
});

test("SASA keeps S/A wings, the rear dormitory and the front grass field separate", () => {
  const school = getSchool("sasa"),
    l = school.createLayout();
  assert.notEqual(school.id, getSchool("sjshs").id);
  assert.equal(school.nickname, "세과영");
  const main = l.buildings[0],
    arts = l.buildings[1],
    dorm = l.buildings[3];
  assert.equal(main.floors, 5);
  assert.equal(arts.floors, 5);
  assert.equal(dorm.floors, 5);
  assert(dorm.z < main.z);
  assert(l.field.z > main.z);
  assert.equal(l.field.surface, "grass");
  assert.equal(l.links[0].floors, 2);
  assert(l.buildings[0].segments[2].roofDetails.canopy);
});
