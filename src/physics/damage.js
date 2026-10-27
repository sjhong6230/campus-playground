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
  function activate(b, p, mode, strength = getPower()) {
    b.delay = 0;
    b.age = 0;
    const dx = b.p.x - p.x,
      dz = b.p.z - p.z,
      len = Math.hypot(dx, dz) || 1;
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
        Math.sqrt(strength)) /
      b.mass;
    if (mode === "quake") {
      b.v.set((Math.random() - 0.5) * 4, -1, (Math.random() - 0.5) * 4);
      b.delay = Math.random() * 0.55 + b.story * 0.11;
    } else {
      b.v.set(
        (dx / len) * (boost + Math.random() * 10),
        3 + Math.random() * boost * 0.55,
        (dz / len) * (boost + Math.random() * 10),
      );
    }
    b.spin.set(
      ((Math.random() - 0.5) * 2.5) / b.mass,
      ((Math.random() - 0.5) * 2.5) / b.mass,
      ((Math.random() - 0.5) * 2.5) / b.mass,
    );
  }
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
        activate(b, p, mode, power);
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
    // Remove support story by story. Heavy slabs lose support before the stories above them.
    for (const building of buildings) {
      let failed = -1;
      for (let story = 0; story < building.floors; story++) {
        const supports = building.ids
          .map((i) => blocks[i])
          .filter((b) => b.story === story && b.kind === "column");
        const walls = building.ids
          .map((i) => blocks[i])
          .filter((b) => b.story === story && b.kind === "wall");
        if (
          (supports.length &&
            supports.filter((b) => b.active).length / supports.length >= 0.5) ||
          (walls.length &&
            walls.filter((b) => b.active).length / walls.length > 0.7)
        ) {
          failed = story;
          break;
        }
      }
      if (failed < 0) continue;
      for (const id of building.ids) {
        const b = blocks[id];
        if (!b.active && b.story >= failed) {
          activate(b, p, "quake", power);
          b.delay = 0.2 + (b.story - failed) * 0.16 + Math.random() * 0.22;
          count++;
        }
      }
    }
    count += scenery.damage(p, mode, power);
    onScore(count * 10);
    if (count) {
      audio(mode === "meteor" ? 1.5 : 1);
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
        ? "CARPET BOMBING"
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

  return { activate, impact };
}
