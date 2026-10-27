/* Ground-following lava streams and ballistic volcanic bombs; one undoable eruption. */
export const createCampusVolcano = function (
  T,
  root,
  terrain,
  fx,
  onHit,
  onDone,
) {
  let runs = [];
  function dispose(r) {
    root.remove(r.group);
    const geos = new Set(),
      mats = new Set();
    r.group.traverse((o) => {
      if (o.geometry) geos.add(o.geometry);
      if (o.material) mats.add(o.material);
    });
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
  }
  function clear() {
    runs.forEach(dispose);
    runs = [];
  }
  function build(p, power, age = 0) {
    const group = new T.Group();
    root.add(group);
    const scale = Math.sqrt(power),
      radius = 17 * scale,
      vent = p.clone();
    vent.y = terrain.heightAt(p.x, p.z) + 0.7;
    const material = new T.ShaderMaterial({
      uniforms: { time: { value: age }, cool: { value: 1 } },
      vertexShader:
        "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader:
        "varying vec2 vUv;uniform float time;uniform float cool;void main(){float waves=sin(vUv.y*75.-time*1.4+sin(vUv.x*17.))*sin(vUv.x*21.+vUv.y*31.);float crust=smoothstep(-.2,.6,waves);vec3 lava=mix(vec3(1.,.12,.005),vec3(1.,.7,.08),.5+.5*sin(vUv.y*35.-time*2.));vec3 color=mix(lava,vec3(.08,.045,.025),crust*.85);gl_FragColor=vec4(mix(vec3(.1,.08,.06),color,cool),1.);}",
      side: T.DoubleSide,
    });
    const streams = [];
    for (let k = 0; k < 6; k++) {
      const positions = [],
        uv = [],
        indices = [],
        path = [];
      const base = (k * Math.PI) / 3 + 0.2;
      for (let i = 0; i <= 28; i++) {
        const t = i / 28,
          a = base + Math.sin(t * 5 + k) * 0.12,
          r = radius * (0.12 + t * 1.75),
          x = p.x + Math.cos(a) * r,
          z = p.z + Math.sin(a) * r,
          width = (1.7 + Math.sin(t * 9 + k) * 0.35) * scale;
        path.push(new T.Vector3(x, terrain.heightAt(x, z) + 0.24, z));
        for (const side of [-1, 1]) {
          const px = x + Math.sin(a) * width * side,
            pz = z - Math.cos(a) * width * side;
          positions.push(px, terrain.heightAt(px, pz) + 0.26, pz);
          uv.push((side + 1) / 2, t);
        }
        if (i < 28) {
          const n = i * 2;
          indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
        }
      }
      const geo = new T.BufferGeometry();
      geo.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
      geo.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
      geo.setIndex(indices);
      const mesh = new T.Mesh(geo, material);
      mesh.frustumCulled = false;
      group.add(mesh);
      streams.push({ mesh, path, lastDamage: 0 });
    }
    const poolGeo = new T.CircleGeometry(radius * 0.17, 48);
    poolGeo.rotateX(-Math.PI / 2);
    const pool = new T.Mesh(poolGeo, material);
    pool.position.copy(vent);
    group.add(pool);
    const bombGeo = new T.IcosahedronGeometry(1, 1),
      bombMat = new T.MeshStandardMaterial({
        color: "#2e1913",
        emissive: "#ff4507",
        emissiveIntensity: 2,
        roughness: 1,
      }),
      bombs = [];
    for (let i = 0; i < 24; i++) {
      const a = i * 2.399963,
        r = (22 + (i % 7) * 4) * scale,
        x = Math.max(-72, Math.min(72, p.x + Math.cos(a) * r)),
        z = Math.max(-55, Math.min(55, p.z + Math.sin(a) * r)),
        mesh = new T.Mesh(bombGeo, bombMat);
      mesh.scale.setScalar(0.8 + (i % 4) * 0.25);
      mesh.visible = false;
      mesh.castShadow = true;
      group.add(mesh);
      bombs.push({
        mesh,
        x,
        z,
        delay: 0.7 + i * 0.17,
        duration: 1.8 + (i % 4) * 0.18,
        done: age >= 8,
      });
    }
    const run = {
      p: p.clone(),
      power,
      age,
      group,
      material,
      streams,
      bombs,
      vent,
      nextAsh: 0,
      nextSurface: 0,
      complete: age >= 8,
    };
    runs.push(run);
    while (runs.length > 3) dispose(runs.shift());
    return run;
  }
  function start(p, power) {
    terrain.volcano(p, power);
    build(p, power);
    onHit(
      new T.Vector3(p.x, terrain.heightAt(p.x, p.z), p.z),
      "volcano",
      power,
    );
  }
  function update(dt) {
    for (let n = runs.length - 1; n >= 0; n--) {
      const r = runs[n];
      r.age += dt;
      r.material.uniforms.time.value = r.age;
      r.material.uniforms.cool.value = Math.max(
        0,
        Math.min(1, (32 - r.age) / 18),
      );
      if (r.age > r.nextSurface && r.terrainRevision !== terrain.revision) {
        r.terrainRevision = terrain.revision;
        r.nextSurface = r.age + 0.3;
        for (const s of r.streams) {
          const a = s.mesh.geometry.attributes.position;
          for (let i = 0; i < a.count; i++)
            a.setY(i, terrain.heightAt(a.getX(i), a.getZ(i)) + 0.26);
          a.needsUpdate = true;
        }
      }
      for (const s of r.streams) {
        const visible = Math.min(28, Math.floor((r.age / 7) * 28));
        s.mesh.geometry.setDrawRange(0, visible * 6);
        if (!r.complete && visible >= s.lastDamage + 5) {
          s.lastDamage = visible;
          const p = s.path[visible];
          if (Math.abs(p.x) < 74 && Math.abs(p.z) < 57)
            onHit(p, "lava", r.power);
        }
      }
      if (!r.complete) {
        fx.fire(r.vent, 1.8 * Math.sqrt(r.power), "vent-" + r.group.id);
        if (r.age > r.nextAsh) {
          r.nextAsh = r.age + 0.45;
          fx.ash(r.vent);
        }
        for (const b of r.bombs) {
          if (b.done || r.age < b.delay) continue;
          const t = Math.min(1, (r.age - b.delay) / b.duration);
          b.mesh.visible = true;
          const targetY = terrain.heightAt(b.x, b.z) + 0.8;
          b.mesh.position.set(
            r.vent.x + (b.x - r.vent.x) * t,
            r.vent.y +
              (targetY - r.vent.y) * t +
              Math.sin(t * Math.PI) * (30 + 8 * r.power),
            r.vent.z + (b.z - r.vent.z) * t,
          );
          b.mesh.rotation.x += dt * 3;
          b.mesh.rotation.z += dt * 2;
          if (t === 1) {
            b.done = true;
            b.mesh.visible = false;
            onHit(new T.Vector3(b.x, targetY, b.z), "volcanicBomb", r.power);
          }
        }
        if (r.age >= 8) {
          r.complete = true;
          onDone();
        }
      }
      if (r.age > 32) {
        dispose(r);
        runs.splice(n, 1);
      }
    }
  }
  function snapshot() {
    return runs.map((r) => ({ p: r.p.toArray(), power: r.power, age: r.age }));
  }
  function restore(states = []) {
    clear();
    for (const s of states)
      build(new T.Vector3().fromArray(s.p), s.power, Math.max(8, s.age));
    update(0);
  }
  return {
    start,
    update,
    clear,
    snapshot,
    restore,
    active: () => runs.some((r) => !r.complete),
  };
};
