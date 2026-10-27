import test from "node:test";
import assert from "node:assert/strict";
import { createFrameGate } from "../src/rendering/frame-gate.js";

test("idle scenes skip rendering; input and final effect cleanup still render", () => {
  const render = createFrameGate();
  assert(render(false, false));
  for (let i = 0; i < 120; i++) assert.equal(render(false, false), false);
  assert(
    render(false, true),
    "Camera, resize, Undo and lighting invalidate the scene",
  );
  assert.equal(render(false, false), false);
  for (let i = 0; i < 120; i++) assert(render(true, false));
  assert(render(false, false), "One final render removes expired effects");
  assert.equal(render(false, false), false);
});
