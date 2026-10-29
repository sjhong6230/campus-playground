import { createFacadeLibrary } from "./facades.js";
/* Procedural surface materials and roof fittings attached to destructible slabs. */
export const CampusVisuals = {
  create(T) {
    let seed = 41;
    const rand = () =>
      (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    function canvas(w, h) {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      return [c, c.getContext("2d")];
    }
    function texture(c, repeat = 1) {
      const t = new T.CanvasTexture(c);
      t.colorSpace = T.SRGBColorSpace;
      t.wrapS = t.wrapT = T.RepeatWrapping;
      t.repeat.set(repeat, 1);
      t.anisotropy = 8;
      return t;
    }
    const [wall, ctx] = canvas(1024, 256),
      [relief, rc] = canvas(1024, 256),
      [rough, qc] = canvas(1024, 256);
    ctx.fillStyle = "#d7d4ca";
    ctx.fillRect(0, 0, 1024, 256);
    rc.fillStyle = "#aaaaaa";
    rc.fillRect(0, 0, 1024, 256);
    qc.fillStyle = "#ededed";
    qc.fillRect(0, 0, 1024, 256);
    for (let x = 0; x < 1024; x += 256) {
      for (let y = 0; y < 256; y += 16) {
        ctx.fillStyle = "#a5a49a55";
        ctx.fillRect(x, y, 256, 1);
        for (let u = x + (y % 32 ? 32 : 0); u < x + 256; u += 64)
          ctx.fillRect(u, y, 1, 16);
      }
      ctx.fillStyle = "#404744";
      ctx.fillRect(x + 33, 47, 193, 139);
      rc.fillStyle = "#3d3d3d";
      rc.fillRect(x + 33, 47, 193, 139);
      qc.fillStyle = "#383838";
      qc.fillRect(x + 39, 52, 180, 125);
      const gr = ctx.createLinearGradient(0, 52, 0, 177);
      gr.addColorStop(0, "#314851");
      gr.addColorStop(0.48, "#5c7278");
      gr.addColorStop(1, "#88958f");
      ctx.fillStyle = gr;
      ctx.fillRect(x + 39, 52, 180, 125);
      for (let k = 0; k < 3; k++) {
        if (rand() > 0.4) {
          ctx.fillStyle = k % 2 ? "#b6b2a27a" : "#7a807c77";
          ctx.fillRect(x + 42 + k * 60, 57, 53, 46 + rand() * 65);
        }
        ctx.fillStyle = "#c3c7c1";
        ctx.fillRect(x + 37 + k * 60, 50, 4, 130);
        ctx.fillStyle = "#172528";
        ctx.fillRect(x + 41 + k * 60, 54, 1, 121);
      }
      ctx.fillStyle = "#c9cdc6";
      ctx.fillRect(x + 35, 112, 187, 4);
      ctx.fillRect(x + 32, 181, 195, 7);
      ctx.fillStyle = "#545b5555";
      ctx.fillRect(x + 30, 188, 200, 9);
      ctx.fillStyle = "#f0eee4";
      ctx.fillRect(x + 32, 179, 195, 3);
      ctx.fillStyle = "#777c7455";
      ctx.fillRect(x, 248, 256, 8);
      ctx.fillStyle = "#edeae1";
      ctx.fillRect(x, 243, 256, 5);
    }
    for (let i = 0; i < 14000; i++) {
      ctx.fillStyle = i % 2 ? "#ffffff10" : "#0000000b";
      ctx.fillRect(rand() * 1024, rand() * 256, 1, 1);
    }
    const [roof, rt] = canvas(512, 512);
    rt.fillStyle = "#7d8480";
    rt.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 24000; i++) {
      rt.fillStyle = i % 3 ? "#ffffff12" : "#0000001c";
      rt.fillRect(rand() * 512, rand() * 512, 1 + rand() * 2, 1 + rand() * 2);
    }
    rt.strokeStyle = "#414a4855";
    rt.lineWidth = 2;
    for (let y = 0; y <= 512; y += 128) {
      rt.beginPath();
      rt.moveTo(0, y);
      rt.lineTo(512, y);
      rt.stroke();
    }
    for (let x = 0; x <= 512; x += 256) {
      rt.beginPath();
      rt.moveTo(x, 0);
      rt.lineTo(x, 512);
      rt.stroke();
    }
    const [bark, bc] = canvas(128, 256);
    bc.fillStyle = "#847567";
    bc.fillRect(0, 0, 128, 256);
    for (let i = 0; i < 180; i++) {
      bc.strokeStyle = i % 2 ? "#342e2455" : "#c1ad8d55";
      bc.lineWidth = 0.5 + rand() * 2;
      const x = rand() * 128,
        y = rand() * 256;
      bc.beginPath();
      bc.moveTo(x, y);
      bc.lineTo(x + rand() * 4 - 2, y + 15 + rand() * 50);
      bc.stroke();
    }
    const map = texture(wall, 0.25),
      bump = texture(relief, 0.25),
      roughness = texture(rough, 0.25);
    bump.colorSpace = roughness.colorSpace = T.NoColorSpace;
    return {
      facade: createFacadeLibrary(T),
      wall: map,
      wallBump: bump,
      wallRoughness: roughness,
      roof: texture(roof),
      bark: texture(bark),
    };
  },
  architecture(T, root, buildings, blocks, layout) {
    const entries = [],
      tmp = new T.Object3D(),
      rot = new T.Matrix4(),
      euler = new T.Euler(),
      color = new T.Color(),
      supportCache = new WeakMap();
    function add(
      b,
      s,
      u,
      y,
      v,
      w,
      h,
      d,
      tint,
      pitch = 0,
      yaw = 0,
      anchorStory = null,
      kind = "slab",
    ) {
      let cached = supportCache.get(s);
      if (!cached) {
        cached = new Map();
        supportCache.set(s, cached);
      }
      const story = anchorStory ?? (s.floors ?? b.floors) - 1;
      const key = `${kind}:${story}`;
      if (!cached.has(key))
        cached.set(
          key,
          b.ids
            .map((i) => blocks[i])
            .filter(
              (p) => p.kind === kind && p.story === story && p.segment === s,
            ),
        );
      const q = layout.point(s, u, v),
        p = new T.Vector3(
          q.x,
          b.baseY +
            (anchorStory === null
              ? (s.floors ?? b.floors) * 3
              : anchorStory * 3) +
            y,
          q.z,
        ),
        supports = cached.get(key);
      let support = supports[0];
      for (const candidate of supports)
        if (
          !support ||
          candidate.origin.distanceToSquared(p) <
            support.origin.distanceToSquared(p)
        )
          support = candidate;
      if (support)
        entries.push({
          support,
          offset: p.clone().sub(support.origin),
          scale: new T.Vector3(w, h, d),
          angle: (s.angle || 0) + yaw,
          pitch,
          tint: new T.Color(tint),
        });
    }
    for (const b of buildings) {
      if (b.link) continue;
      for (const s of b.segments) {
        const facade = s.facade ?? b.facade;
        for (const bay of facade?.glazedBays || []) {
          const sign = bay.side ?? 1,
            w = bay.width || 3,
            projection = bay.projection ?? 0.4;
          for (
            let floor = s.openGroundFloor ? 1 : 0;
            floor < (s.floors ?? b.floors);
            floor++
          ) {
            for (let face = -1; face <= 1; face++) {
              const u = (bay.u || 0) + (face * w) / 3;
              const v = sign * (s.d / 2 + projection * (face ? 0.5 : 1) + 0.06);
              add(
                b,
                s,
                u,
                1.5,
                v,
                w / 3 + 0.03,
                2.82,
                0.1,
                facade.window || "#537d8a",
                0,
                face * sign * 0.2,
                floor,
                "wall",
              );
              add(
                b,
                s,
                u - w / 6,
                1.5,
                v + sign * 0.07,
                0.07,
                2.95,
                0.09,
                facade.trim || "#bac3be",
                0,
                0,
                floor,
                "wall",
              );
            }
            add(
              b,
              s,
              bay.u || 0,
              0.04,
              sign * (s.d / 2 + projection + 0.12),
              w,
              0.12,
              0.16,
              facade.trim || "#bac3be",
              0,
              0,
              floor,
              "wall",
            );
          }
        }
        const details = s.roofDetails;
        if (details?.parapet) {
          for (const side of [-1, 1]) {
            const nx = Math.ceil(s.w / 5),
              nz = Math.ceil(s.d / 5);
            for (let i = 0; i < nx; i++)
              add(
                b,
                s,
                -s.w / 2 + ((i + 0.5) * s.w) / nx,
                0.6,
                side * (s.d / 2 - 0.12),
                s.w / nx,
                0.8,
                0.25,
                facade?.trim || "#b8bdb5",
              );
            for (let i = 0; i < nz; i++)
              add(
                b,
                s,
                side * (s.w / 2 - 0.12),
                0.6,
                -s.d / 2 + ((i + 0.5) * s.d) / nz,
                0.25,
                0.8,
                s.d / nz,
                facade?.trim || "#b8bdb5",
              );
          }
        }
        if (details?.equipment) {
          for (
            let i = 0;
            i < Math.min(3, Math.max(1, Math.floor(s.w / 15)));
            i++
          ) {
            const u = -s.w * 0.25 + i * 7;
            add(b, s, u, 0.7, 0, 2.4, 0.9, 1.6, "#c6cbca");
            add(b, s, u, 1.18, 0, 2.5, 0.13, 1.7, "#647273");
          }
        }
        if (details?.canopy) {
          const c = details.canopy,
            u = c.u || 0,
            v = c.v || 0,
            h = c.height || 2.3,
            w = c.w || s.w * 0.8,
            d = c.d || s.d * 0.7;
          for (const a of [-1, 1])
            for (const z of [-1, 1])
              add(
                b,
                s,
                u + a * (w / 2 - 0.3),
                h / 2,
                v + z * (d / 2 - 0.3),
                0.18,
                h,
                0.18,
                c.color || "#b5b9b5",
              );
          const n = Math.ceil(w / 5);
          for (let i = 0; i < n; i++)
            add(
              b,
              s,
              u - w / 2 + ((i + 0.5) * w) / n,
              h,
              v,
              w / n - 0.04,
              0.18,
              d,
              c.color || "#83968f",
            );
        }
        if (s.observatory) {
          add(b, s, 0, 0.7, 0, 7, 1.4, 4.8, "#ced0c8");
          for (let i = 0; i < 10; i++) {
            const v0 = -2.4 + i * 0.48,
              v1 = v0 + 0.48,
              h = (v) => 1.8 * Math.sqrt(Math.max(0, 1 - (v / 2.4) ** 2)),
              h0 = h(v0),
              h1 = h(v1);
            add(
              b,
              s,
              0,
              1.4 + (h0 + h1) / 2,
              (v0 + v1) / 2,
              7.2,
              0.16,
              Math.hypot(0.48, h1 - h0) + 0.03,
              "#b8c6c5",
              -Math.atan2(h1 - h0, 0.48),
            );
          }
        }
        if (s.roof === "flat") {
          const nu = Math.ceil(s.w / 5),
            nv = Math.ceil(s.d / 5);
          for (let j = 0; j < nv; j++)
            for (let i = 0; i < nu; i++)
              add(
                b,
                s,
                -s.w / 2 + ((i + 0.5) * s.w) / nu,
                0.25,
                -s.d / 2 + ((j + 0.5) * s.d) / nv,
                s.w / nu - 0.03,
                0.3,
                s.d / nv - 0.03,
                s.roofColor,
              );
          continue;
        }
        if (s.roof === "hip") {
          const half = s.d / 2;
          for (let side = 0; side < 4; side++)
            for (let i = 0; i < 10; i++) {
              const v = (half * (i + 0.5)) / 10,
                a = (side * Math.PI) / 2;
              add(
                b,
                s,
                Math.sin(a) * v,
                0.3 + 3 * (1 - v / half),
                Math.cos(a) * v,
                v * 2 + 0.05,
                0.18,
                Math.hypot(half / 10, 0.3) + 0.04,
                i < 7 ? "#c9d2c9" : s.roofColor,
                Math.atan2(3, half),
                a,
              );
            }
          continue;
        }
        if (s.roof) {
          const n = s.roof === "barrel" ? 12 : 2,
            nu = Math.ceil(s.w / 5),
            half = s.d / 2;
          for (let i = 0; i < n; i++) {
            const v0 = -half + (i * s.d) / n,
              v1 = v0 + s.d / n,
              curve = (v) =>
                s.roof === "barrel"
                  ? 2.8 * Math.sqrt(Math.max(0, 1 - (v / half) ** 2))
                  : 2.4 * (1 - Math.abs(v) / half),
              y0 = curve(v0),
              y1 = curve(v1),
              pitch = -Math.atan2(y1 - y0, v1 - v0);
            for (let j = 0; j < nu; j++)
              add(
                b,
                s,
                -s.w / 2 + ((j + 0.5) * s.w) / nu,
                0.3 + (y0 + y1) / 2,
                (v0 + v1) / 2,
                s.w / nu - 0.02,
                0.22,
                Math.hypot(v1 - v0, y1 - y0) + 0.07,
                s.roofColor,
                pitch,
              );
          }
          continue;
        }
        for (const sign of [-1, 1]) {
          const count = Math.ceil(s.w / 4);
          for (let i = 0; i < count; i++)
            add(
              b,
              s,
              -s.w / 2 + ((i + 0.5) * s.w) / count,
              0.5,
              sign * (s.d / 2 - 0.25),
              s.w / count - 0.06,
              0.85,
              0.45,
              "#c5c6be",
            );
          const n = Math.ceil(s.d / 4);
          for (let i = 0; i < n; i++)
            add(
              b,
              s,
              sign * (s.w / 2 - 0.25),
              0.5,
              -s.d / 2 + ((i + 0.5) * s.d) / n,
              0.45,
              0.85,
              s.d / n - 0.06,
              "#b8bcb6",
            );
        }
        for (let i = 0; i < Math.max(1, Math.floor(s.w / 19)); i++) {
          const u = -s.w * 0.32 + i * 12,
            v = -s.d * 0.19;
          add(b, s, u, 0.72, v, 2.6, 1.2, 1.8, "#c4c9c6");
          add(b, s, u, 1.37, v, 2.7, 0.14, 1.9, "#9aa39e");
          for (let j = 0; j < 6; j++)
            add(b, s, u - 1 + j * 0.4, 0.74, v + 1, 0.12, 0.7, 0.07, "#515d5d");
        }
        add(b, s, s.w * 0.27, 0.5, s.d * 0.15, 3.1, 0.8, 3.4, "#b7bbb2");
        add(b, s, s.w * 0.27, 0.96, s.d * 0.15, 3.3, 0.12, 3.6, "#d4d5ca");
      }
    }
    const mesh = new T.InstancedMesh(
      new T.BoxGeometry(1, 1, 1),
      new T.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.78,
        metalness: 0.12,
      }),
      entries.length,
    );
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    root.add(mesh);
    const rendered = new WeakMap();
    function sync() {
      let matrixLo = Infinity,
        matrixHi = 0,
        colorLo = Infinity,
        colorHi = 0;
      entries.forEach((entry, i) => {
        const b = entry.support,
          scale = b.consumed ? 0 : (b.drawScale ?? 1),
          prior = rendered.get(entry);
        const moved =
          !prior ||
          prior.x !== b.p.x ||
          prior.y !== b.p.y ||
          prior.z !== b.p.z ||
          prior.rx !== b.r.x ||
          prior.ry !== b.r.y ||
          prior.rz !== b.r.z ||
          prior.scale !== scale;
        const recolored = !prior || prior.charred !== b.charred;
        if (!moved && !recolored) return;
        if (moved) {
          euler.set(b.r.x, b.r.y, b.r.z);
          rot.makeRotationFromEuler(euler);
          tmp.position
            .copy(entry.offset)
            .multiplyScalar(scale)
            .applyMatrix4(rot)
            .add(b.p);
          tmp.quaternion.setFromRotationMatrix(rot);
          tmp.rotateY(entry.angle);
          tmp.rotateX(entry.pitch || 0);
          tmp.scale.copy(entry.scale).multiplyScalar(scale);
          tmp.updateMatrix();
          mesh.setMatrixAt(i, tmp.matrix);
          matrixLo = Math.min(matrixLo, i);
          matrixHi = i + 1;
        }
        if (recolored) {
          mesh.setColorAt(
            i,
            color.copy(entry.tint).multiplyScalar(b.charred ? 0.2 : 1),
          );
          colorLo = Math.min(colorLo, i);
          colorHi = i + 1;
        }
        rendered.set(entry, {
          x: b.p.x,
          y: b.p.y,
          z: b.p.z,
          rx: b.r.x,
          ry: b.r.y,
          rz: b.r.z,
          scale,
          charred: b.charred,
        });
      });
      if (matrixHi) {
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
    sync();
    return { sync, count: entries.length };
  },
};
