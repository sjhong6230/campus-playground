import test from "node:test";
import assert from "node:assert/strict";
import { validateSchools } from "../src/schools/validate.js";
import sshs from "../src/schools/sshs/index.js";
import gshs from "../src/schools/gshs/index.js";
import ksa from "../src/schools/ksa/index.js";
import ishs from "../src/schools/ishs/index.js";

for (const school of [sshs, gshs, ksa, ishs]) {
  test(`${school.id}: terraced field and structural footings are level`, () => {
    validateSchools([school]);
    const l = school.createLayout();
    const close = (actual, expected, label) =>
      assert(
        Math.abs(actual - expected) < 1e-6,
        `${label}: ${actual} vs ${expected}`,
      );
    for (const b of l.buildings)
      for (const s of b.segments)
        for (const u of [-0.499, -0.25, 0, 0.25, 0.499])
          for (const v of [-0.499, -0.25, 0, 0.25, 0.499]) {
            const p = l.point(s, u * s.w, v * s.d);
            close(l.elevationAt(p.x, p.z), b.baseY, b.name);
          }
    for (const u of [-0.5, 0, 0.5])
      for (const v of [-0.5, 0, 0.5]) {
        const p = l.point(l.field, u * l.field.w, v * l.field.d);
        close(l.elevationAt(p.x, p.z), l.field.height, "playing field");
      }
    for (let x = -75; x <= 75; x += 3)
      for (let z = -58; z <= 58; z += 3)
        assert(Number.isFinite(l.elevationAt(x, z)));
  });
}

test("KSA rear teaching wing and Incheon solar canopy remain inside the campus", () => {
  const k = ksa.createLayout(),
    i = ishs.createLayout();
  const main = k.buildings.find((b) => b.name === "본관");
  assert(
    main.segments.some((s) => s.z < -10 && s.d > s.w),
    "main block turns uphill",
  );
  const solar = i.buildings.find((b) => b.name.includes("태양광"));
  assert(solar && solar.segments.length > 0);
  for (const s of solar.segments) {
    assert(
      s.openGroundFloor,
      "parking must remain an open column-supported roof",
    );
    const f = i.field,
      dx = s.x - f.x,
      dz = s.z - f.z;
    assert(
      Math.hypot(dx, dz) > f.w / 2 + s.w / 2,
      "solar parking must not obstruct sports field",
    );
  }
  validateSchools([ksa, ishs]);
});
