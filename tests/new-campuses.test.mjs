import test from "node:test";
import assert from "node:assert/strict";
import { getSchool, schools } from "../src/schools/index.js";
import { groupSchools } from "../src/schools/categories.js";
import { validateSchools } from "../src/schools/validate.js";

test("school groups keep autonomous high schools separate from science and gifted schools", () => {
  const groups = groupSchools(schools);
  assert.deepEqual(
    groups.map((group) => group.id),
    ["gifted", "science", "autonomous"],
  );
  assert.equal(groups.flatMap((group) => group.schools).length, schools.length);
  assert.deepEqual(
    groups[0].schools.map((school) => school.id).sort(),
    ["sshs", "gshs", "ksa", "gsa", "dgshs", "djshs", "iasa", "sasa"].sort(),
  );
  assert.deepEqual(
    groups[1].schools.map((school) => school.id).sort(),
    [
      "ishs",
      "hssh",
      "sjshs",
      "bsis",
      "gbs",
      "kbsh",
      "ddshs",
      "bssh",
      "cshs",
      "jshs",
      "gssh",
    ].sort(),
  );
  assert.deepEqual(
    groups[2].schools.map((school) => school.id),
    ["hafs", "sunduck"],
  );
  assert.throws(
    () => validateSchools([{ ...getSchool("hafs"), category: "unknown" }]),
    /invalid category/,
  );
  assert.equal(groupSchools([getSchool("hafs")]).length, 1);
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

for (const id of [
  "gbs",
  "iasa",
  "kbsh",
  "sasa",
  "ddshs",
  "bssh",
  "cshs",
  "hafs",
  "sunduck",
  "jshs",
  "gssh",
])
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
