/* Convex Voronoi wall panels and floor slabs, batched into two draw groups.
   Geometric fracture and simplified support loss; not an engineering solver. */
export const CampusFracture = function (T, random) {
  function clip(poly, a, b, c) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i],
        q = poly[(i + 1) % poly.length],
        dp = a * p[0] + b * p[1] - c,
        dq = a * q[0] + b * q[1] - c;
      if (dp <= 1e-7) out.push(p);
      if (dp < 0 !== dq < 0) {
        const t = dp / (dp - dq);
        out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
      }
    }
    return out;
  }
  function cells(w, h, nx, ny) {
    const seeds = [];
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++)
        seeds.push([
          ((i + 0.15 + random() * 0.7) * w) / nx,
          ((j + 0.15 + random() * 0.7) * h) / ny,
        ]);
    return seeds
      .map((p) => {
        let poly = [
          [0, 0],
          [w, 0],
          [w, h],
          [0, h],
        ];
        for (const q of seeds) {
          if (q === p) continue;
          const a = q[0] - p[0],
            b = q[1] - p[1],
            c = (q[0] ** 2 + q[1] ** 2 - p[0] ** 2 - p[1] ** 2) / 2;
          poly = clip(poly, a, b, c);
          if (!poly.length) break;
        }
        return poly;
      })
      .filter((p) => p.length >= 3);
  }
  function prism(poly, thickness, map, kind, building, story) {
    const front = poly.map((p) => map(p[0], p[1], thickness / 2)),
      back = poly.map((p) => map(p[0], p[1], -thickness / 2));
    const center = new T.Vector3();
    for (const p of [...front, ...back]) center.add(p);
    center.multiplyScalar(1 / (poly.length * 2));
    const surfaces = [[], []],
      uvs = [[], []],
      corners = [...front, ...back].map((p) => p.clone().sub(center));
    function triangle(a, b, c, ta, tb, tc, index) {
      for (const p of [a, b, c]) {
        surfaces[index].push(p.x - center.x, p.y - center.y, p.z - center.z);
      }
      for (const t of [ta, tb, tc]) uvs[index].push(t[0] / 3.6, t[1] / 3);
    }
    const surface = kind === "wall" ? 0 : 1;
    for (let i = 1; i < poly.length - 1; i++) {
      triangle(
        front[0],
        front[i],
        front[i + 1],
        poly[0],
        poly[i],
        poly[i + 1],
        surface,
      );
      triangle(back[0], back[i + 1], back[i], poly[0], poly[i + 1], poly[i], 1);
    }
    for (let i = 0; i < poly.length; i++) {
      const j = (i + 1) % poly.length;
      triangle(front[i], back[i], back[j], poly[i], poly[i], poly[j], 1);
      triangle(front[i], back[j], front[j], poly[i], poly[j], poly[j], 1);
    }
    const n = front[1]
      .clone()
      .sub(front[0])
      .cross(front[2].clone().sub(front[0]))
      .normalize();
    return {
      origin: center.clone(),
      p: center,
      v: new T.Vector3(),
      r: new T.Vector3(),
      spin: new T.Vector3(),
      active: false,
      sleep: false,
      building,
      kind,
      story,
      corners,
      surfaces,
      uvs,
      ranges: [],
      delay: 0,
      age: 0,
      charred: false,
      flatX: Math.abs(n.z) > 0.5 ? Math.PI / 2 : 0,
      flatZ: Math.abs(n.x) > 0.5 ? Math.PI / 2 : 0,
      rest: thickness / 2,
      mass: kind === "slab" ? 3 : kind === "column" ? 2 : 1,
    };
  }
  function buildingParts(b) {
    const w = b.nx * 3.6,
      d = b.nz * 3.6,
      wallBase = b.openGroundFloor ? 3 : 0,
      wallFloors = b.floors - (b.openGroundFloor ? 1 : 0),
      h = wallFloors * 3,
      out = [],
      v = (x, y, z) => new T.Vector3(x, y, z);
    for (const side of [-1, 1]) {
      for (const poly of cells(w, h, Math.ceil(w / 5), wallFloors)) {
        const cy = wallBase + poly.reduce((s, p) => s + p[1], 0) / poly.length;
        out.push(
          prism(
            poly,
            0.4,
            (u, y, t) =>
              v(b.x - w / 2 + u, wallBase + y, b.z + side * (d / 2 + t)),
            "wall",
            b,
            Math.min(b.floors - 1, Math.floor(cy / 3)),
          ),
        );
      }
      for (const poly of cells(d, h, Math.ceil(d / 5), wallFloors)) {
        const cy = wallBase + poly.reduce((s, p) => s + p[1], 0) / poly.length;
        out.push(
          prism(
            poly,
            0.4,
            (u, y, t) =>
              v(b.x + side * (w / 2 + t), wallBase + y, b.z - d / 2 + u),
            "wall",
            b,
            Math.min(b.floors - 1, Math.floor(cy / 3)),
          ),
        );
      }
    }
    for (let floor = b.bottomSlab ? 0 : 1; floor <= b.floors; floor++)
      for (const poly of cells(
        w,
        d,
        Math.max(2, Math.ceil(w / 13)),
        Math.max(1, Math.ceil(d / 10)),
      ))
        out.push(
          prism(
            poly,
            0.38,
            (u, z, t) => v(b.x - w / 2 + u, floor * 3 + t, b.z - d / 2 + z),
            "slab",
            b,
            Math.max(0, floor - 1),
          ),
        );
    for (let floor = 0; floor < b.floors; floor++)
      for (const x of [-w * 0.35, 0, w * 0.35])
        for (const z of [-d * 0.28, d * 0.28]) {
          const poly = [
            [0, 0],
            [0.6, 0],
            [0.6, 3],
            [0, 3],
          ];
          out.push(
            prism(
              poly,
              0.6,
              (u, y, t) => v(b.x + x + u - 0.3, floor * 3 + y, b.z + z + t),
              "column",
              b,
              floor,
            ),
          );
        }
    return out;
  }
  function batch(parts, materials) {
    const positions = [],
      uv = [],
      colors = [],
      owners = [],
      ranges = [[], []];
    const geometry = new T.BufferGeometry();
    for (let group = 0; group < 2; group++) {
      const start = positions.length / 3;
      for (let id = 0; id < parts.length; id++) {
        const p = parts[id],
          a = p.surfaces[group],
          begin = positions.length / 3,
          c = new T.Color(
            group === 0
              ? p.building.color
              : p.kind === "slab"
                ? "#c8cdca"
                : "#d0cec5",
          );
        positions.push(...a);
        uv.push(...p.uvs[group]);
        for (let j = 0; j < a.length; j += 3) colors.push(c.r, c.g, c.b);
        for (let j = 0; j < a.length; j += 9) owners.push(id);
        p.ranges.push({ start: begin, count: a.length / 3 });
      }
      geometry.addGroup(start, positions.length / 3 - start, group);
    }
    const pos = new Float32Array(positions);
    geometry.setAttribute(
      "position",
      new T.BufferAttribute(pos, 3).setUsage(T.DynamicDrawUsage),
    );
    geometry.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    const baseColor = geometry.attributes.color.array.slice(),
      liveColor = geometry.attributes.color.array;
    const basePosition = pos.slice(),
      baseNormal = geometry.attributes.normal.array.slice(),
      normal = geometry.attributes.normal.array;
    geometry.attributes.normal.setUsage(T.DynamicDrawUsage);
    const mesh = new T.Mesh(geometry, materials);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    const rotation = new T.Matrix4(),
      euler = new T.Euler();
    const cached = parts.map(() => ({}));
    // Conservative bound covers the simulation's debris limits; no full scan each frame.
    geometry.boundingSphere = new T.Sphere(new T.Vector3(), 2048);
    function sync() {
      let lo = Infinity,
        hi = 0,
        colorLo = Infinity,
        colorHi = 0;
      for (let id = 0; id < parts.length; id++) {
        const p = parts[id],
          c = cached[id],
          scale = p.drawScale ?? 1,
          stretch = p.stretch ?? 1,
          ax = p.pullAxis?.x ?? 0,
          ay = p.pullAxis?.y ?? 0,
          az = p.pullAxis?.z ?? 0,
          tint = p.charred ? 0.18 : 1;
        if (
          c.x === p.p.x &&
          c.y === p.p.y &&
          c.z === p.p.z &&
          c.rx === p.r.x &&
          c.ry === p.r.y &&
          c.rz === p.r.z &&
          c.scale === scale &&
          c.stretch === stretch &&
          c.ax === ax &&
          c.ay === ay &&
          c.az === az &&
          c.tint === tint
        )
          continue;
        const tintChanged = c.tint !== tint;
        Object.assign(c, {
          x: p.p.x,
          y: p.p.y,
          z: p.p.z,
          rx: p.r.x,
          ry: p.r.y,
          rz: p.r.z,
          scale,
          stretch,
          ax,
          ay,
          az,
          tint,
        });
        euler.set(p.r.x, p.r.y, p.r.z);
        rotation.makeRotationFromEuler(euler);
        const m = rotation.elements;
        for (const range of p.ranges) {
          if (!range.count) continue;
          lo = Math.min(lo, range.start * 3);
          hi = Math.max(hi, (range.start + range.count) * 3);
          if (tintChanged) {
            colorLo = Math.min(colorLo, range.start * 3);
            colorHi = Math.max(colorHi, (range.start + range.count) * 3);
          }
          for (
            let i = range.start * 3;
            i < (range.start + range.count) * 3;
            i += 3
          ) {
            const scale = p.drawScale ?? 1;
            const x = basePosition[i] * scale,
              y = basePosition[i + 1] * scale,
              z = basePosition[i + 2] * scale,
              nx = baseNormal[i],
              ny = baseNormal[i + 1],
              nz = baseNormal[i + 2];
            pos[i] = m[0] * x + m[4] * y + m[8] * z + p.p.x;
            pos[i + 1] = m[1] * x + m[5] * y + m[9] * z + p.p.y;
            pos[i + 2] = m[2] * x + m[6] * y + m[10] * z + p.p.z;
            if (p.pullAxis && p.stretch > 1) {
              const a = p.pullAxis,
                dot =
                  (pos[i] - p.p.x) * a.x +
                  (pos[i + 1] - p.p.y) * a.y +
                  (pos[i + 2] - p.p.z) * a.z,
                extra = dot * (p.stretch - 1);
              pos[i] += a.x * extra;
              pos[i + 1] += a.y * extra;
              pos[i + 2] += a.z * extra;
            }
            normal[i] = m[0] * nx + m[4] * ny + m[8] * nz;
            normal[i + 1] = m[1] * nx + m[5] * ny + m[9] * nz;
            normal[i + 2] = m[2] * nx + m[6] * ny + m[10] * nz;
            if (tintChanged)
              for (let k = 0; k < 3; k++)
                liveColor[i + k] = baseColor[i + k] * tint;
          }
        }
      }
      if (hi) {
        for (const key of ["position", "normal"]) {
          const a = geometry.attributes[key];
          a.addUpdateRange(lo, hi - lo);
          a.needsUpdate = true;
        }
      }
      if (colorHi) {
        const a = geometry.attributes.color;
        a.addUpdateRange(colorLo, colorHi - colorLo);
        a.needsUpdate = true;
      }
    }
    sync();
    return { mesh, sync, owners };
  }
  return { buildingParts, batch, cells };
};
