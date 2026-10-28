import test from "node:test";
import assert from "node:assert/strict";
import T from "../vendor/three.min.cjs";
import { createLayout } from "../src/schools/gsa/layout.js";
import { createBuildings } from "../src/world/buildings.js";
import { captureBlocks, restoreBlocks } from "../src/core/history.js";

const noop = () => {};
globalThis.document = {
  createElement: () => ({ style: {}, classList: { toggle: noop } }),
};

test("GSA: floor-specific bridges, open passage and separated dormitories survive Undo", () => {
  const layout = createLayout(),
    world = new T.Group();
  let seed = 123;
  const built = createBuildings({
    T,
    world,
    layout,
    visuals: { wall: null, wallBump: null, wallRoughness: null, roof: null },
    rng: () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296,
    $: () => ({ appendChild: noop }),
  });
  const ys = (parts) =>
    parts.flatMap((p) => p.corners.map((c) => p.origin.y + c.y));
  const study = built.buildings.find((b) => b.name.startsWith("학습동"));
  const open = built.blocks.filter(
    (p) => p.building === study && p.segment.openGroundFloor,
  );
  const walls = open.filter((p) => p.kind === "wall");
  assert(walls.length > 0);
  assert(
    Math.min(...ys(walls)) >= 4.5 - 1e-6,
    "No wall vertices may hang into the first-floor passage",
  );
  assert(
    open.some((p) => p.kind === "column" && p.story === 0),
    "Open level still has structural columns",
  );
  assert(
    open.some((p) => p.kind === "slab" && p.story === 0),
    "The second-floor deck remains above the passage",
  );
  const enclosed = built.blocks.filter(
    (p) =>
      p.building === study && !p.segment.openGroundFloor && p.kind === "wall",
  );
  assert(
    Math.min(...ys(enclosed)) < 2,
    "Dormitory-side ground-floor hall stays enclosed",
  );

  const bridges = built.buildings.filter((b) => b.link);
  assert.equal(bridges.length, 4);
  for (const [i, highestLevel] of [4, 3, 2, 2].entries()) {
    const parts = bridges[i].ids.map((id) => built.blocks[id]);
    assert(
      Math.abs(Math.min(...ys(parts)) - 4.31) < 1e-6,
      "Bridge starts at level 2, including its deck thickness",
    );
    assert(
      Math.abs(Math.max(...ys(parts)) - (1.5 + highestLevel * 3 + 0.19)) < 1e-6,
    );
    assert.equal(
      bridges[i].floors,
      highestLevel - 1,
      "Support groups cover every bridge storey",
    );
  }
  const dorm = { x: 22, z: -30, angle: 0.35 };
  const contains = (s, p) => {
    const dx = p.x - s.x,
      dz = p.z - s.z,
      c = Math.cos(s.angle),
      sn = Math.sin(s.angle);
    return (
      Math.abs(dx * c - dz * sn) < s.w / 2 - 0.01 &&
      Math.abs(dx * sn + dz * c) < s.d / 2 - 0.01
    );
  };
  const lowerRight = layout.point(dorm, 11.75, 8);
  const lowerLeft = layout.point(dorm, -11.75, 8);
  const dormBodies = layout.buildings
    .filter((b) => b.name.includes("기숙사"))
    .flatMap((b) => b.segments);
  assert(
    !dormBodies.some((s) => contains(s, lowerRight)),
    "No eastern lower stroke forming a 3",
  );
  assert(
    !dormBodies.some((s) => contains(s, lowerLeft)),
    "No full-height western connection",
  );
  assert(
    contains(layout.links[3], lowerLeft),
    "Only the level-2 bridge joins the western ends",
  );
  assert(!layout.links.some((s) => contains(s, lowerRight)));

  const before = captureBlocks(built.blocks);
  for (const p of built.blocks) {
    p.active = true;
    p.p.y -= 10;
    p.consumed = true;
  }
  built.fractured.sync();
  restoreBlocks(built.blocks, before);
  built.fractured.sync();
  built.architecture.sync();
  assert.deepEqual(captureBlocks(built.blocks), before);
  world.traverse((o) => {
    o.geometry?.dispose();
    for (const m of [o.material].flat()) m?.dispose();
  });
});
