import { CampusBlackHole } from "../tools/blackhole.js";

// Oriented fragment bounds without temporary Vector3/Matrix4 allocations.
function bounds(b, out) {
  const a = Math.cos(b.r.x),
    c = Math.cos(b.r.y),
    e = Math.cos(b.r.z),
    f = Math.sin(b.r.z),
    d = Math.sin(b.r.y),
    s = Math.sin(b.r.x);
  const m0 = c * e,
    m4 = -c * f,
    m8 = d,
    m1 = a * f + s * d * e,
    m5 = a * e - s * d * f,
    m9 = -s * c,
    m2 = s * f - a * d * e,
    m6 = s * e + a * d * f,
    m10 = a * c;
  out.minX = out.minY = out.minZ = Infinity;
  out.maxX = out.maxY = out.maxZ = -Infinity;
  for (const p of b.corners || [
    { x: 0, y: -(b.rest || 0.2), z: 0 },
    { x: 0, y: b.rest || 0.2, z: 0 },
  ]) {
    const x = m0 * p.x + m4 * p.y + m8 * p.z,
      y = m1 * p.x + m5 * p.y + m9 * p.z,
      z = m2 * p.x + m6 * p.y + m10 * p.z;
    if (y < out.minY) {
      out.minY = y;
      out.lowX = x;
      out.lowZ = z;
    }
    out.maxY = Math.max(out.maxY, y);
    out.minX = Math.min(out.minX, x);
    out.maxX = Math.max(out.maxX, x);
    out.minZ = Math.min(out.minZ, z);
    out.maxZ = Math.max(out.maxZ, z);
  }
  return out;
}
function restingRotation(b) {
  if (b.kind !== "wall" || !b.corners?.length)
    return { x: b.kind === "column" ? Math.PI / 2 : 0, y: 0, z: 0 };
  const [a, c, d] = b.corners,
    ux = c.x - a.x,
    uy = c.y - a.y,
    uz = c.z - a.z,
    vx = d.x - a.x,
    vy = d.y - a.y,
    vz = d.z - a.z,
    nx = uy * vz - uz * vy,
    nz = ux * vy - uy * vx,
    length = Math.hypot(nx, nz) || 1;
  // Quarter turn around normal × up, converted from Quaternion to XYZ Euler.
  const x = (-nz / length) * Math.SQRT1_2,
    z = (nx / length) * Math.SQRT1_2,
    w = Math.SQRT1_2;
  return {
    x: Math.atan2(2 * x * w, 1 - 2 * x * x),
    y: Math.asin(Math.max(-1, Math.min(1, 2 * x * z))),
    z: Math.atan2(2 * z * w, 1 - 2 * z * z),
  };
}
const angleDelta = (to, from) =>
  Math.atan2(Math.sin(to - from), Math.cos(to - from));

/** Bounded contact with terrain, surviving slabs and settled rubble.
 * No O(n²) all-pairs solver; captured objects retain their identity. */
export function createDebrisSimulation({ blocks, terrain, fx }) {
  let lastDust = -Infinity;
  const cache = new WeakMap(),
    slabGrid = new Map(),
    cell = 8,
    rubbleCell = 2.5,
    rubbleWidth = 62,
    rubbleDepth = 49,
    rubble = new Float32Array(rubbleWidth * rubbleDepth),
    edgeSupport = {},
    centerSupport = {};
  function state(b) {
    let value = cache.get(b);
    if (!value) {
      value = { box: {}, rest: restingRotation(b) };
      cache.set(b, value);
    }
    return value;
  }
  const gridKey = (x, z) => `${Math.floor(x / cell)},${Math.floor(z / cell)}`;
  for (const b of blocks) {
    if (b.kind !== "slab" || !b.corners?.length) continue;
    const box = bounds(b, state(b).box),
      polygon = b.corners
        .slice(0, b.corners.length / 2)
        .map((p) => ({ x: b.origin.x + p.x, z: b.origin.z + p.z })),
      surface = { b, polygon, top: b.origin.y + box.maxY };
    for (
      let x = Math.floor((b.origin.x + box.minX) / cell);
      x <= Math.floor((b.origin.x + box.maxX) / cell);
      x++
    )
      for (
        let z = Math.floor((b.origin.z + box.minZ) / cell);
        z <= Math.floor((b.origin.z + box.maxZ) / cell);
        z++
      ) {
        const key = `${x},${z}`;
        if (!slabGrid.has(key)) slabGrid.set(key, []);
        slabGrid.get(key).push(surface);
      }
  }
  function inside(poly, x, z) {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i],
        b = poly[j];
      if (
        a.z > z !== b.z > z &&
        x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x
      )
        hit = !hit;
    }
    return hit;
  }
  function rubbleIndex(x, z) {
    const ix = Math.floor((x + 77.5) / rubbleCell),
      iz = Math.floor((z + 61.25) / rubbleCell);
    return ix < 0 || ix >= rubbleWidth || iz < 0 || iz >= rubbleDepth
      ? -1
      : iz * rubbleWidth + ix;
  }
  function addRubble(b) {
    const q = bounds(b, state(b).box),
      minX = Math.max(-77, b.p.x + q.minX),
      maxX = Math.min(77, b.p.x + q.maxX),
      minZ = Math.max(-61, b.p.z + q.minZ),
      maxZ = Math.min(61, b.p.z + q.maxZ);
    for (
      let x = Math.floor((minX + 77.5) / rubbleCell);
      x <= Math.floor((maxX + 77.5) / rubbleCell);
      x++
    )
      for (
        let z = Math.floor((minZ + 61.25) / rubbleCell);
        z <= Math.floor((maxZ + 61.25) / rubbleCell);
        z++
      ) {
        if (x < 0 || x >= rubbleWidth || z < 0 || z >= rubbleDepth) continue;
        const i = z * rubbleWidth + x;
        rubble[i] = Math.max(rubble[i], b.p.y + q.maxY);
      }
  }
  function supportAt(x, z, previousBottom, out) {
    const onIsland = Math.abs(x) < 76 && Math.abs(z) < 59,
      ground = onIsland ? terrain.heightAt(x, z) : -12;
    let height = ground,
      terrainContact = true;
    const i = rubbleIndex(x, z),
      heap = i < 0 ? -Infinity : rubble[i];
    if (heap > height && previousBottom >= heap - 0.3) {
      height = heap;
      terrainContact = false;
    }
    for (const surface of slabGrid.get(gridKey(x, z)) || []) {
      if (
        surface.b.active ||
        surface.top <= height ||
        previousBottom < surface.top - 0.3
      )
        continue;
      if (inside(surface.polygon, x, z)) {
        height = surface.top;
        terrainContact = false;
      }
    }
    out.height = height;
    out.terrainContact = terrainContact;
    out.onIsland = onIsland;
    return out;
  }
  return function step(dt, field, time) {
    if (!(dt > 0)) return false;
    if (!blocks.some((b) => b.active && !b.sleep && !b.consumed)) return false;
    const slices = Math.max(1, Math.min(8, Math.ceil(dt * 120))),
      h = Math.min(dt, 1 / 15) / slices;
    rubble.fill(-Infinity);
    for (const b of blocks)
      if (b.active && b.sleep && !b.consumed) addRubble(b);
    let moving = false;
    for (const b of blocks) {
      if (b.consumed || !b.active || b.sleep) continue;
      if (b.delay > 0) {
        b.delay = Math.max(0, b.delay - dt);
        continue;
      }
      moving = true;
      const data = state(b);
      for (let sub = 0; sub < slices && !b.sleep; sub++) {
        b.age += h;
        if (field && CampusBlackHole.pull(b, field, h)) {
          b.contactTime = 0;
          continue;
        }
        const old = bounds(b, data.box),
          previousBottom = b.p.y + old.minY;
        b.v.y -= 35 * h;
        b.v.x *= Math.exp(-0.08 * h);
        b.v.z *= Math.exp(-0.08 * h);
        b.spin.multiplyScalar(Math.exp(-0.12 * h));
        b.p.addScaledVector(b.v, h);
        b.r.addScaledVector(b.spin, h);
        const q = bounds(b, data.box),
          cx = b.p.x + q.lowX,
          cz = b.p.z + q.lowZ;
        let support = supportAt(cx, cz, previousBottom, edgeSupport),
          sampleX = cx,
          sampleZ = cz;
        const center = supportAt(b.p.x, b.p.z, previousBottom, centerSupport);
        if (center.height > support.height) {
          support = center;
          sampleX = b.p.x;
          sampleZ = b.p.z;
        }
        if (b.p.y + q.minY < support.height + 0.025) {
          const impactSpeed = -b.v.y;
          if (time - lastDust > 0.14 && impactSpeed > 7) {
            fx.dust(b.p);
            lastDust = time;
          }
          b.p.y = support.height - q.minY + 0.025;
          let nx = 0,
            ny = 1,
            nz = 0;
          if (support.terrainContact && support.onIsland) {
            const e = 0.45;
            nx =
              (terrain.heightAt(sampleX - e, sampleZ) -
                terrain.heightAt(sampleX + e, sampleZ)) /
              (2 * e);
            nz =
              (terrain.heightAt(sampleX, sampleZ - e) -
                terrain.heightAt(sampleX, sampleZ + e)) /
              (2 * e);
            const length = Math.hypot(nx, 1, nz);
            nx /= length;
            ny /= length;
            nz /= length;
          }
          const vn = b.v.x * nx + b.v.y * ny + b.v.z * nz,
            restitution = impactSpeed > 5 ? 0.07 : 0;
          if (vn < 0) {
            b.v.x -= (1 + restitution) * vn * nx;
            b.v.y -= (1 + restitution) * vn * ny;
            b.v.z -= (1 + restitution) * vn * nz;
          }
          const normalSpeed = b.v.x * nx + b.v.y * ny + b.v.z * nz,
            tx = b.v.x - normalSpeed * nx,
            ty = b.v.y - normalSpeed * ny,
            tz = b.v.z - normalSpeed * nz,
            tangent = Math.hypot(tx, ty, tz),
            friction = Math.max(0, 1 - (0.78 * 35 * h) / (tangent || 1));
          b.v.set(
            normalSpeed * nx + tx * friction,
            normalSpeed * ny + ty * friction,
            normalSpeed * nz + tz * friction,
          );
          b.spin.multiplyScalar(Math.exp(-11 * h));
          const blend = 1 - Math.exp(-7 * h),
            target = data.rest;
          b.r.x += angleDelta(target.x, b.r.x) * blend;
          b.r.z += angleDelta(target.z, b.r.z) * blend;
          if (b.kind === "wall") b.r.y += angleDelta(target.y, b.r.y) * blend;
          const after = bounds(b, data.box);
          b.p.y = Math.max(b.p.y, support.height - after.minY + 0.025);
          const aligned =
            Math.abs(angleDelta(target.x, b.r.x)) +
              Math.abs(angleDelta(target.z, b.r.z)) <
            0.08;
          b.contactTime =
            aligned && b.v.lengthSq() < 0.45 && b.spin.lengthSq() < 0.12
              ? (b.contactTime || 0) + h
              : 0;
          if (b.contactTime > 0.28) {
            b.v.set(0, 0, 0);
            b.spin.set(0, 0, 0);
            b.sleep = true;
            addRubble(b);
          }
        } else b.contactTime = 0;
        if (Math.abs(b.p.x) > 200 || Math.abs(b.p.z) > 180) {
          b.sleep = true;
          b.p.y = -40;
        }
      }
    }
    return moving;
  };
}
