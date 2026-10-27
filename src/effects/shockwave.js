/* The visible expanding front and its damage use the same radius. */
export const createCampusShockwave = function (
  T,
  root,
  terrain,
  onReach,
  onComplete,
) {
  let run = null;
  function clear() {
    if (!run) return;
    for (const m of run.rings) {
      root.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    }
    run = null;
  }
  function start(p, power) {
    clear();
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const geometry = new T.RingGeometry(0.965, 1, 64),
        mesh = new T.Mesh(
          geometry,
          new T.MeshBasicMaterial({
            color: i === 0 ? "#fff1cc" : "#d2b7ff",
            transparent: true,
            opacity: 1,
            side: T.DoubleSide,
            blending: T.AdditiveBlending,
            depthWrite: false,
          }),
        );
      mesh.userData.base = geometry.attributes.position.array.slice();
      mesh.frustumCulled = false;
      root.add(mesh);
      rings.push(mesh);
    }
    run = {
      p: p.clone(),
      power,
      age: 0,
      maxRadius: 32 * Math.sqrt(power),
      lastRadius: 0,
      rings,
    };
    update(0);
  }
  function update(dt) {
    if (!run) return;
    const r = run;
    r.age += dt;
    const t = Math.min(1, r.age / 0.9),
      radius = r.maxRadius * t;
    r.rings.forEach((m, i) => {
      const rr = Math.max(0.01, radius - i * 5),
        a = m.geometry.attributes.position,
        base = m.userData.base;
      for (let j = 0; j < a.count; j++) {
        const x = r.p.x + base[j * 3] * rr,
          z = r.p.z + base[j * 3 + 1] * rr;
        a.setXYZ(j, x, terrain.heightAt(x, z) + 0.7 + i * 0.18, z);
      }
      a.needsUpdate = true;
      m.material.opacity = (1 - t) * (0.95 - i * 0.18);
    });
    if (radius - r.lastRadius >= 5 || t === 1) {
      onReach(r.p, r.power, radius);
      r.lastRadius = radius;
    }
    if (t === 1) {
      clear();
      onComplete();
    }
  }
  return { start, update, clear, active: () => !!run };
};
