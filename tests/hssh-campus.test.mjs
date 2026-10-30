import test from "node:test";
import assert from "node:assert/strict";
import { getSchool } from "../src/schools/index.js";
import { campus } from "../src/schools/hssh/layout.js";
import { local } from "../src/schools/shared/layout.js";
import { addSiteScenery } from "../src/world/site-details.js";

test("HSSH follows the user-labelled buildings and hillside floor relationship", () => {
  const layout = getSchool("hssh").createLayout();
  const find = (name) => layout.buildings.find((b) => b.name.startsWith(name));
  assert.equal(find("돈의관").floors, 6);
  assert.equal(find("태하관").floors, 4);
  assert.equal(find("본관").baseY, find("돈의관").baseY + 3 * 3);
  const seohyeon = local(campus, find("서현관").x, find("서현관").z);
  const donui = local(campus, find("돈의관").x, find("돈의관").z);
  assert(
    seohyeon.v > donui.v,
    "Seohyeon belongs beside the lower dormitory complex",
  );
  for (const building of layout.buildings)
    for (const s of building.segments)
      assert(
        local(campus, s.x, s.z).v >= -21,
        "No large block replaces the tiny rear sheds",
      );
});

test("HSSH stairs connect the main entrance and gym centre with descending physical treads", () => {
  const layout = getSchool("hssh").createLayout();
  const stairs = layout.siteDetails.stairs[0];
  const main = layout.buildings[0],
    gym = layout.buildings[2];
  assert.equal(stairs.upperY, main.baseY);
  assert.equal(stairs.lowerY, gym.baseY);
  const centre = local(campus, stairs.x, stairs.z);
  assert.equal(centre.u, local(campus, gym.x, gym.z).u);
  assert(Math.abs(centre.v - stairs.depth / 2 - -13) < 1e-8);
  assert(Math.abs(centre.v + stairs.depth / 2 - -2.5) < 1e-8);
  const parts = [];
  addSiteScenery({
    layout,
    terrain: { heightAt: layout.elevationAt },
    object: (kind) => ({ kind }),
    framedPart(o, type, frame, u, y, v, w, h, d) {
      if (o.kind !== "stair") return;
      const p = layout.point(frame, u, v);
      parts.push({ p, w, d, top: layout.elevationAt(p.x, p.z) + y + h / 2 });
    },
  });
  assert.equal(parts.length, stairs.count);
  assert.equal(parts[0].top, main.baseY);
  assert.equal(parts.at(-1).top, gym.baseY + 0.5);
  for (let i = 0; i < parts.length; i++) {
    assert(parts[i].w >= 10, "The entrance stair is broad");
    const f = local(layout.field, parts[i].p.x, parts[i].p.z);
    assert(Math.abs(f.u) > layout.field.w / 2 + parts[i].w / 2);
    if (i) assert.equal(parts[i - 1].top - parts[i].top, 0.5);
  }
});
