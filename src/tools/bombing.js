/* A bounded cinematic game effect. One sweep is one undoable action. */
export const CampusBombing = {
  plan(point, angle) {
    const dx = Math.cos(angle),
      dz = -Math.sin(angle),
      sx = -dz,
      sz = dx,
      offsets = [];
    for (let row = 0; row < 7; row++)
      for (let lane = 0; lane < 3; lane++) {
        const along = (row - 3) * 14,
          across = (lane - 1) * 18;
        offsets.push({
          x: dx * along + sx * across,
          z: dz * along + sz * across,
          delay: row * 0.36 + lane * 0.1,
        });
      }
    // Translate the entire strip at the boundary, retaining spacing between bombs.
    const ex = Math.max(...offsets.map((p) => Math.abs(p.x))),
      ez = Math.max(...offsets.map((p) => Math.abs(p.z)));
    const cx = Math.max(-70 + ex, Math.min(70 - ex, point.x)),
      cz = Math.max(-53 + ez, Math.min(53 - ez, point.z));
    return offsets.map((p) => ({ ...p, x: p.x + cx, z: p.z + cz }));
  },
  create(T, root, terrain, onImpact, onProgress, surfaceHeight) {
    let run = null;
    function clear() {
      if (!run) return;
      root.remove(run.group);
      for (const g of run.geometries) g.dispose();
      for (const m of run.materials) m.dispose();
      run = null;
    }
    function start(point, angle, power) {
      clear();
      const group = new T.Group();
      root.add(group);
      const bodyGeo = new T.SphereGeometry(1, 12, 8),
        finGeo = new T.BoxGeometry(1.8, 0.8, 0.12),
        bandGeo = new T.CylinderGeometry(0.67, 0.67, 0.25, 10),
        ringGeo = new T.RingGeometry(1.8, 2, 24);
      const bodyMat = new T.MeshStandardMaterial({
          color: "#343b38",
          metalness: 0.4,
          roughness: 0.6,
        }),
        bandMat = new T.MeshStandardMaterial({
          color: "#e8b04b",
          roughness: 0.7,
        }),
        markerMat = new T.MeshBasicMaterial({
          color: "#f2b15a",
          transparent: true,
          opacity: 0.65,
          side: T.DoubleSide,
          depthWrite: false,
        });
      const bombs = CampusBombing.plan(point, angle).map((p) => {
        const mesh = new T.Group(),
          body = new T.Mesh(bodyGeo, bodyMat);
        body.scale.set(0.65, 1.7, 0.65);
        mesh.add(body);
        const band = new T.Mesh(bandGeo, bandMat);
        mesh.add(band);
        for (let i = 0; i < 2; i++) {
          const fin = new T.Mesh(finGeo, bodyMat);
          fin.position.y = 1.5;
          fin.rotation.y = (i * Math.PI) / 2;
          mesh.add(fin);
        }
        mesh.visible = false;
        mesh.traverse((o) => {
          if (o.isMesh) o.castShadow = true;
        });
        group.add(mesh);
        const marker = new T.Mesh(ringGeo, markerMat);
        marker.rotation.x = -Math.PI / 2;
        marker.position.set(p.x, surfaceHeight(p.x, p.z) + 0.2, p.z);
        group.add(marker);
        return { ...p, mesh, marker, released: false, done: false, targetY: 0 };
      });
      run = {
        group,
        bombs,
        power,
        age: 0,
        hits: 0,
        geometries: [bodyGeo, finGeo, bandGeo, ringGeo],
        materials: [bodyMat, bandMat, markerMat],
      };
      onProgress(0, bombs.length);
    }
    function update(dt) {
      if (!run) return;
      const r = run;
      r.age += dt;
      for (const b of r.bombs) {
        const flight = r.age - b.delay;
        if (b.done || flight < 0) continue;
        if (!b.released) {
          b.released = true;
          b.targetY = surfaceHeight(b.x, b.z);
          b.mesh.visible = true;
        }
        const t = Math.min(1, flight / 1.3),
          remaining = 1 - t * t;
        b.mesh.position.set(
          b.x - 5 * remaining,
          b.targetY + 1.7 + 85 * remaining,
          b.z - 3 * remaining,
        );
        b.mesh.rotation.y = flight * 2;
        if (t >= 1) {
          b.done = true;
          b.mesh.visible = b.marker.visible = false;
          r.hits++;
          onImpact(new T.Vector3(b.x, b.targetY, b.z), r.power);
          onProgress(r.hits, r.bombs.length);
        }
      }
      if (r.hits === r.bombs.length) clear();
    }
    return { start, update, clear, active: () => !!run };
  },
};
