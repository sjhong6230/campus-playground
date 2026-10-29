import test from "node:test";
import assert from "node:assert/strict";
import { getSchool } from "../src/schools/index.js";
import { local } from "../src/schools/shared/layout.js";

test("BSIS preserves the seven named school buildings", () => {
  const layout = getSchool("bsis").createLayout();
  assert.deepEqual(
    layout.buildings.map((building) => building.name.split(" · ")[0]).sort(),
    [
      "제석관",
      "창의관",
      "면학관",
      "형설관",
      "회화관",
      "모란관",
      "승학관",
    ].sort(),
  );
});

test("BSIS places its field west of the gym and its main gate on the southern approach", () => {
  const layout = getSchool("bsis").createLayout(),
    gym = layout.buildings.find((building) =>
      building.name.startsWith("승학관"),
    );
  const corners = (frame) =>
    [-frame.w / 2, frame.w / 2].flatMap((u) =>
      [-frame.d / 2, frame.d / 2].map((v) => layout.point(frame, u, v)),
    );
  const fieldCorners = corners(layout.field),
    gymCorners = gym.segments.flatMap(corners);
  assert(
    Math.max(...fieldCorners.map((p) => p.x)) <
      Math.min(...gymCorners.map((p) => p.x)),
    "The field and gym must remain separate on the west and east sides",
  );
  assert(
    layout.gate.z >
      Math.max(...[...fieldCorners, ...gymCorners].map((p) => p.z)),
    "The main gate belongs south of the field and gym",
  );
  assert.equal(layout.gate.sign, "부산일과학고등학교");
});

test("BSIS keeps the central courtyard open between the classroom wings", () => {
  const layout = getSchool("bsis").createLayout(),
    courtyard = { x: -11, z: -7 },
    structures = [
      ...layout.buildings.flatMap((building) => building.segments),
      ...layout.links,
    ];
  for (const frame of structures) {
    const { u, v } = local(frame, courtyard.x, courtyard.z);
    assert(
      Math.abs(u) >= frame.w / 2 || Math.abs(v) >= frame.d / 2,
      "A building or bridge spans the open courtyard center",
    );
  }
});
