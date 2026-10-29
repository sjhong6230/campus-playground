import test from "node:test";
import assert from "node:assert/strict";
import T from "../vendor/three.min.cjs";
import { createDamageSystem } from "../src/physics/damage.js";
import { createDebrisSimulation } from "../src/physics/debris.js";
import { captureBlocks, restoreBlocks } from "../src/core/history.js";
const noop = () => {};
function body(kind, x, y, z, w = 4, h = 0.4, d = 4, extra = {}) {
  const front =
    kind === "wall" || kind === "column"
      ? [
          [-w / 2, -h / 2, d / 2],
          [w / 2, -h / 2, d / 2],
          [w / 2, h / 2, d / 2],
          [-w / 2, h / 2, d / 2],
        ]
      : [
          [-w / 2, h / 2, -d / 2],
          [w / 2, h / 2, -d / 2],
          [w / 2, h / 2, d / 2],
          [-w / 2, h / 2, d / 2],
        ];
  const back = front.map(([a, b, c]) =>
    kind === "wall" || kind === "column" ? [a, b, -d / 2] : [a, -h / 2, c],
  );
  return {
    kind,
    origin: new T.Vector3(x, y, z),
    p: new T.Vector3(x, y, z),
    v: new T.Vector3(),
    r: new T.Vector3(),
    spin: new T.Vector3(),
    corners: [...front, ...back].map((v) => new T.Vector3(...v)),
    mass: kind === "slab" ? 3 : 1,
    active: false,
    sleep: false,
    consumed: false,
    story: 0,
    age: 0,
    delay: 0,
    rest: 0.2,
    collapse: false,
    contactTime: 0,
    ...extra,
  };
}
function run(
  blocks,
  seconds = 8,
  dt = 1 / 60,
  terrain = { heightAt: () => 0 },
) {
  const step = createDebrisSimulation({ blocks, terrain, fx: { dust: noop } });
  for (let t = 0; t < seconds; t += dt) step(dt, null, t);
  return step;
}
function damage(blocks) {
  return createDamageSystem({
    T,
    layout: { elevationAt: () => 0 },
    terrain: { heightAt: () => 0, crater: noop, quake: noop, burn: noop },
    scenery: { damage: () => 0 },
    blocks,
    buildings: [],
    fx: { dust: noop, burst: noop, nuclear: noop },
    fires: [],
    groundDecor: noop,
    audio: noop,
    reduce: true,
    getPower: () => 1,
    onScore: noop,
    onShake: noop,
    nextFireKey: () => 0,
    onFeedback: noop,
    updateStats: noop,
    toast: noop,
  });
}
test("local support failure progresses upward and across a bridge without collapsing a distant wing", () => {
  const building = { baseY: 0 },
    blocks = [],
    segments = [];
  for (const x of [0, 30]) {
    const segment = { x, z: 0, w: 8, d: 8, angle: 0 };
    segments.push(segment);
    for (let story = 0; story < 3; story++) {
      for (const dx of [-2, 2])
        for (const dz of [-2, 2])
          blocks.push(
            body("column", x + dx, story * 3 + 1.5, dz, 0.6, 3, 0.6, {
              building,
              segment,
              story,
            }),
          );
      blocks.push(
        body("slab", x, (story + 1) * 3, 0, 8, 0.38, 8, {
          building,
          segment,
          story,
        }),
      );
    }
  }
  const bridge = { baseY: 3, link: true },
    link = { x: 15, z: 0, w: 22, d: 3, angle: 0 };
  for (const x of [8, 15, 22])
    blocks.push(
      body("column", x, 4.5, 0, 0.6, 3, 0.6, {
        building: bridge,
        segment: link,
      }),
    );
  blocks.push(
    body("slab", 15, 6, 0, 22, 0.38, 3, { building: bridge, segment: link }),
    body("slab", 15, 3, 0, 22, 0.38, 3, { building: bridge, segment: link }),
  );
  const saved = captureBlocks(blocks),
    system = damage(blocks);
  const failed = blocks
    .filter(
      (b) => b.segment === segments[0] && b.kind === "column" && b.story === 0,
    )
    .slice(0, 3);
  failed.forEach((b) => system.activate(b, b.origin, "quake", 1));
  const count = system.propagate();
  assert(count > 0);
  assert(
    blocks.filter((b) => b.segment === segments[1]).every((b) => !b.active),
    "A distant intact wing retains its load path",
  );
  assert(
    blocks.filter((b) => b.building === bridge).every((b) => b.active),
    "Bridge follows failed endpoint anchors",
  );
  const floors = blocks.filter(
    (b) => b.segment === segments[0] && b.kind === "slab",
  );
  assert(floors.every((b) => b.active && b.collapse));
  assert(
    floors[2].delay > floors[0].delay + 0.2,
    "Upper floors release after lower support",
  );
  assert(
    floors.every((b) => b.v.y < 0 && b.v.length() < 2),
    "Support loss begins with gravity-led motion, not radial explosion",
  );
  assert.equal(
    system.propagate(),
    0,
    "Unchanged structure does no repeat work",
  );
  restoreBlocks(blocks, saved);
  system.propagate();
  assert.deepEqual(captureBlocks(blocks), saved);
});

test("overhanging edge panels follow their local frame even outside the column footprint", () => {
  const building = { baseY: 0 },
    segment = { x: 0, z: 0, w: 28, d: 12 },
    columns = [-5, 5].map((x) =>
      body("column", x, 1.5, 0, 0.6, 3, 0.6, { building, segment }),
    ),
    panel = body("slab", -12, 3, 0, 2, 0.38, 3, { building, segment }),
    blocks = [...columns, panel],
    system = damage(blocks);
  columns.forEach((b) => system.activate(b, b.origin, "quake", 1));
  assert.equal(system.propagate(), 1);
  assert(
    panel.collapse,
    "Sparse frame geometry must not leave floating edge panels",
  );
});
test("fragments contact surviving slabs and settled rubble instead of passing through them", () => {
  const platform = body("slab", 0, 6, 0, 10, 0.4, 10),
    falling = body("slab", 0, 12, 0, 2, 0.4, 2, { active: true });
  run([platform, falling]);
  assert(falling.sleep);
  assert(falling.p.y >= 6.4 && falling.p.y < 6.5);
  const rubble = body("slab", 0, 0.5, 0, 4, 1, 4, {
      active: true,
      sleep: true,
    }),
    upper = body("slab", 0, 8, 0, 2, 1, 2, { active: true });
  run([rubble, upper]);
  assert(upper.sleep);
  assert(upper.p.y >= 1.5 && upper.p.y < 1.6);
});
test("rotated wall panels rest above terrain, dissipate energy, and Undo preserves contact state", () => {
  const b = body("wall", 0, 8, 0, 4, 4, 0.4, { active: true });
  b.corners.forEach((p) => p.applyAxisAngle(new T.Vector3(0, 1, 0), 0.63));
  b.v.set(5, -2, 1);
  b.spin.set(0.7, 0.1, -0.3);
  run([b], 16);
  assert(b.sleep, "Contact eventually sleeps without permanent jitter");
  assert.equal(b.v.lengthSq(), 0);
  const matrix = new T.Matrix4().makeRotationFromEuler(
    new T.Euler(b.r.x, b.r.y, b.r.z),
  );
  const minimum = Math.min(
    ...b.corners.map((p) => p.clone().applyMatrix4(matrix).y + b.p.y),
  );
  assert(minimum >= -1e-5, "Oriented corners do not sink through terrain");
  assert(b.p.y < 0.5, "Wall comes to rest on its broad face");
  const saved = captureBlocks([b]);
  b.contactTime = 0;
  b.collapse = true;
  b.p.y = 9;
  restoreBlocks([b], saved);
  assert.deepEqual(captureBlocks([b]), saved);
});
test("substeps keep ballistic motion and contact comparable across frame rates", () => {
  const simulate = (dt) => {
    const b = body("slab", 0, 7, 0, 2, 0.4, 2, { active: true });
    b.v.set(12, 4, 2);
    run([b], 4, dt);
    return b;
  };
  const a = simulate(1 / 30),
    b = simulate(1 / 120);
  assert(a.sleep && b.sleep);
  assert(a.p.distanceTo(b.p) < 0.12);
});

test("sleeping scenes skip terrain contact and rubble rebuilding until debris wakes", () => {
  const b = body("slab", 0, 0.2, 0, 2, 0.4, 2, {
      active: true,
      sleep: true,
    }),
    step = createDebrisSimulation({
      blocks: [b],
      terrain: { heightAt: () => assert.fail("Idle scene queried terrain") },
      fx: { dust: noop },
    });
  for (let i = 0; i < 10; i++) assert.equal(step(1 / 60, null, i / 60), false);
});
