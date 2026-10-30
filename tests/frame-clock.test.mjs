import test from "node:test";
import assert from "node:assert/strict";
import { createFrameClock } from "../src/rendering/frame-clock.js";

test("60 FPS pacing preserves fractional time on 60/75/120/144/165 Hz displays", () => {
  for (const hz of [60, 75, 120, 144, 165]) {
    const clock = createFrameClock();
    let frames = 0,
      elapsed = 0;
    for (let i = 1; i <= hz * 10; i++) {
      const dt = clock.tick((i * 1000) / hz, 1000 / 60);
      if (dt) {
        frames++;
        elapsed += dt;
      }
    }
    assert(Math.abs(frames - 600) <= 1, `${hz} Hz produced ${frames} frames`);
    assert(Math.abs(elapsed - 10) < 0.02);
  }
});

test("low mode targets 30 FPS, stalls and hidden tabs do not cause catch-up bursts", () => {
  const clock = createFrameClock();
  let frames = 0;
  for (let i = 1; i <= 1440; i++)
    if (clock.tick((i * 1000) / 144, 1000 / 30)) frames++;
  assert(Math.abs(frames - 300) <= 1);
  assert.equal(clock.tick(15_000, 1000 / 60), 0.25);
  assert.equal(clock.tick(15_001, 1000 / 60), 0);
  clock.reset(30_000);
  assert.equal(clock.tick(30_001, 1000 / 60), 0);
  assert(clock.tick(30_017, 1000 / 60) < 0.02);
});
