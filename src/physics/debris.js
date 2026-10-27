import { CampusBlackHole } from "../tools/blackhole.js";

/** Advance active debris only; sleeping and captured fragments skip integration. */
export function createDebrisSimulation({ blocks, terrain, fx }) {
  let lastDust = 0;
  return function step(dt, field, time) {
    let moving = false;
    for (const b of blocks) {
      if (b.consumed || !b.active || b.sleep) continue;
      if (b.delay > 0) {
        b.delay -= dt;
        continue;
      }
      moving = true;
      b.age += dt;
      if (field && CampusBlackHole.pull(b, field, dt)) continue;
      b.v.y -= 35 * dt;
      b.p.addScaledVector(b.v, dt);
      b.r.addScaledVector(b.spin, dt);
      const onIsland = Math.abs(b.p.x) < 76 && Math.abs(b.p.z) < 59;
      const floor = onIsland
        ? terrain.heightAt(b.p.x, b.p.z) + b.rest + 0.18
        : -12;
      if (b.p.y < floor) {
        if (time - lastDust > 0.16 && b.v.y < -8) {
          fx.dust(b.p);
          lastDust = time;
        }
        b.p.y = floor;
        b.v.y = Math.abs(b.v.y) * 0.12;
        b.v.x *= 0.65;
        b.v.z *= 0.65;
        b.spin.multiplyScalar(0.4);
        if (b.kind === "wall") {
          b.r.x += (b.flatX - b.r.x) * 0.55;
          b.r.z += (b.flatZ - b.r.z) * 0.55;
        } else if (b.kind === "slab") {
          b.r.x *= 0.4;
          b.r.z *= 0.4;
        }
        if (b.v.length() < 2.2) {
          b.v.set(0, 0, 0);
          b.spin.set(0, 0, 0);
          b.sleep = true;
        }
      }
      if (Math.abs(b.p.x) > 200 || Math.abs(b.p.z) > 180) {
        b.sleep = true;
        b.p.y = -40;
      }
    }
    return moving;
  };
}
