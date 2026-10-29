import { paintSiteDetails } from "./site-details.js";
/* Deformable campus ground: persistent fissures, craters and scorch marks. */
export const createCampusTerrain = function (T, root, layout, paintGround) {
  const W = 151,
    D = 118,
    state = { craters: [], faults: [], burns: [], turf: [], volcanoes: [] };
  const c = document.createElement("canvas");
  c.width = 1536;
  c.height = 1200;
  const ctx = c.getContext("2d");
  const X = (x) => (x / W + 0.5) * c.width,
    Z = (z) => (z / D + 0.5) * c.height;
  function rect(x, z, w, d, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
      X(x - w / 2),
      Z(z - d / 2),
      (w / W) * c.width,
      (d / D) * c.height,
    );
  }
  ctx.fillStyle = "#788462";
  ctx.fillRect(0, 0, c.width, c.height);
  function path(points, width, color) {
    ctx.beginPath();
    points.forEach(([x, z], i) =>
      i ? ctx.lineTo(X(x), Z(z)) : ctx.moveTo(X(x), Z(z)),
    );
    ctx.lineWidth = (width / W) * c.width;
    ctx.strokeStyle = color;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }
  function fieldPath(points, close = false) {
    ctx.beginPath();
    points.forEach(([u, v], i) => {
      const q = layout.point(layout.field, u, v);
      i ? ctx.lineTo(X(q.x), Z(q.z)) : ctx.moveTo(X(q.x), Z(q.z));
    });
    if (close) ctx.closePath();
  }
  paintGround({ ctx, c, W, D, X, Z, rect, path, fieldPath, layout });
  paintSiteDetails({ ctx, X, Z, path, layout });
  // Fine surface grain is deterministic and remains visible around damaged ground.
  let seed = 19;
  for (let i = 0; i < 95000; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const x = seed % c.width;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const y = seed % c.height;
    ctx.fillStyle = i % 2 ? "#ffffff12" : "#00000012";
    ctx.fillRect(x, y, i % 7 === 0 ? 3 : 1, i % 7 === 0 ? 2 : 1);
  }
  const base = document.createElement("canvas");
  base.width = c.width;
  base.height = c.height;
  base.getContext("2d").drawImage(c, 0, 0);
  const texture = new T.CanvasTexture(c);
  texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = 4;
  const surfaceTexture = new T.CanvasTexture(base);
  surfaceTexture.colorSpace = T.SRGBColorSpace;
  surfaceTexture.anisotropy = 4;
  const geometry = new T.PlaneGeometry(W, D, 200, 156);
  geometry.rotateX(-Math.PI / 2);
  const count = geometry.attributes.position.count,
    baseHeights = new Float32Array(geometry.attributes.position.count);
  for (let i = 0; i < count; i++)
    baseHeights[i] = layout.elevationAt(
      geometry.attributes.position.getX(i),
      geometry.attributes.position.getZ(i),
    );
  geometry.setAttribute(
    "color",
    new T.BufferAttribute(new Float32Array(count * 3).fill(1), 3),
  );
  const mesh = new T.Mesh(
    geometry,
    new T.MeshStandardMaterial({
      map: texture,
      bumpMap: texture,
      bumpScale: 0.07,
      vertexColors: true,
      roughness: 1,
      side: T.DoubleSide,
    }),
  );
  mesh.receiveShadow = true;
  root.add(mesh);
  const rocks = new T.InstancedMesh(
    new T.IcosahedronGeometry(1, 0),
    new T.MeshStandardMaterial({ color: "#75654f", roughness: 1 }),
    1400,
  );
  rocks.castShadow = rocks.receiveShadow = true;
  rocks.count = 0;
  rocks.frustumCulled = false;
  root.add(rocks);
  const dummy = new T.Object3D();
  const noise = (x, z) =>
    Math.sin(x * 0.71 + Math.cos(z * 0.36)) * Math.sin(z * 0.57 + x * 0.19);
  function edge(p, a) {
    return (
      1 +
      0.075 * Math.sin(a * 5 + p.seed) +
      0.045 * Math.sin(a * 11 - p.seed) +
      0.025 * Math.cos(a * 19)
    );
  }
  function radial(p, x, z) {
    const a = Math.atan2(z - p.z, x - p.x);
    return Math.hypot(x - p.x, z - p.z) / (p.radius * edge(p, a));
  }
  function crackWidth(f, x, z) {
    return (
      f.width *
      (0.73 + 0.22 * Math.sin(x * 0.41 + f.seed) + 0.19 * Math.cos(z * 0.37))
    );
  }
  function segmentDistance(x, z, a, b) {
    const dx = b[0] - a[0],
      dz = b[1] - a[1],
      t = Math.max(
        0,
        Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz)),
      );
    return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz);
  }
  function faultDistance(x, z, f) {
    let d = Infinity;
    for (let i = 1; i < f.points.length; i++)
      d = Math.min(d, segmentDistance(x, z, f.points[i - 1], f.points[i]));
    return d;
  }
  function heightAt(x, z, baseHeight) {
    if (Math.abs(x) > W / 2 || Math.abs(z) > D / 2) return -10;
    let pit = 0,
      rim = 0;
    for (const p of state.craters) {
      if (
        Math.abs(x - p.x) > p.radius * 1.55 ||
        Math.abs(z - p.z) > p.radius * 1.55
      )
        continue;
      const q = radial(p, x, z),
        a = Math.atan2(z - p.z, x - p.x);
      if (q < 1)
        pit = Math.min(
          pit,
          -p.depth * Math.pow(1 - q * q, 0.65) +
            noise(x, z) * 0.28 * Math.sin(q * Math.PI),
        );
      else if (q < 1.32)
        rim = Math.max(
          rim,
          p.depth *
            0.13 *
            (0.65 + 0.35 * Math.sin(a * 7 + p.seed)) *
            Math.sin(((q - 1) / 0.32) * Math.PI) +
            noise(x, z) * 0.15,
        );
    }
    for (const f of state.faults) {
      const d = faultDistance(x, z, f),
        w = crackWidth(f, x, z);
      if (d < w) {
        pit = Math.min(
          pit,
          -f.depth * Math.pow(1 - d / w, 0.24) + noise(x, z) * 0.35,
        );
      } else if (d < w + 2)
        rim = Math.max(rim, (0.35 + noise(x, z) * 0.2) * (1 - (d - w) / 2));
    }
    let cone = 0;
    for (const v of state.volcanoes) {
      const d = Math.hypot(x - v.x, z - v.z),
        q = d / v.radius;
      if (q < 1) {
        const h =
          v.height * Math.pow(1 - q, 1.3) -
          (q < 0.25 ? v.height * 0.6 * (1 - q / 0.25) : 0);
        cone = Math.max(cone, h * (1 + noise(x, z) * 0.055));
      }
    }
    return (
      (baseHeight ?? layout.elevationAt(x, z)) + cone + (pit < 0 ? pit : rim)
    );
  }
  function paint() {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(base, 0, 0);
    for (const patch of state.turf) {
      ctx.beginPath();
      patch.poly.forEach(([x, z], i) =>
        i ? ctx.lineTo(X(x), Z(z)) : ctx.moveTo(X(x), Z(z)),
      );
      ctx.closePath();
      ctx.fillStyle = ["#725d40", "#806747", "#8b7150"][patch.id % 3];
      ctx.fill();
      ctx.strokeStyle = "#493b2bbb";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      ctx.clip();
      const cx = patch.poly.reduce((s, p) => s + p[0], 0) / patch.poly.length,
        cz = patch.poly.reduce((s, p) => s + p[1], 0) / patch.poly.length;
      for (let i = 0; i < 40; i++) {
        const x = cx + Math.sin(i * 17 + patch.id) * 5,
          z = cz + Math.cos(i * 9 + patch.id) * 5;
        ctx.fillStyle = i % 2 ? "#b4936655" : "#3e332655";
        ctx.fillRect(X(x), Z(z), 4 + (i % 5), 2 + (i % 3));
      }
      ctx.restore();
    }
    for (const p of state.craters) {
      const gradient = ctx.createRadialGradient(
        X(p.x),
        Z(p.z),
        ((p.radius * 0.1) / W) * c.width,
        X(p.x),
        Z(p.z),
        ((p.radius * 1.4) / W) * c.width,
      );
      gradient.addColorStop(0, "#29251f");
      gradient.addColorStop(0.45, "#514331");
      gradient.addColorStop(0.7, "#79634b");
      gradient.addColorStop(0.88, "#9d8566");
      gradient.addColorStop(1, "#947a5500");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      for (let i = 0; i <= 150; i++) {
        const a = (i / 150) * Math.PI * 2,
          r = p.radius * 1.45 * edge(p, a),
          x = X(p.x + Math.cos(a) * r),
          z = Z(p.z + Math.sin(a) * r);
        if (i === 0) ctx.moveTo(x, z);
        else ctx.lineTo(x, z);
      }
      ctx.closePath();
      ctx.fill();
      for (let i = 0; i < 100; i++) {
        const a = i * 2.399 + p.seed,
          r = p.radius * (1.05 + (Math.sin(i * 7.7) + 1) * 0.28),
          x = p.x + Math.cos(a) * r,
          z = p.z + Math.sin(a) * r;
        ctx.strokeStyle = i % 2 ? "#745b3b55" : "#ab927055";
        ctx.lineWidth = 1 + (i % 4);
        ctx.beginPath();
        ctx.moveTo(X(x), Z(z));
        ctx.lineTo(X(x + Math.cos(a) * 3), Z(z + Math.sin(a) * 3));
        ctx.stroke();
      }
    }
    for (const v of state.volcanoes) {
      const g = ctx.createRadialGradient(
        X(v.x),
        Z(v.z),
        0,
        X(v.x),
        Z(v.z),
        (v.radius / W) * c.width,
      );
      g.addColorStop(0, "#15110f");
      g.addColorStop(0.26, "#4b3930");
      g.addColorStop(0.7, "#514b40");
      g.addColorStop(1, "#39372f00");
      ctx.fillStyle = g;
      ctx.fillRect(
        X(v.x - v.radius),
        Z(v.z - v.radius),
        ((v.radius * 2) / W) * c.width,
        ((v.radius * 2) / D) * c.height,
      );
    }
    for (const f of state.faults) {
      for (let i = 1; i < f.points.length; i++) {
        const a = f.points[i - 1],
          b = f.points[i],
          w = crackWidth(f, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
        for (const [extra, color] of [
          [2, "#9a8263"],
          [0.8, "#5e4b36"],
          [0, "#211d18"],
        ]) {
          ctx.strokeStyle = color;
          ctx.lineWidth = ((w * 2 + extra) / W) * c.width;
          ctx.lineJoin = "bevel";
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(X(a[0]), Z(a[1]));
          ctx.lineTo(X(b[0]), Z(b[1]));
          ctx.stroke();
        }
      }
    }
    for (const s of state.burns) {
      const g = ctx.createRadialGradient(
        X(s.x),
        Z(s.z),
        0,
        X(s.x),
        Z(s.z),
        (s.radius / W) * c.width,
      );
      g.addColorStop(0, "#181410d9");
      g.addColorStop(0.6, "#292018aa");
      g.addColorStop(1, "#29201800");
      ctx.fillStyle = g;
      ctx.fillRect(
        X(s.x - s.radius),
        Z(s.z - s.radius),
        ((s.radius * 2) / W) * c.width,
        ((s.radius * 2) / D) * c.height,
      );
    }
    texture.needsUpdate = true;
  }
  function debris() {
    let n = 0;
    function rock(x, z, size, i) {
      if (n >= 1400 || Math.abs(x) > 74 || Math.abs(z) > 57) return;
      dummy.position.set(x, heightAt(x, z) + size * 0.3, z);
      dummy.rotation.set(i * 0.7, i * 2.1, i * 0.3);
      dummy.scale.set(size, size * 0.45, size * 0.7);
      dummy.updateMatrix();
      rocks.setMatrixAt(n, dummy.matrix);
      rocks.setColorAt(
        n,
        new T.Color().setHSL(0.09, 0.12, 0.22 + (i % 7) * 0.025),
      );
      n++;
    }
    for (const p of state.craters)
      for (let i = 0; i < 110; i++) {
        const a = i * 2.399 + p.seed,
          r = p.radius * edge(p, a) * (0.8 + (Math.sin(i * 7.1) + 1) * 0.32);
        rock(
          p.x + Math.cos(a) * r,
          p.z + Math.sin(a) * r,
          0.35 + (Math.cos(i * 4.2) + 1) * 0.65,
          i,
        );
      }
    for (const f of state.faults)
      for (let j = 1; j < f.points.length; j++) {
        const a = f.points[j - 1],
          b = f.points[j],
          dx = b[0] - a[0],
          dz = b[1] - a[1],
          len = Math.hypot(dx, dz);
        for (let i = 0; i < 8; i++) {
          const t = i / 8,
            x = a[0] + dx * t,
            z = a[1] + dz * t,
            w = crackWidth(f, x, z),
            side = i % 2 ? 1 : -1;
          rock(
            x - (dz / len) * (w + 0.5) * side,
            z + (dx / len) * (w + 0.5) * side,
            0.35 + (i % 3) * 0.35,
            j * 8 + i,
          );
        }
      }
    rocks.count = n;
    rocks.instanceMatrix.needsUpdate = true;
    if (rocks.instanceColor) rocks.instanceColor.needsUpdate = true;
  }
  // A terrain-following skirt closes the raised campus terraces at every edge.
  const boundary = [];
  for (let i = 0; i <= 50; i++) boundary.push([-W / 2 + (i * W) / 50, -D / 2]);
  for (let i = 1; i <= 40; i++) boundary.push([W / 2, -D / 2 + (i * D) / 40]);
  for (let i = 1; i <= 50; i++) boundary.push([W / 2 - (i * W) / 50, D / 2]);
  for (let i = 1; i <= 40; i++) boundary.push([-W / 2, D / 2 - (i * D) / 40]);
  const skirtGeometry = new T.BufferGeometry(),
    skirtVertices = new Float32Array((boundary.length - 1) * 18);
  skirtGeometry.setAttribute(
    "position",
    new T.BufferAttribute(skirtVertices, 3),
  );
  const skirt = new T.Mesh(
    skirtGeometry,
    new T.MeshStandardMaterial({
      color: "#c7bca1",
      roughness: 1,
      side: T.DoubleSide,
    }),
  );
  root.add(skirt);
  function updateSkirt() {
    let j = 0;
    for (let i = 1; i < boundary.length; i++) {
      const a = boundary[i - 1],
        b = boundary[i],
        ay = heightAt(a[0], a[1]),
        by = heightAt(b[0], b[1]);
      for (const v of [
        [a[0], ay, a[1]],
        [b[0], by, b[1]],
        [b[0], -10, b[1]],
        [a[0], ay, a[1]],
        [b[0], -10, b[1]],
        [a[0], -10, a[1]],
      ])
        for (const value of v) skirtVertices[j++] = value;
    }
    skirtGeometry.attributes.position.needsUpdate = true;
    skirtGeometry.computeVertexNormals();
    skirtGeometry.computeBoundingSphere();
  }
  let pending = false,
    shapeDirty = false,
    colorDirty = false,
    revision = 0;
  function invalidate(shape = true, color = true) {
    pending = true;
    shapeDirty ||= shape;
    colorDirty ||= color;
    if (shape) revision++;
  }
  function rebuild(shape = true, colors = true) {
    paint();
    const a = geometry.attributes.position,
      col = geometry.attributes.color;
    for (let i = 0; i < count; i++) {
      if (!shape && !colors) break;
      const x = a.getX(i),
        z = a.getZ(i);
      if (shape) a.setY(i, heightAt(x, z, baseHeights[i]));
      if (!colors) continue;
      let r = 1,
        g = 1,
        b = 1;
      for (const p of state.craters) {
        const q = radial(p, x, z);
        if (q < 1.3) {
          const shade = 0.86 + noise(x, z) * 0.12;
          r = shade;
          g = shade;
          b = shade;
        }
      }
      for (const f of state.faults) {
        const d = faultDistance(x, z, f),
          w = crackWidth(f, x, z);
        if (d < w) {
          const dark = 0.4 + (0.4 * d) / w;
          r = dark;
          g = dark;
          b = dark;
        }
      }
      for (const s of state.burns) {
        const q = Math.hypot(x - s.x, z - s.z) / s.radius;
        if (q < 1) {
          const f = 0.13 + 0.87 * q * q;
          r *= f;
          g *= f * 0.9;
          b *= f * 0.85;
        }
      }
      col.setXYZ(i, r, g, b);
    }
    if (colors) col.needsUpdate = true;
    if (shape) {
      a.needsUpdate = true;
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
      debris();
      updateSkirt();
    }
  }
  function flush() {
    if (!pending) return false;
    rebuild(shapeDirty, colorDirty);
    pending = shapeDirty = colorDirty = false;
    return true;
  }
  function crater(p, power, nuclear = false, small = false) {
    state.craters.push({
      x: p.x,
      z: p.z,
      radius: (small ? 4.5 : nuclear ? 34 : 15) * Math.sqrt(power),
      depth: small ? 2.2 + power * 0.5 : nuclear ? 8 : 5 + power,
      seed: Math.random() * 30,
    });
    if (state.craters.length > 24) state.craters.shift();
    invalidate();
  }
  function quake(p, power) {
    const angle = Math.random() * Math.PI,
      points = [],
      seed = Math.random() * 30;
    for (let i = -12; i <= 12; i++) {
      const t = i * 6.5,
        wobble = Math.sin(i * 2.7) * 2.4 + Math.cos(i * 0.4) * 4;
      points.push([
        p.x + Math.cos(angle) * t + Math.sin(angle) * wobble,
        p.z + Math.sin(angle) * t - Math.cos(angle) * wobble,
      ]);
    }
    state.faults.push({ points, width: 1.1 + power * 0.55, depth: 6.5, seed });
    for (const index of [8, 15]) {
      const branch = points[index];
      state.faults.push({
        points: [
          branch,
          [branch[0] + 9, branch[1] + 7],
          [branch[0] + 17, branch[1] + 10],
          [branch[0] + 23, branch[1] + 25],
        ],
        width: 0.5 + power * 0.25,
        depth: 4,
        seed: seed + index,
      });
    }
    while (state.faults.length > 12) state.faults.shift();
    invalidate();
  }
  function burn(p, radius = 6) {
    state.burns.push({ x: p.x, z: p.z, radius });
    if (state.burns.length > 40) state.burns.shift();
    invalidate(false, true);
  }
  function tear(patches) {
    const ids = new Set(state.turf.map((p) => p.id));
    for (const p of patches)
      if (!ids.has(p.id))
        state.turf.push({ id: p.id, poly: p.poly.map((v) => v.slice()) });
    invalidate(false, false);
  }
  function volcano(p, power) {
    state.volcanoes.push({
      x: p.x,
      z: p.z,
      radius: 17 * Math.sqrt(power),
      height: 16 * Math.sqrt(power),
    });
    if (state.volcanoes.length > 3) state.volcanoes.shift();
    invalidate();
  }
  function snapshot() {
    return JSON.parse(JSON.stringify(state));
  }
  function restore(s) {
    const copy = s ? JSON.parse(JSON.stringify(s)) : {};
    for (const key of ["craters", "faults", "burns", "turf", "volcanoes"])
      state[key] = copy[key] || [];
    pending = shapeDirty = colorDirty = false;
    revision++;
    rebuild();
  }
  rebuild();
  return {
    flush,
    get revision() {
      return revision;
    },
    mesh,
    surfaceTexture,
    heightAt,
    volcano,
    crater,
    quake,
    burn,
    tear,
    snapshot,
    restore,
  };
};
