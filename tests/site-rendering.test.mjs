import test from "node:test";
import assert from "node:assert/strict";
import T from "../vendor/three.min.cjs";
import { createBuildings } from "../src/world/buildings.js";
import { createFacadeLibrary } from "../src/rendering/facades.js";
import { createCampusScenery } from "../src/world/scenery.js";
import { createCampusTerrain } from "../src/world/terrain.js";
import {
  finishLayout,
  segment,
  building,
} from "../src/schools/shared/layout.js";
import { captureBlocks, restoreBlocks } from "../src/core/history.js";
const noop = () => {};
const ctx = new Proxy(
  {
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
  },
  { get: (o, k) => o[k] || noop },
);
globalThis.document = {
  createElement: () => ({
    getContext: () => ctx,
    style: {},
    classList: { toggle: noop },
  }),
};
function fixture() {
  return finishLayout({
    buildings: [
      {
        ...building("brick", 3, 1.5, "#c5a090", [
          segment(-10, 0, 15, 10, {
            roofDetails: { parapet: true, canopy: { w: 8, d: 4, height: 2 } },
            facade: { style: "brick", glazedBays: [{ u: 0, width: 3 }] },
          }),
        ]),
        facade: { style: "brick" },
      },
      {
        ...building("stone", 2, 1.5, "#d5d3c9", [segment(12, 0, 12, 9)]),
        facade: { style: "stone" },
      },
    ],
    links: [],
    field: { x: 0, z: 25, w: 20, d: 15, angle: 0 },
    gate: {
      x: 0,
      z: 42,
      width: 9,
      height: 2.5,
      style: "open",
      sign: "Test school",
      barrier: true,
    },
    benches: [],
    trees: [],
    hills: [],
    siteDetails: {
      retainingWalls: [{ a: [-20, 10], b: [-10, 10], height: 2 }],
      fences: [
        {
          points: [
            [15, 10],
            [25, 10],
          ],
          height: 1.8,
        },
      ],
      paths: [
        {
          points: [
            [0, 42],
            [0, 35],
          ],
          width: 5,
          kind: "road",
        },
      ],
    },
  });
}
test("facade palettes preserve picking ownership and roof/glazing attachments restore without idle uploads", () => {
  const layout = fixture(),
    world = new T.Group(),
    facade = createFacadeLibrary(T);
  assert.equal(
    facade({ style: "brick" }),
    facade({ style: "brick" }),
    "Palette textures are cached",
  );
  assert.notEqual(facade({ style: "brick" }), facade({ style: "stone" }));
  const built = createBuildings({
    T,
    world,
    layout,
    visuals: {
      facade,
      wall: null,
      wallBump: null,
      wallRoughness: null,
      roof: null,
    },
    rng: () => 0.42,
    $: () => ({ appendChild: noop }),
  });
  const g = built.blockMesh.geometry;
  let end = 0;
  for (const group of g.groups) {
    assert.equal(group.start, end);
    end += group.count;
    assert(group.materialIndex < built.blockMesh.material.length);
  }
  assert.equal(end, g.attributes.position.count);
  assert.equal(built.fractured.owners.length, end / 3);
  assert(built.fractured.owners.every((i) => built.blocks[i]));
  const mesh = world.children.find((o) => o.isInstancedMesh),
    before = mesh.instanceMatrix.array.slice();
  const version = mesh.instanceMatrix.version;
  built.architecture.sync();
  assert.equal(mesh.instanceMatrix.version, version);
  const snapshot = captureBlocks(built.blocks);
  for (const b of built.blocks) {
    b.active = true;
    b.r.x = 0.7;
    b.p.y -= 4;
  }
  built.architecture.sync();
  assert.notDeepEqual(mesh.instanceMatrix.array, before);
  restoreBlocks(built.blocks, snapshot);
  built.architecture.sync();
  assert.deepEqual(mesh.instanceMatrix.array, before);
});
test("school gates, retaining walls and fences participate in damage and exact Undo", () => {
  const layout = fixture(),
    root = new T.Group(),
    terrain = createCampusTerrain(T, root, layout, noop);
  const scenery = createCampusScenery(
    T,
    root,
    terrain,
    { fire: noop },
    () => 0.42,
    null,
    layout,
  );
  const saved = scenery.snapshot();
  assert(
    saved.parts.some((p) => p.p[2] > 40),
    "Gate has physical parts",
  );
  scenery.damage(new T.Vector3(0, 1.5, 42), "bombing", 1);
  assert(scenery.stats().destroyed > 0);
  for (let i = 0; i < 10; i++) scenery.update(1 / 60);
  scenery.restore(saved);
  assert.deepEqual(scenery.snapshot(), saved);
  scenery.damage(new T.Vector3(), "nuke", 2);
  assert.equal(scenery.stats().destroyed, scenery.stats().total);
  scenery.restore();
  assert.equal(scenery.stats().destroyed, 0);
});
