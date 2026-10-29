import { CampusFracture } from "../physics/fracture.js";
import { CampusBlackHole } from "../tools/blackhole.js";
import { addSiteScenery, gateSignTexture } from "./site-details.js";
/* Destructible planting, furniture, goal frames and irregular turf sheets.
   Shared instance batches keep a whole damaged campus inexpensive to draw. */
export const createCampusScenery = function (
  T,
  root,
  terrain,
  fx,
  random,
  visuals,
  layout,
) {
  let waveHit = new Set();
  const objects = [],
    parts = [],
    batches = {},
    turfParts = [],
    dummy = new T.Object3D();
  const fracture = CampusFracture(T, random);
  function object(kind, x, z, radius) {
    const o = {
      id: objects.length,
      kind,
      center: new T.Vector3(x, 0, z),
      radius,
      destroyed: false,
      parts: [],
    };
    objects.push(o);
    return o;
  }
  function part(o, type, x, y, z, sx, sy, sz, color) {
    const p = {
      id: parts.length,
      o,
      type,
      origin: new T.Vector3(x, y, z),
      p: new T.Vector3(x, y, z),
      v: new T.Vector3(),
      r: new T.Vector3(),
      spin: new T.Vector3(),
      baseR: new T.Vector3(),
      scale: new T.Vector3(sx, sy, sz),
      color: new T.Color(color),
      active: false,
      sleep: false,
      charred: false,
      age: 0,
      burn: 0,
      contactTime: 0,
    };
    parts.push(p);
    o.parts.push(p);
    return p;
  }
  function tree(x, z, s) {
    const o = object("tree", x, z, 3 * s);
    part(o, "wood", x, 0.9 * s, z, 0.48 * s, 1.8 * s, 0.48 * s, "#827258");
    part(o, "wood", x, 2.7 * s, z, 0.35 * s, 1.8 * s, 0.35 * s, "#938068");
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      part(
        o,
        "leaf",
        x + Math.cos(a) * 0.85 * s,
        (4.3 + (i === 0 ? 0.7 : 0)) * s,
        z + Math.sin(a) * 0.85 * s,
        1.9 * s,
        2.3 * s,
        1.9 * s,
        i === 0 ? "#71804b" : i === 1 ? "#4f683e" : "#637744",
      );
    }
  }
  const candidates =
    typeof layout.trees === "function" ? layout.trees(random) : layout.trees;
  let planted = 0;
  for (const [x, z] of candidates) {
    const overlaps = layout.buildings.some((b) =>
      b.segments.some((s) => {
        const dx = x - s.x,
          dz = z - s.z,
          c = Math.cos(s.angle),
          a = Math.sin(s.angle);
        return (
          Math.abs(dx * c - dz * a) < s.w / 2 + 3 &&
          Math.abs(dx * a + dz * c) < s.d / 2 + 3
        );
      }),
    );
    if (!overlaps && planted < (layout.maxTrees ?? 80)) {
      tree(x, z, 0.75 + random() * 0.35);
      planted++;
    }
  }
  function framedPart(o, type, frame, u, y, v, sx, sy, sz, color) {
    const q = layout.point(frame, u, v),
      p = part(o, type, q.x, y, q.z, sx, sy, sz, color);
    p.r.y = frame.angle || 0;
    p.baseR.copy(p.r);
    return p;
  }
  const field = layout.field;
  for (const u of [-field.w / 2 + 2, field.w / 2 - 2]) {
    const q = layout.point(field, u, 0),
      o = object("goal", q.x, q.z, 3.5);
    for (const v of [-3, 3])
      framedPart(o, "bar", field, u, 1.8, v, 0.3, 3.2, 0.3, "#f2edda");
    for (const v of [-1.6, 1.6])
      framedPart(o, "bar", field, u, 3.4, v, 0.3, 0.3, 3.2, "#f2edda");
  }
  addSiteScenery({ layout, terrain, object, framedPart });
  for (const [x, z] of layout.benches) {
    const o = object("bench", x, z, 2.8),
      f = { x, z, angle: 0.12 };
    for (const dz of [-0.45, 0.45])
      framedPart(o, "bar", f, 0, 1, dz, 5, 0.45, 0.7, "#897960");
    for (const dx of [-1.5, 1.5])
      framedPart(o, "bar", f, dx, 0.5, 0, 0.35, 1, 1.3, "#f2edda");
  }
  // Small parked cars are also destructible scenery.
  for (let i = 0; i < (layout.parking ? 7 : 0); i++) {
    const frame = layout.parking,
      q = layout.point(frame, -7 + i * 2.3, -3),
      o = object("car", q.x, q.z, 2);
    framedPart(
      o,
      "bar",
      frame,
      -7 + i * 2.3,
      0.65,
      -3,
      1.65,
      0.8,
      3,
      ["#d6dbd7", "#657a82", "#b1aea1"][i % 3],
    );
    framedPart(
      o,
      "bar",
      frame,
      -7 + i * 2.3,
      1.2,
      -3,
      1.4,
      0.65,
      1.65,
      "#596b70",
    );
  }
  // Two breakable basketball hoops on the western court.
  for (const sign of layout.courtKind === "basketball" ? [-1, 1] : []) {
    const f = layout.tennis,
      u = sign * (f.w / 2 - 1),
      q = layout.point(f, u, 0),
      o = object("basketballHoop", q.x, q.z, 2);
    framedPart(o, "bar", f, u, 1.6, 0, 0.22, 3.2, 0.22, "#656d67");
    framedPart(o, "bar", f, u - sign * 0.45, 3.1, 0, 0.16, 1.1, 1.9, "#e4e5d7");
    framedPart(o, "bar", f, u - sign * 1, 2.8, 0, 0.9, 0.1, 0.8, "#a45435");
  }
  if (layout.courtKind === "tennis") {
    const f = layout.tennis,
      q = layout.point(f, 0, 0),
      o = object("courtNet", q.x, q.z, 4);
    for (const v of [-f.d / 2, f.d / 2])
      framedPart(o, "bar", f, 0, 0.9, v, 0.18, 1.8, 0.18, "#6a716a");
    for (let i = 0; i < 4; i++)
      framedPart(o, "bar", f, 0, 0.4 + i * 0.3, 0, 0.06, 0.05, f.d, "#bfc3b5");
  }
  // Turf is part of the ground until torn off; its original painted lines travel with it.
  for (const cell of fracture.cells(field.w, field.d, 8, 5)) {
    const poly = cell.map(([u, v]) => {
        const p = layout.point(field, u - field.w / 2, v - field.d / 2);
        return [p.x, p.z];
      }),
      x = poly.reduce((s, p) => s + p[0], 0) / poly.length,
      z = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    const o = object("turf", x, z, 0);
    o.poly = poly;
    const p = part(
      o,
      "turf",
      x,
      terrain.heightAt(x, z) + 0.12,
      z,
      1,
      1,
      1,
      "#ffffff",
    );
    p.kind = "turf";
    p.building = { color: "#ffffff" };
    p.surfaces = [[], []];
    p.uvs = [[], []];
    p.ranges = [];
    p.rest = 0.22;
    p.p.y = -30;
    const vertex = (v, y) => new T.Vector3(v[0] - x, y, v[1] - z);
    function triangle(a, b, c, group, uv) {
      for (const v of [a, b, c]) p.surfaces[group].push(v.x, v.y, v.z);
      for (const v of uv)
        p.uvs[group].push((v[0] / 151 + 0.5) * 3.6, (0.5 - v[1] / 118) * 3);
    }
    for (let i = 1; i < poly.length - 1; i++) {
      triangle(
        vertex(poly[0], 0.1),
        vertex(poly[i + 1], 0.1),
        vertex(poly[i], 0.1),
        0,
        [poly[0], poly[i + 1], poly[i]],
      );
      triangle(
        vertex(poly[0], -0.25),
        vertex(poly[i], -0.25),
        vertex(poly[i + 1], -0.25),
        1,
        [poly[0], poly[i], poly[i + 1]],
      );
    }
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i],
        b = poly[(i + 1) % poly.length];
      triangle(vertex(a, 0.1), vertex(b, 0.1), vertex(b, -0.25), 1, [a, b, b]);
      triangle(vertex(a, 0.1), vertex(b, -0.25), vertex(a, -0.25), 1, [
        a,
        b,
        a,
      ]);
    }
    turfParts.push(p);
  }
  const crown = new T.IcosahedronGeometry(1, 2),
    cp = crown.attributes.position;
  for (let i = 0; i < cp.count; i++) {
    const x = cp.getX(i),
      y = cp.getY(i),
      z = cp.getZ(i),
      r =
        1 +
        0.11 * Math.sin(x * 17 + y * 9) * Math.cos(z * 13 - y * 7) +
        0.06 * Math.sin(z * 29 + x * 11);
    cp.setXYZ(i, x * r, y * r, z * r);
  }
  crown.computeVertexNormals();
  for (const [type, geometry] of Object.entries({
    wood: new T.CylinderGeometry(0.75, 1, 1, 7),
    leaf: crown,
    bar: new T.BoxGeometry(1, 1, 1),
    ...(layout.gate.sign ? { sign: new T.BoxGeometry(1, 1, 1) } : {}),
  })) {
    const entries = parts.filter((p) => p.type === type),
      mesh = new T.InstancedMesh(
        geometry,
        new T.MeshStandardMaterial({
          color: "#ffffff",
          roughness: 1,
          map:
            type === "wood"
              ? (visuals?.bark ?? null)
              : type === "sign"
                ? gateSignTexture(T, layout.gate.sign)
                : null,
        }),
        entries.length,
      );
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    root.add(mesh);
    batches[type] = { mesh, entries };
  }
  const turfBatch = fracture.batch(turfParts, [
    new T.MeshStandardMaterial({
      map: terrain.surfaceTexture,
      vertexColors: true,
      roughness: 1,
      side: T.DoubleSide,
    }),
    new T.MeshStandardMaterial({
      color: "#5a422c",
      vertexColors: true,
      roughness: 1,
      side: T.DoubleSide,
    }),
  ]);
  root.add(turfBatch.mesh);
  const tint = new T.Color();
  const rendered = new WeakMap();
  function sync() {
    for (const { mesh, entries } of Object.values(batches)) {
      let matrixLo = Infinity,
        matrixHi = 0,
        colorLo = Infinity,
        colorHi = 0;
      entries.forEach((p, i) => {
        const previous = rendered.get(p);
        const scale = p.drawScale ?? 1,
          stretch = p.stretch ?? 1;
        const moved =
          !previous ||
          previous.x !== p.p.x ||
          previous.y !== p.p.y ||
          previous.z !== p.p.z ||
          previous.rx !== p.r.x ||
          previous.ry !== p.r.y ||
          previous.rz !== p.r.z ||
          previous.scale !== scale ||
          previous.stretch !== stretch;
        const recolored = !previous || previous.charred !== p.charred;
        if (!moved && !recolored) return;
        if (moved) {
          dummy.position.copy(p.p);
          dummy.rotation.set(p.r.x, p.r.y, p.r.z);
          dummy.scale.copy(p.scale).multiplyScalar(scale);
          dummy.scale.y *= stretch;
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          matrixLo = Math.min(matrixLo, i);
          matrixHi = i + 1;
        }
        if (recolored) {
          mesh.setColorAt(
            i,
            tint.copy(p.color).multiplyScalar(p.charred ? 0.22 : 1),
          );
          colorLo = Math.min(colorLo, i);
          colorHi = i + 1;
        }
        rendered.set(p, {
          x: p.p.x,
          y: p.p.y,
          z: p.p.z,
          rx: p.r.x,
          ry: p.r.y,
          rz: p.r.z,
          scale,
          stretch,
          charred: p.charred,
        });
      });
      if (matrixHi) {
        mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
        mesh.instanceMatrix.addUpdateRange(
          matrixLo * 16,
          (matrixHi - matrixLo) * 16,
        );
        mesh.instanceMatrix.needsUpdate = true;
      }
      if (colorHi) {
        mesh.instanceColor.addUpdateRange(colorLo * 3, (colorHi - colorLo) * 3);
        mesh.instanceColor.needsUpdate = true;
      }
    }
    turfBatch.sync();
  }
  function ground() {
    for (const p of parts) {
      if (!p.active) {
        if (p.type !== "turf")
          p.p.y = p.origin.y + terrain.heightAt(p.p.x, p.p.z);
      } else if (p.sleep && !p.consumed) p.sleep = false;
    }
    sync();
  }
  function distance(o, p) {
    if (o.kind !== "turf")
      return Math.max(
        0,
        Math.hypot(o.center.x - p.x, o.center.z - p.z) - o.radius,
      );
    let inside = false,
      d = Infinity;
    for (let i = 0, j = o.poly.length - 1; i < o.poly.length; j = i++) {
      const a = o.poly[j],
        b = o.poly[i],
        dx = b[0] - a[0],
        dz = b[1] - a[1],
        t = Math.max(
          0,
          Math.min(
            1,
            ((p.x - a[0]) * dx + (p.z - a[1]) * dz) / (dx * dx + dz * dz),
          ),
        );
      d = Math.min(d, Math.hypot(p.x - a[0] - dx * t, p.z - a[1] - dz * t));
      if (
        a[1] > p.z !== b[1] > p.z &&
        p.x < ((b[0] - a[0]) * (p.z - a[1])) / (b[1] - a[1]) + a[0]
      )
        inside = !inside;
    }
    return inside ? 0 : d;
  }
  function launch(p, point, mode, power, radius) {
    if (p.consumed) return;
    const was = p.active;
    p.active = true;
    p.sleep = false;
    p.age = 0;
    p.contactTime = 0;
    if (!was && p.type === "turf") p.p.copy(p.origin);
    const dx = p.p.x - point.x,
      dz = p.p.z - point.z,
      len = Math.hypot(dx, dz),
      a = random() * Math.PI * 2;
    const weight =
      p.o.kind === "retainingWall"
        ? 0.3
        : p.o.kind === "car"
          ? 0.55
          : p.type === "wood"
            ? 0.65
            : p.type === "leaf"
              ? 1.1
              : 0.8;
    const falloff =
      mode === "quake" || mode === "nuke"
        ? 1
        : Math.max(0.2, 1 - (len / Math.max(1, radius)) ** 2);
    const speed =
      (mode === "shockwave"
        ? 52
        : mode === "nuke"
          ? 25
          : mode === "meteor"
            ? 18
            : mode === "quake"
              ? 3
              : mode === "lava" || mode === "volcanicBomb"
                ? 4
                : 10) *
      Math.sqrt(power) *
      weight *
      falloff;
    p.v.set(
      (len < 0.001 ? Math.cos(a) : dx / len) * speed,
      mode === "quake" ? 0.8 + random() * 1.6 : 1.2 + random() * speed * 0.38,
      (len < 0.001 ? Math.sin(a) : dz / len) * speed,
    );

    p.spin.set(
      (random() - 0.5) * 2.5 * weight,
      (random() - 0.5) * 1.2 * weight,
      (random() - 0.5) * 2.5 * weight,
    );
    if (
      mode === "lava" ||
      mode === "volcanicBomb" ||
      mode === "nuke" ||
      mode === "bombing"
    )
      p.charred = true;
  }
  function damage(point, mode, power, radiusOverride) {
    const radius =
        radiusOverride ??
        {
          bombing: 8,
          meteor: 24,
          volcano: 24,
          lava: 7,
          volcanicBomb: 9,
          blackhole: 24,
          shockwave: 32,
          quake: 300,
          nuke: 400,
        }[mode] * Math.sqrt(power),
      torn = [];
    let count = 0;
    for (const o of objects) {
      if (mode === "blackhole" && o.destroyed) continue;
      const d = o.destroyed
        ? Math.min(
            ...o.parts.map((p) => Math.hypot(p.p.x - point.x, p.p.z - point.z)),
          )
        : distance(o, point);
      if (d > radius) continue;
      if (mode === "shockwave") {
        if (waveHit.has(o)) continue;
        waveHit.add(o);
      }
      if (!o.destroyed) {
        o.destroyed = true;
        count++;
        if (o.poly) torn.push({ id: o.id, poly: o.poly });
      }
      for (const p of o.parts) launch(p, point, mode, power, radius);
      if (mode === "lava" || mode === "volcanicBomb") {
        const emitter = o.parts.find((p) => p.type === "leaf") || o.parts[0];
        emitter.burn = 12;
      }
    }
    if (torn.length) terrain.tear(torn);
    ground();
    return count;
  }
  function floor(p) {
    if (p.type === "turf") return terrain.heightAt(p.p.x, p.p.z) + 0.35;
    dummy.rotation.set(p.r.x, p.r.y, p.r.z);
    dummy.updateMatrix();
    const m = dummy.matrix.elements;
    const half = p.type === "bar" || p.type === "sign" ? 0.5 : 1;
    const extent =
      Math.abs(m[1]) * p.scale.x * half +
      Math.abs(m[5]) * p.scale.y * (p.type === "wood" ? 0.5 : half) +
      Math.abs(m[9]) * p.scale.z * half;
    // Only the rotation matrix is needed above; dummy scale must stay one here.
    return terrain.heightAt(p.p.x, p.p.z) + extent + 0.04;
  }
  function settle() {
    dummy.scale.setScalar(1);
    for (const p of parts)
      if (p.active && !p.consumed) {
        p.r.x = p.type === "wood" ? Math.PI / 2 : 0;
        p.r.z = 0;
        p.p.y = floor(p);
        p.v.set(0, 0, 0);
        p.spin.set(0, 0, 0);
        p.sleep = true;
      }
    sync();
  }
  function update(dt, field) {
    let moving = false;
    dummy.scale.setScalar(1);
    for (const p of parts) {
      if (p.burn > 0) {
        p.burn = Math.max(0, p.burn - dt);
        fx.fire(
          p.p,
          (p.type === "leaf" ? 1 : 0.65) * Math.min(1, p.burn / 3),
          "scenery-" + p.id,
        );
      }
      if (p.consumed) continue;
      if (
        field &&
        p.active &&
        p.p.distanceToSquared(field.p) < (field.radius + 4) ** 2
      )
        p.sleep = false;
      if (!p.active || p.sleep) continue;
      moving = true;
      p.age += dt;
      if (field && CampusBlackHole.pull(p, field, dt)) continue;
      p.v.y -= 28 * dt;
      p.v.multiplyScalar(Math.exp(-dt * (p.type === "leaf" ? 0.8 : 0.08)));
      p.p.addScaledVector(p.v, dt);
      p.r.addScaledVector(p.spin, dt);
      const groundY = floor(p);
      if (p.p.y < groundY + 0.04 && p.v.y <= 0.5) {
        const incoming = Math.max(0, -p.v.y);
        p.p.y = groundY;
        p.v.y = incoming > 2 ? incoming * 0.08 : 0;
        const friction = Math.exp(-dt * 18);
        p.v.x *= friction;
        p.v.z *= friction;
        p.spin.multiplyScalar(Math.exp(-dt * 15));
        p.contactTime += dt;
        if (
          (p.v.length() < 1.1 &&
            p.spin.length() < 0.6 &&
            p.contactTime > 0.24) ||
          p.age > 12
        ) {
          p.v.set(0, 0, 0);
          p.spin.set(0, 0, 0);
          p.sleep = true;
        }
      } else p.contactTime = 0;
      if (Math.abs(p.p.x) > 190 || Math.abs(p.p.z) > 160) {
        p.sleep = true;
        p.p.y = -40;
      }
    }
    if (moving) sync();
    return moving;
  }
  function pick(ray) {
    let hit = null;
    for (const { mesh, entries } of Object.values(batches))
      for (const h of ray.intersectObject(mesh)) {
        if (entries[h.instanceId].active) continue;
        if (!hit || h.distance < hit.distance) hit = h;
        break;
      }
    return hit;
  }
  function snapshot() {
    return {
      destroyed: objects.map((o) => o.destroyed),
      parts: parts.map((p) => ({
        p: p.p.toArray(),
        v: p.v.toArray(),
        r: p.r.toArray(),
        spin: p.spin.toArray(),
        active: p.active,
        sleep: p.sleep,
        charred: p.charred,
        age: p.age,
        burn: p.burn,
        contactTime: p.contactTime,
        consumed: !!p.consumed,
        drawScale: p.drawScale ?? 1,
        stretch: p.stretch ?? 1,
        pullAxis: p.pullAxis ? { ...p.pullAxis } : null,
      })),
    };
  }
  function restore(state) {
    waveHit.clear();
    objects.forEach((o, i) => (o.destroyed = state?.destroyed[i] || false));
    parts.forEach((p, i) => {
      const s = state?.parts[i];
      if (s) {
        for (const k of ["p", "v", "r", "spin"]) p[k].fromArray(s[k]);
        for (const k of [
          "active",
          "sleep",
          "charred",
          "age",
          "burn",
          "contactTime",
          "consumed",
          "drawScale",
          "stretch",
          "pullAxis",
        ])
          p[k] = s[k];
      } else {
        p.p.copy(p.origin);
        if (p.type === "turf") p.p.y = -30;
        else p.p.y += terrain.heightAt(p.p.x, p.p.z);
        p.v.set(0, 0, 0);
        p.r.copy(p.baseR);
        p.spin.set(0, 0, 0);
        p.active = p.sleep = p.charred = false;
        p.age = p.burn = 0;
        p.contactTime = 0;
        p.consumed = false;
        p.drawScale = 1;
        p.stretch = 1;
        p.pullAxis = null;
      }
    });
    sync();
  }
  function stats() {
    return {
      destroyed: objects.filter((o) => o.destroyed).length,
      total: objects.length,
    };
  }
  ground();
  return {
    beginShockwave: () => waveHit.clear(),
    damage,
    ground,
    update,
    settle,
    pick,
    snapshot,
    restore,
    stats,
  };
};
