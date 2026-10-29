import { createSupportGraph } from "./support.js";

export function createDamageSystem({
  T,
  layout,
  terrain,
  scenery,
  blocks,
  buildings,
  fx,
  fires,
  groundDecor,
  audio,
  reduce,
  getPower,
  onScore,
  onShake,
  nextFireKey,
  onFeedback,
  updateStats,
  toast,
}) {
  const noise = (b, offset = 0) => {
    const value =
      Math.sin(
        b.origin.x * 12.9898 +
          b.origin.z * 78.233 +
          b.origin.y * 37.719 +
          offset,
      ) * 43758.5453;
    return value - Math.floor(value);
  };
  const foundations = new Map();
  for (const b of blocks) {
    if (b.kind !== "column" || b.story !== 0 || b.building?.link) continue;
    // Adjacent wings share slab supports; a rendering segment boundary must
    // not prevent the local column budget from reaching those supports.
    const structure = b.building ?? b.segment;
    if (!foundations.has(structure)) foundations.set(structure, []);
    foundations.get(structure).push(b);
  }
  function quakeTargets(p, power) {
    let nearest = Infinity,
      anchor = null,
      group = null;
    for (const columns of foundations.values())
      for (const b of columns) {
        if (b.active) continue;
        const distance = Math.hypot(b.origin.x - p.x, b.origin.z - p.z);
        if (distance < nearest) {
          nearest = distance;
          anchor = b;
          group = columns;
        }
      }
    if (!anchor) return new Set();
    // Fail an adjacent bay, not a fixed, scattered subset that stalls on repeats.
    // Existing active state is the damage history, so Undo needs no extra counter.
    const candidates = group.filter((b) => !b.active);
    candidates.sort(
      (a, b) =>
        Math.hypot(a.origin.x - anchor.origin.x, a.origin.z - anchor.origin.z) -
        Math.hypot(b.origin.x - anchor.origin.x, b.origin.z - anchor.origin.z),
    );
    return new Set(candidates.slice(0, Math.min(6, 3 + Math.ceil(power))));
  }
  function activate(b, p, mode, strength = getPower(), exposure = 1) {
    b.delay = 0;
    b.age = 0;
    b.collapse = false;
    b.contactTime = 0;
    const dx = b.p.x - p.x,
      dy = b.p.y - p.y,
      dz = b.p.z - p.z,
      len = Math.hypot(dx, dy * 0.7, dz) || 1;
    b.active = true;
    b.sleep = false;
    const boost =
      ((mode === "shockwave"
        ? 58
        : mode === "nuke"
          ? 35
          : mode === "meteor"
            ? 28
            : mode === "quake"
              ? 5
              : 18) *
        Math.sqrt(strength) *
        exposure) /
      Math.pow(b.mass || 1, 0.65);
    if (mode === "quake") {
      b.v.set((noise(b) - 0.5) * 2, -0.7, (noise(b, 3) - 0.5) * 2);
      b.delay = noise(b, 7) * 0.22 + Math.hypot(dx, dz) / 160;
      b.collapse = true;
    } else {
      b.v.set(
        (dx / len) * boost,
        (dy / len) * boost * 0.65 +
          (mode === "shockwave" ? boost * 0.28 : boost * 0.12),
        (dz / len) * boost,
      );
      b.delay = mode === "nuke" ? 0 : Math.hypot(dx, dz) / 220;
    }
    b.spin.set(
      ((noise(b, 11) - 0.5) * 1.9 * exposure) / b.mass,
      ((noise(b, 17) - 0.5) * 0.8 * exposure) / b.mass,
      ((noise(b, 23) - 0.5) * 1.9 * exposure) / b.mass,
    );
  }
  const propagate = createSupportGraph(blocks, (b, x, z, delay) => {
    const dx = x - b.origin.x,
      dz = z - b.origin.z,
      length = Math.hypot(dx, dz) || 1;
    b.active = true;
    b.sleep = false;
    b.collapse = true;
    b.contactTime = 0;
    b.age = 0;
    b.delay = delay + noise(b, 31) * 0.055;
    b.v.set((dx / length) * 0.8, -0.4, (dz / length) * 0.8);
    // A failed bay tips toward the missing support; heavy slabs retain a coherent attitude.
    const tilt = b.kind === "slab" ? 0.14 : 0.27;
    b.spin.set((dz / length) * tilt, 0, (-dx / length) * tilt);
  });
  function impact(p, mode, strength = getPower()) {
    const power = strength;
    const radius =
      {
        bombing: 8,
        meteor: 24,
        volcano: 24,
        lava: 7,
        volcanicBomb: 9,
        quake: 300,
        nuke: 400,
      }[mode] * Math.sqrt(power);
    let count = 0;
    if (mode === "bombing") terrain.crater(p, power, false, true);
    if (mode === "meteor" || mode === "nuke")
      terrain.crater(p, power, mode === "nuke");
    if (mode === "quake") terrain.quake(p, power);
    if (mode === "lava") terrain.burn(p, 7 * Math.sqrt(power));
    if (mode === "volcanicBomb") terrain.crater(p, power, false, true);
    groundDecor();
    const shakingColumns = mode === "quake" ? quakeTargets(p, power) : null;
    for (const b of blocks) {
      if (b.active) continue;
      const d =
        mode === "volcano"
          ? Math.hypot(b.p.x - p.x, b.p.z - p.z)
          : Math.sqrt(
              (b.p.x - p.x) ** 2 +
                (b.p.z - p.z) ** 2 +
                (b.p.y - p.y) ** 2 * 0.45,
            );
      if (d < radius) {
        const exposure = Math.max(0, 1 - d / radius),
          energy = exposure * exposure;
        if (mode === "quake") {
          if (!shakingColumns.has(b)) continue;
        } else if (
          mode !== "nuke" &&
          energy <
            (b.kind === "column" ? 0.13 : b.kind === "slab" ? 0.08 : 0.025)
        )
          continue;
        activate(b, p, mode, power, mode === "nuke" ? 1 : 0.3 + exposure * 0.7);
        if (
          mode === "volcano" ||
          mode === "lava" ||
          mode === "volcanicBomb" ||
          mode === "bombing"
        )
          b.charred = true;
        count++;
      }
    }
    if (
      mode === "bombing" ||
      mode === "meteor" ||
      mode === "nuke" ||
      mode === "quake"
    ) {
      for (const b of blocks) {
        if (
          !b.active &&
          b.kind === "column" &&
          b.story === 0 &&
          terrain.heightAt(b.origin.x, b.origin.z) <
            layout.elevationAt(b.origin.x, b.origin.z) - 1
        ) {
          activate(b, p, "quake", power);
          count++;
        }
      }
    }
    count += propagate();
    count += scenery.damage(p, mode, power);
    onScore(count * 10);
    audio(mode, power);
    if (count) {
      onShake(
        reduce ? 0 : mode === "quake" ? 3.2 : mode === "meteor" ? 2.4 : 1.2,
      );
    }
    if (mode === "nuke") {
      fx.nuclear(p, power);
      onShake(reduce ? 0 : 4);
      fires.length = 0;
      for (let z = -48; z <= 48; z += 12) {
        for (let x = -63; x <= 63; x += 14) {
          const px = x + (Math.random() - 0.5) * 10,
            pz = z + (Math.random() - 0.5) * 10;
          fires.push({
            p: new T.Vector3(px, terrain.heightAt(px, pz) + 0.3, pz),
            life: 45 + Math.random() * 15,
            id: -1,
            key: nextFireKey(),
            strength: 0.85 + Math.random() * 1.35,
          });
        }
      }
      terrain.burn(p, 75);
      groundDecor();
    } else if (mode === "quake") {
      for (const b of buildings) fx.dust(new T.Vector3(b.x, 0, b.z));
    } else if (mode !== "lava") fx.burst(p, mode, power);
    if (mode === "lava" || mode === "volcanicBomb") {
      fires.push({
        p: new T.Vector3(p.x, terrain.heightAt(p.x, p.z) + 0.3, p.z),
        life: 24 + Math.random() * 12,
        id: -1,
        key: nextFireKey(),
        strength: 1 + Math.random() * 0.65,
      });
      while (fires.length > 112) fires.shift();
    }
    if (mode === "bombing") {
      fires.push({
        p: new T.Vector3(p.x, terrain.heightAt(p.x, p.z) + 0.3, p.z),
        life: 9,
        id: -1,
        key: nextFireKey(),
        strength: 0.8,
      });
      while (fires.length > 72) fires.shift();
    }
    const flashLevel = reduce
      ? 0
      : mode === "bombing"
        ? 0.07
        : mode === "nuke"
          ? 0.65
          : mode === "meteor"
            ? 0.28
            : mode === "quake"
              ? 0
              : 0.12;
    const caption =
      (mode === "bombing"
        ? "BOMB IMPACT"
        : mode === "nuke"
          ? "TOTAL DESTRUCTION"
          : mode === "meteor"
            ? "METEOR STRIKE"
            : mode === "quake"
              ? "SHAKE IT!"
              : mode === "volcano"
                ? "ERUPTION"
                : mode === "lava"
                  ? "LAVA FLOW"
                  : mode === "volcanicBomb"
                    ? "VOLCANIC IMPACT"
                    : "IMPACT!") +
      " +" +
      count * 10;
    onFeedback(flashLevel, caption);
    if (!count && !["bombing", "lava", "volcanicBomb"].includes(mode))
      toast("남아 있는 건물·나무·시설을 눌러보세요");
    updateStats();
  }

  return { activate, impact, propagate };
}
