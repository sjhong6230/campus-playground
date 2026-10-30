import test from "node:test";
import assert from "node:assert/strict";
import { getSchool, schools } from "../src/schools/index.js";

for (const id of [
  "gsa",
  "dgshs",
  "djshs",
  "hssh",
  "sjshs",
  "bsis",
  "gbs",
  "iasa",
  "kbsh",
  "sasa",
]) {
  test(`${id}: site details and roof fittings stay within their support bounds`, () => {
    const layout = getSchool(id).createLayout();
    const point = ([x, z]) => {
      assert(Number.isFinite(x) && Number.isFinite(z));
      assert(Math.abs(x) < 75.5 && Math.abs(z) < 59, `${id}: ${x}, ${z}`);
      assert(Number.isFinite(layout.elevationAt(x, z)));
    };
    for (const wall of layout.siteDetails.retainingWalls) {
      point(wall.a);
      point(wall.b);
      assert(wall.height > 0 && wall.height < 10);
    }
    for (const fence of layout.siteDetails.fences) fence.points.forEach(point);
    for (const path of layout.siteDetails.paths) {
      path.points.forEach(point);
      assert(path.width > 0 && path.width <= 6);
    }
    for (const building of layout.buildings) {
      assert(building.facade && /^#[0-9a-f]{6}$/i.test(building.facade.color));
      for (const segment of building.segments) {
        const canopy = segment.roofDetails?.canopy;
        if (!canopy) continue;
        assert(Math.abs(canopy.u) + canopy.w / 2 <= segment.w / 2);
        assert(Math.abs(canopy.v) + canopy.d / 2 <= segment.d / 2);
      }
    }
    assert(layout.trees.length <= layout.maxTrees);
  });
}

test("visible observation domes sit on a supporting roof", () => {
  for (const id of ["hssh", "sjshs", "bsis", "gbs", "iasa", "kbsh"]) {
    const layout = getSchool(id).createLayout();
    const dome = layout.observatory;
    if (!dome && (id === "gbs" || id === "iasa")) continue;
    const building = layout.buildings[dome.building];
    const support = building.segments.find((s) => {
      const dx = dome.x - s.x;
      const dz = dome.z - s.z;
      return (
        Math.abs(dx * s.cos - dz * s.sin) <= s.w / 2 &&
        Math.abs(dx * s.sin + dz * s.cos) <= s.d / 2
      );
    });
    assert(support, `${id}: dome has a supporting roof`);
    const roofY = building.baseY + 3 * (support.floors ?? building.floors);
    assert(dome.y >= roofY && dome.y - roofY <= 0.4);
  }
});

test("Sejong field is a small step below the classroom forecourt", () => {
  const layout = getSchool("sjshs").createLayout();
  const difference = layout.buildings[0].baseY - layout.field.height;
  assert(difference > 0 && difference < 1.5);
  assert.equal(
    layout.elevationAt(layout.field.x, layout.field.z),
    layout.field.height,
  );
});

test("campus road and walking overlays leave sports surfaces unobstructed", () => {
  const local = (f, p) => {
    const x = p[0] - f.x,
      z = p[1] - f.z;
    const c = Math.cos(f.angle || 0),
      s = Math.sin(f.angle || 0);
    return [x * c - z * s, x * s + z * c];
  };
  // Segment/rectangle clipping includes the painted curb and route stroke width.
  function intersects(a, b, halfWidth, halfDepth) {
    let low = 0,
      high = 1;
    for (let axis = 0; axis < 2; axis++) {
      const size = axis ? halfDepth : halfWidth;
      const delta = b[axis] - a[axis];
      if (Math.abs(delta) < 1e-9) {
        if (Math.abs(a[axis]) >= size) return false;
        continue;
      }
      let near = (-size - a[axis]) / delta;
      let far = (size - a[axis]) / delta;
      if (near > far) [near, far] = [far, near];
      low = Math.max(low, near);
      high = Math.min(high, far);
      if (high <= low) return false;
    }
    return high - low > 1e-7;
  }
  for (const school of schools) {
    const layout = school.createLayout();
    for (const [name, surface] of [
      ["field", layout.field],
      ["court", layout.tennis],
    ]) {
      if (!surface) continue;
      for (const [routeId, route] of (
        layout.siteDetails?.paths || []
      ).entries()) {
        const margin = route.width / 2 + 0.225;
        for (let i = 1; i < route.points.length; i++) {
          assert(
            !intersects(
              local(surface, route.points[i - 1]),
              local(surface, route.points[i]),
              surface.w / 2 + margin,
              surface.d / 2 + margin,
            ),
            `${school.id}: path ${routeId}, segment ${i} covers ${name}`,
          );
        }
      }
    }
  }
});
