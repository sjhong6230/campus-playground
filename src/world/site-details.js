// Campus-authored paths stay in the deformable ground texture.
export function paintSiteDetails({ ctx, X, Z, path, layout }) {
  for (const route of layout.siteDetails?.paths || []) {
    const w = route.width || (route.kind === "road" ? 5 : 2);
    path(route.points, w + 0.45, "#bdbfb4");
    path(
      route.points,
      w,
      route.color || (route.kind === "road" ? "#7e8584" : "#c5bbaa"),
    );
    if (route.kind === "road" && w >= 5.5) {
      ctx.save();
      ctx.setLineDash([10, 12]);
      path(route.points, 0.09, "#d7d4bd");
      ctx.restore();
    }
    if (route.kind === "walk") {
      for (let j = 1; j < route.points.length; j++) {
        const a = route.points[j - 1],
          b = route.points[j];
        const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (!length) continue;
        const nx = -(b[1] - a[1]) / length,
          nz = (b[0] - a[0]) / length;
        ctx.strokeStyle = "#7e7c731c";
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        for (let d = 1; d < length; d += 1.2) {
          const x = a[0] + ((b[0] - a[0]) * d) / length,
            z = a[1] + ((b[1] - a[1]) * d) / length;
          ctx.moveTo(X(x - (nx * w) / 2), Z(z - (nz * w) / 2));
          ctx.lineTo(X(x + (nx * w) / 2), Z(z + (nz * w) / 2));
        }
        ctx.stroke();
      }
    }
  }
}

export function addSiteScenery({ layout, terrain, object, framedPart }) {
  // Stair coordinates run from the upper landing (-v) to the lower one (+v).
  // Each tread uses the existing scenery damage, ground and Undo lifecycle.
  for (const stairs of layout.siteDetails?.stairs || []) {
    const treadDepth = stairs.depth / stairs.count;
    const rise = (stairs.upperY - stairs.lowerY) / stairs.count;
    for (let i = 0; i < stairs.count; i++) {
      const v = -stairs.depth / 2 + (i + 0.5) * treadDepth;
      const q = layout.point(stairs, 0, v);
      const top = stairs.upperY - i * rise;
      const height = top - stairs.lowerY;
      const step = object(
        "stair",
        q.x,
        q.z,
        Math.hypot(stairs.width, treadDepth) / 2,
      );
      framedPart(
        step,
        "bar",
        stairs,
        0,
        stairs.lowerY - terrain.heightAt(q.x, q.z) + height / 2,
        v,
        stairs.width,
        height,
        treadDepth,
        stairs.color || "#c5c1b3",
      );
    }
  }
  const g = layout.gate,
    width = g.width || 15,
    height = g.height || 4.8;
  const gate = object("gate", g.x, g.z, width / 2 + 1.2);
  const tint = g.color || "#c4c6bd",
    style = g.style || "piers";
  const postWidth = style === "open" ? 0.65 : 1.05;
  for (const side of [-1, 1]) {
    const x = (side * width) / 2;
    framedPart(
      gate,
      "bar",
      g,
      x,
      height / 2,
      0,
      postWidth,
      height,
      postWidth,
      tint,
    );
    framedPart(
      gate,
      "bar",
      g,
      x,
      height + 0.08,
      0,
      postWidth + 0.22,
      0.18,
      postWidth + 0.22,
      "#777e79",
    );
    if (style !== "portal") {
      framedPart(
        gate,
        "bar",
        g,
        x + side * 1.4,
        height * 0.3,
        0,
        2.8,
        height * 0.6,
        0.35,
        tint,
      );
    }
  }
  if (style === "portal") {
    for (let i = 0; i < 3; i++)
      framedPart(
        gate,
        "bar",
        g,
        -width / 3 + (i * width) / 3,
        height,
        0,
        width / 3 + 0.08,
        0.65,
        0.8,
        tint,
      );
  }
  if (g.sign) {
    const overhead = style === "portal";
    framedPart(
      gate,
      "sign",
      g,
      overhead ? 0 : -width / 2 - 1.4,
      overhead ? height : height * 0.55,
      0.28,
      overhead ? width * 0.65 : 3.4,
      overhead ? 0.6 : 0.7,
      0.12,
      "#ffffff",
    );
  }
  if (g.barrier) {
    framedPart(
      gate,
      "bar",
      g,
      width / 2 - 0.9,
      0.65,
      -0.7,
      0.5,
      1.3,
      0.5,
      "#dedfd6",
    );
    framedPart(
      gate,
      "bar",
      g,
      width / 4,
      0.95,
      -0.7,
      width / 2,
      0.13,
      0.13,
      "#c6beb0",
    );
  }
  if (g.guardhouse) {
    const h = g.guardhouse,
      u = h.u ?? -width / 2 - 4,
      v = h.v ?? 2,
      w = h.w ?? 3.5,
      d = h.d ?? 3,
      y = h.height ?? 2.6;
    const q = layout.point(g, u, v),
      booth = object("guardhouse", q.x, q.z, Math.hypot(w, d) / 2);
    framedPart(booth, "bar", g, u, y / 2, v, w, y, d, h.color || "#d1d1c6");
    framedPart(
      booth,
      "bar",
      g,
      u,
      y * 0.65,
      v + d / 2 + 0.03,
      w * 0.78,
      y * 0.35,
      0.09,
      "#48656f",
    );
    framedPart(
      booth,
      "bar",
      g,
      u,
      y + 0.1,
      v,
      w + 0.35,
      0.25,
      d + 0.35,
      "#697876",
    );
  }
  for (const wall of layout.siteDetails?.retainingWalls || []) {
    const [a, b] = [wall.a, wall.b],
      length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.ceil(length / 3.8),
      h = wall.height || 2;
    if (!length) continue;
    const nx = -(b[1] - a[1]) / length,
      nz = (b[0] - a[0]) / length;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n,
        x = a[0] + (b[0] - a[0]) * t,
        z = a[1] + (b[1] - a[1]) * t;
      const f = { x, z, angle: Math.atan2(a[1] - b[1], b[0] - a[0]) };
      const lower = Math.min(
        terrain.heightAt(x + nx * 1.6, z + nz * 1.6),
        terrain.heightAt(x - nx * 1.6, z - nz * 1.6),
      );
      const offset = lower - terrain.heightAt(x, z);
      const o = object("retainingWall", x, z, length / n / 2 + 0.6);
      framedPart(
        o,
        "bar",
        f,
        0,
        offset + h / 2,
        0,
        length / n - 0.025,
        h,
        0.55,
        wall.color || "#a3a295",
      );
      framedPart(
        o,
        "bar",
        f,
        0,
        offset + h + 0.06,
        0,
        length / n,
        0.16,
        0.7,
        "#b9b9ab",
      );
    }
  }
  for (const fence of layout.siteDetails?.fences || []) {
    const h = fence.height || 1.8;
    for (let j = 1; j < fence.points.length; j++) {
      const a = fence.points[j - 1],
        b = fence.points[j],
        length = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const n = Math.ceil(length / 4);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n,
          x = a[0] + (b[0] - a[0]) * t,
          z = a[1] + (b[1] - a[1]) * t;
        const f = { x, z, angle: Math.atan2(a[1] - b[1], b[0] - a[0]) },
          w = length / n;
        const o = object("fence", x, z, w / 2 + 0.2),
          color = fence.color || "#697b70";
        framedPart(o, "bar", f, -w / 2, h / 2, 0, 0.12, h, 0.12, color);
        for (const y of [h * 0.25, h * 0.85])
          framedPart(o, "bar", f, 0, y, 0, w, 0.07, 0.07, color);
        for (let k = 1; k <= 4; k++)
          framedPart(
            o,
            "bar",
            f,
            -w / 2 + (k * w) / 4,
            h * 0.55,
            0,
            0.035,
            h * 0.6,
            0.035,
            color,
          );
      }
    }
  }
}

export function gateSignTexture(T, text) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#344b58";
  ctx.fillRect(0, 0, 512, 96);
  ctx.fillStyle = "#e4e5dc";
  ctx.font = "600 40px 'Malgun Gothic',sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 49, 485);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  return texture;
}
