import test from "node:test";
import assert from "node:assert/strict";
import T from "../vendor/three.min.cjs";
import { schools } from "../src/schools/index.js";
import { validateSchools } from "../src/schools/validate.js";
import { createCampusTerrain } from "../src/world/terrain.js";
import { createCampusScenery } from "../src/world/scenery.js";
import { createBuildings } from "../src/world/buildings.js";
import {
  createHistory,
  captureBlocks,
  restoreBlocks,
} from "../src/core/history.js";
const noop = () => {};
const drawing = new Proxy(
  {
    createRadialGradient: () => ({ addColorStop: noop }),
    createLinearGradient: () => ({ addColorStop: noop }),
  },
  { get: (o, k) => o[k] || noop },
);
globalThis.document = {
  createElement: () => ({
    width: 0,
    height: 0,
    getContext: () => drawing,
    style: {},
    classList: { toggle: noop },
  }),
};
test("registry rejects duplicate ids and invalid geometry", () => {
  validateSchools(schools);
  assert.throws(() => validateSchools([schools[0], schools[0]]), /duplicate/);
  assert.throws(
    () => validateSchools([{ ...schools[0], id: "<unsafe>" }]),
    /Invalid/,
  );
  assert.throws(
    () => validateSchools([{ ...schools[0], createLayout: () => ({}) }]),
    /layout/,
  );
});
for (const school of schools)
  test(
    school.id +
      ": terrain, damage, Undo, roof attachment and performance cache",
    () => {
      const layout = school.createLayout(),
        other = school.createLayout();
      assert.notEqual(layout, other);
      assert.notEqual(layout.buildings[0], other.buildings[0]);
      let seed = 731;
      const rng = () =>
        (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
      const root = new T.Group(),
        terrain = createCampusTerrain(T, root, layout, school.paintGround);
      const scenery = createCampusScenery(
        T,
        root,
        terrain,
        { fire: noop },
        rng,
        null,
        layout,
      );
      const total = scenery.stats().total;
      const instances = root.children.filter(
        (m) => m.isInstancedMesh && m.instanceColor,
      );
      assert(instances.length > 0);
      const uploads = instances.map((m) => [
        m.instanceMatrix.version,
        m.instanceColor.version,
      ]);
      scenery.ground();
      assert.deepEqual(
        instances.map((m) => [
          m.instanceMatrix.version,
          m.instanceColor.version,
        ]),
        uploads,
        "Unchanged scenery must not rewrite instance buffers",
      );
      assert(total > 0);
      for (let x = -70; x <= 70; x += 10)
        for (let z = -50; z <= 50; z += 10) {
          const h = terrain.heightAt(x, z);
          assert(Number.isFinite(h), "Terrain must have finite elevation");
          assert.equal(
            h,
            other.elevationAt(x, z),
            "Reload preserves campus grade",
          );
        }
      const before = terrain.snapshot(),
        snapshot = scenery.snapshot();
      scenery.damage(
        new T.Vector3(layout.field.x, 0, layout.field.z),
        "bombing",
        1,
      );
      assert(scenery.stats().destroyed > 0);
      assert(terrain.snapshot().turf.length > 0);
      terrain.restore(before);
      scenery.restore(snapshot);
      assert.deepEqual(scenery.snapshot(), snapshot);
      scenery.damage(new T.Vector3(0, 0, 0), "nuke", 2);
      scenery.settle();
      assert.equal(scenery.stats().destroyed, total);
      terrain.restore();
      scenery.restore();
      assert.equal(scenery.stats().destroyed, 0);
      terrain.crater(new T.Vector3(0, 0, 0), 2);
      assert(terrain.flush());
      const positionVersion = terrain.mesh.geometry.attributes.position.version,
        normalVersion = terrain.mesh.geometry.attributes.normal.version;
      for (let i = 0; i < 12; i++) terrain.burn(new T.Vector3(i, 0, 0), 4);
      terrain.flush();
      assert.equal(
        terrain.mesh.geometry.attributes.position.version,
        positionVersion,
      );
      assert.equal(
        terrain.mesh.geometry.attributes.normal.version,
        normalVersion,
      );
      assert.equal(terrain.flush(), false);
      const built = createBuildings({
        T,
        world: root,
        layout,
        visuals: {
          wall: null,
          wallBump: null,
          wallRoughness: null,
          roof: null,
        },
        rng,
        $: () => ({ appendChild: noop }),
      });
      const states = captureBlocks(built.blocks),
        history = createHistory(2);
      history.push(states);
      const mesh = built.fractured.mesh,
        geometry = mesh.geometry.attributes.position,
        version = geometry.version;
      built.fractured.sync();
      assert.equal(geometry.version, version, "Idle fragments skip uploads");
      built.blocks.forEach((b) => {
        b.active = true;
        b.p.x += 20;
        b.consumed = true;
        b.drawScale = 0;
      });
      built.fractured.sync();
      built.architecture.sync();
      restoreBlocks(built.blocks, history.pop());
      built.fractured.sync();
      built.architecture.sync();
      assert.deepEqual(captureBlocks(built.blocks), states);
      history.push(1);
      history.push(2);
      history.push(3);
      assert.equal(history.pop(), 3);
      assert.equal(history.pop(), 2);
      assert.equal(history.pop(), undefined);
      root.traverse((object) => {
        object.geometry?.dispose();
        for (const material of [object.material].flat()) material?.dispose();
      });
    },
  );
