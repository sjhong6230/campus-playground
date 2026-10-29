import test from "node:test";
import assert from "node:assert/strict";
import T from "../vendor/three.min.cjs";
import { schools } from "../src/schools/index.js";
import { createBuildings } from "../src/world/buildings.js";
import { createCampusScenery } from "../src/world/scenery.js";
import { createDamageSystem } from "../src/physics/damage.js";
import { captureBlocks, restoreBlocks } from "../src/core/history.js";

const noop = () => {};
const drawing = new Proxy(
  {
    createRadialGradient: () => ({ addColorStop: noop }),
    createLinearGradient: () => ({ addColorStop: noop }),
  },
  { get: (object, key) => object[key] || noop },
);
globalThis.document = {
  createElement: () => ({
    getContext: () => drawing,
    style: {},
    classList: { toggle: noop },
  }),
};

function activeCounts(blocks) {
  return Object.fromEntries(
    ["column", "slab", "wall"].map((kind) => [
      kind,
      blocks.filter((b) => b.kind === kind && b.active).length,
    ]),
  );
}
const total = (counts) => counts.column + counts.slab + counts.wall;

for (const school of schools)
  test(`${school.id}: Earthquake causes local collapse, repeated damage and exact Undo without relying on a fissure`, () => {
    const layout = school.createLayout(),
      world = new T.Group();
    let seed = 731;
    const rng = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    // Keep all foundation heights unchanged. The quake seed must work even when
    // a random fissure misses the building; terrain damage is tested elsewhere.
    const terrain = {
      heightAt: (x, z) => layout.elevationAt(x, z),
      quake: noop,
      surfaceTexture: null,
    };
    // Match the runtime RNG order, including scenery and hill geometry.
    createCampusScenery(T, world, terrain, { fire: noop }, rng, null, layout);
    for (const hill of layout.hills) rng();
    const { blocks, buildings } = createBuildings({
        T,
        world,
        layout,
        visuals: {
          wall: null,
          wallBump: null,
          wallRoughness: null,
          roof: null,
        },
        rng,
        $: () => ({ appendChild: noop }),
      }),
      original = captureBlocks(blocks),
      damage = createDamageSystem({
        T,
        layout,
        terrain,
        scenery: { damage: () => 0 },
        blocks,
        buildings,
        fx: { dust: noop },
        fires: [],
        groundDecor: noop,
        audio: noop,
        reduce: true,
        getPower: () => 2,
        onScore: noop,
        onShake: noop,
        nextFireKey: () => 0,
        onFeedback: noop,
        updateStats: noop,
        toast: noop,
      });
    const main = buildings.find((b) => !b.link),
      segment = main.segments[0],
      targets = [
        ["campus center", new T.Vector3(0, layout.elevationAt(0, 0), 0)],
        [
          "playing field",
          new T.Vector3(
            layout.field.x,
            layout.elevationAt(layout.field.x, layout.field.z),
            layout.field.z,
          ),
        ],
        [
          "main roof",
          new T.Vector3(
            segment.x,
            main.baseY + (segment.floors ?? main.floors) * 3,
            segment.z,
          ),
        ],
      ];
    for (const [name, point] of targets) {
      let weak;
      for (const power of [1, 2, 4]) {
        restoreBlocks(blocks, original);
        damage.impact(point, "quake", power);
        const counts = activeCounts(blocks);
        assert(
          counts.slab > 0,
          `${name}, power ${power}: no visible slab failure`,
        );
        assert(
          counts.wall > 0,
          `${name}, power ${power}: no visible wall failure`,
        );
        assert(
          total(counts) < blocks.length,
          "A local quake must leave surviving structures",
        );
        if (power === 1) weak = counts;
        if (power === 4)
          for (const kind of ["column", "slab", "wall"])
            assert(
              counts[kind] >= weak[kind],
              `${name}: higher power reduced ${kind} damage`,
            );
      }
      restoreBlocks(blocks, original);
      damage.impact(point, "quake", 2);
      const first = captureBlocks(blocks),
        firstCount = total(activeCounts(blocks));
      damage.impact(point, "quake", 2);
      const second = captureBlocks(blocks),
        secondCount = total(activeCounts(blocks));
      damage.impact(point, "quake", 2);
      assert(
        secondCount > firstCount,
        `${name}: repeated quake did no additional damage`,
      );
      assert(
        total(activeCounts(blocks)) > secondCount,
        `${name}: third quake stalled`,
      );
      restoreBlocks(blocks, first);
      damage.impact(point, "quake", 2);
      assert.deepEqual(
        captureBlocks(blocks),
        second,
        `${name}: Undo changed the next collapse`,
      );
    }
    restoreBlocks(blocks, original);
    const point = targets[0][1],
      farWing = buildings
        .filter((b) => !b.link)
        .flatMap((b) => b.segments)
        .sort(
          (a, b) =>
            Math.hypot(b.x - point.x, b.z - point.z) -
            Math.hypot(a.x - point.x, a.z - point.z),
        )[0];
    damage.impact(point, "quake", 1);
    assert(
      blocks.filter((b) => b.segment === farWing).every((b) => !b.active),
      "A distant wing lost support from unrelated local damage",
    );
    restoreBlocks(blocks, original);
    damage.propagate();
    assert.deepEqual(captureBlocks(blocks), original);
  });
