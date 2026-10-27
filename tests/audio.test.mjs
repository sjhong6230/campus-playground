import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { synthesizeSound, soundProfiles } from "../src/audio/synthesis.js";
import { createImpactAudio } from "../src/audio/impact.js";

test("sound profiles produce distinct, finite, bounded signals with smooth tails", () => {
  const hashes = new Set();
  for (const [kind, profile] of Object.entries(soundProfiles)) {
    const samples = synthesizeSound(kind, 24000);
    assert.equal(samples.length, Math.ceil(profile.duration * 24000));
    assert.equal(Math.abs(samples[0]), 0);
    let energy = 0,
      peak = 0;
    for (const n of samples) {
      assert(Number.isFinite(n));
      peak = Math.max(peak, Math.abs(n));
      energy += n * n;
    }
    assert(peak > 0.01 && peak < 0.81, kind);
    assert(energy / samples.length > 0.000001, kind + " is audible");
    assert(Math.abs(samples.at(-1)) < 0.001, kind + " fades to silence");
    hashes.add(
      createHash("sha256").update(Buffer.from(samples.buffer)).digest("hex"),
    );
  }
  assert.equal(hashes.size, Object.keys(soundProfiles).length);
});

test("audio reuses buffers, bounds voices, throttles lava and stops on Undo/mute", () => {
  let enabled = false,
    initialized = 0,
    buffers = 0,
    active = 0,
    closed = false;
  const node = () => ({ connect() {}, disconnect() {}, gain: { value: 1 } });
  const ctx = {
    currentTime: 0,
    sampleRate: 24000,
    destination: {},
    createGain: node,
    createDynamicsCompressor: () => ({
      ...node(),
      threshold: {},
      knee: {},
      ratio: {},
      attack: {},
      release: {},
    }),
    createBuffer: () => {
      buffers++;
      return { copyToChannel() {} };
    },
    createBufferSource: () => {
      let running = false;
      return {
        ...node(),
        start() {
          running = true;
          active++;
        },
        stop() {
          if (running) active--;
          running = false;
          this.onended?.();
        },
      };
    },
    resume: async () => {},
    close: async () => {
      closed = true;
    },
  };
  const audio = createImpactAudio(
    () => enabled,
    () => {
      initialized++;
      return ctx;
    },
  );
  audio("bombing");
  assert.equal(initialized, 0);
  enabled = true;
  for (let i = 0; i < 20; i++) {
    ctx.currentTime += 0.1;
    audio("bombing");
  }
  assert.equal(buffers, 1);
  assert.equal(active, 6);
  audio.stop();
  assert.equal(active, 0);
  audio("lava");
  ctx.currentTime += 0.1;
  audio("lava");
  assert.equal(active, 1);
  enabled = false;
  audio.stop();
  audio("meteor");
  assert.equal(active, 0);
  assert.equal(buffers, 2);
  audio.dispose();
  assert(closed);
});
