import test from "node:test";
import assert from "node:assert/strict";
import { getSchool, schools } from "../src/schools/index.js";

test("the selector places all seven gifted academies before the five science high schools", () => {
  assert.equal(schools.length, 12);
  assert.deepEqual(
    schools
      .slice(0, 7)
      .map((school) => school.id)
      .sort(),
    ["sshs", "gshs", "ksa", "gsa", "dgshs", "djshs", "iasa"].sort(),
  );
  assert.deepEqual(
    schools
      .slice(7)
      .map((school) => school.id)
      .sort(),
    ["ishs", "hshs", "sjshs", "bsis", "gbs"].sort(),
  );
});

function corners(layout, frame) {
  return [-frame.w / 2, frame.w / 2].flatMap((u) =>
    [-frame.d / 2, frame.d / 2].map((v) => layout.point(frame, u, v)),
  );
}

// Separating axes handle rotated wings as well as north-up rectangular fields.
function overlaps(layout, a, b) {
  const first = corners(layout, a),
    second = corners(layout, b);
  for (const frame of [a, b]) {
    const angle = frame.angle || 0;
    for (const [x, z] of [
      [Math.cos(angle), -Math.sin(angle)],
      [Math.sin(angle), Math.cos(angle)],
    ]) {
      const p = first.map((point) => point.x * x + point.z * z),
        q = second.map((point) => point.x * x + point.z * z);
      if (
        Math.max(...p) <= Math.min(...q) + 1e-8 ||
        Math.max(...q) <= Math.min(...p) + 1e-8
      )
        return false;
    }
  }
  return true;
}

for (const id of ["gbs", "iasa"])
  test(`${id}: building and bridge footprints leave the playing field clear`, () => {
    const layout = getSchool(id).createLayout();
    for (const building of layout.buildings)
      for (const segment of building.segments)
        assert(
          !overlaps(layout, segment, layout.field),
          `${id}: ${building.name} overlaps the playing field`,
        );
    for (const link of layout.links)
      assert(
        !overlaps(layout, link, layout.field),
        `${id}: ${link.name} spans the playing field`,
      );
  });
