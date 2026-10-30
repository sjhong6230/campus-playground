import { createBlackHoleVisual } from "../effects/blackhole-visual.js";
export const BLACK_HOLE_DURATION = 4.6;
/* Stylized black hole: bounded capture field and disposable local geometry. */
export const CampusBlackHole = {
  pull(body, field, dt) {
    if (body.consumed) return true;
    const d = body.p.distanceTo(field.p);
    if (d > field.radius + 4) return false;
    body.sleep = false;
    body.delay = 0;
    if (d < field.core + 1.2) {
      (field.captured ??= new Set()).add(body);
      body.consumed = true;
      body.drawScale = 0;
      body.sleep = true;
      body.burn = 0;
      body.v.set(0, 0, 0);
      body.p.y = -1000;
      return true;
    }
    const dx = (field.p.x - body.p.x) / d,
      dy = (field.p.y - body.p.y) / d,
      dz = (field.p.z - body.p.z) / d;
    // Orbit first, then accelerate inward. Heavy slabs and light panels do not
    // move as a single rigid cloud; phase is derived from immutable origins.
    const origin = body.origin || body.p,
      phase = origin.x * 0.73 + origin.z * 0.41 + origin.y * 0.29,
      age = field.age || 0,
      collapse = Math.max(0, Math.min(1, (age - 3.5) / 0.8)),
      pulse = 0.5 + 0.5 * Math.sin(age * 11 + phase),
      mass = Math.pow(body.mass || 1, 0.15),
      speed = (12 + 14 / (1 + d * 0.08) + collapse * 72 + pulse * 7) / mass,
      blend = 1 - Math.exp(-dt * 6),
      swirl = Math.min(45, d * 2.8) * (1 - collapse * 0.7),
      horizontal = Math.hypot(dx, dz) || 1,
      lift = Math.sin(age * 6 + phase) * 6 * (1 - collapse);
    body.v.x += (dx * speed - (dz / horizontal) * swirl - body.v.x) * blend;
    body.v.y += (dy * speed + lift - body.v.y) * blend;
    body.v.z += (dz * speed + (dx / horizontal) * swirl - body.v.z) * blend;
    body.spin.x += ((2 + Math.sin(phase) * 3) / mass - body.spin.x) * blend;
    body.spin.y += ((4 + pulse * 3) / mass - body.spin.y) * blend;
    body.spin.z += ((Math.cos(phase) * 4) / mass - body.spin.z) * blend;
    body.drawScale = Math.min(
      1,
      Math.max(0.06, (d - field.core) / (field.core * 0.85)),
    );
    body.stretch = 1 + (1 - body.drawScale) * 3.8;
    body.pullAxis ||= { x: 0, y: 0, z: 0 };
    body.pullAxis.x = dx;
    body.pullAxis.y = dy;
    body.pullAxis.z = dz;
    body.p.addScaledVector(body.v, dt);
    body.r.addScaledVector(body.spin, dt);
    return true;
  },
  eject(field) {
    let index = 0;
    const captured = field.captured || new Set();
    for (const body of captured) {
      const i = index++,
        angle = i * 2.3999632297,
        r = field.core + 3 + (i % 7) * 1.3,
        lift = 0.18 + (i % 11) / 14,
        speed =
          ((70 + (i % 9) * 5) * Math.sqrt(field.power)) /
          Math.pow(body.mass || 1, 0.25);
      body.consumed = false;
      body.drawScale = 1;
      body.stretch = 1;
      body.pullAxis = null;
      body.active = true;
      body.sleep = false;
      body.delay = 0;
      body.age = 0;
      body.burn = 0;
      body.p.set(
        field.p.x + Math.cos(angle) * r,
        field.p.y + ((i % 5) - 2) * 1.8,
        field.p.z + Math.sin(angle) * r,
      );
      body.v.set(
        Math.cos(angle) * speed,
        lift * speed,
        Math.sin(angle) * speed,
      );
      body.spin.set(
        Math.sin(angle) * 4,
        2 + Math.cos(angle) * 3,
        Math.cos(angle) * 4,
      );
    }
    captured.clear();
    return index;
  },
  create(T, root, onFinish) {
    let state = null;
    function clear() {
      if (!state) return;
      state.visual.dispose();
      state = null;
    }
    function start(p, power) {
      clear();
      const core = 3.5 * Math.sqrt(power);
      const visual = createBlackHoleVisual(T, core);
      visual.group.position.copy(p);
      root.add(visual.group);
      state = {
        p: p.clone(),
        power,
        core,
        radius: 8,
        age: 0,
        captured: new Set(),
        group: visual.group,
        visual,
      };
      return state;
    }
    function update(dt, camera) {
      if (!state) return;
      const s = state;
      s.age += dt;
      s.radius = (8 + 16 * Math.min(1, s.age / 2.6)) * Math.sqrt(s.power);
      s.visual.update(s.age, camera, BLACK_HOLE_DURATION);
      if (s.age >= BLACK_HOLE_DURATION) {
        const p = s.p.clone(),
          power = s.power,
          ejected = CampusBlackHole.eject(s);
        clear();
        onFinish(p, power, ejected);
      }
    }
    return { start, update, clear, field: () => state, active: () => !!state };
  },
};
