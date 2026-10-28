// Shared drawing primitives; each school supplies its own paths and surfaces.
export function paintSite({ ctx, X, Z, path, fieldPath, layout }, site) {
  function fill(f, u, v, w, d, color) {
    ctx.beginPath();
    [
      [-w / 2, -d / 2],
      [w / 2, -d / 2],
      [w / 2, d / 2],
      [-w / 2, d / 2],
    ].forEach(([a, b], i) => {
      const p = layout.point(f, u + a, v + b);
      i ? ctx.lineTo(X(p.x), Z(p.z)) : ctx.moveTo(X(p.x), Z(p.z));
    });
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  for (const s of site.surfaces) fill(s, 0, 0, s.w, s.d, s.color);
  for (const p of site.paths) path(p.points, p.width, p.color);
  if (layout.parking) {
    const p = layout.parking;
    fill(p, 0, 0, 27, 11, "#8c9590");
    for (let i = -5; i <= 5; i++)
      for (const v of [-3.5, 3.5]) fill(p, i * 2.2, v, 0.14, 3.1, "#e4e2d0");
  }
  const f = layout.field,
    w = f.w / 2 - 1.5,
    d = f.d / 2 - 1.5;
  fill(f, 0, 0, f.w + 1.5, f.d + 1.5, "#b0a58d");
  fill(f, 0, 0, f.w, f.d, site.fieldColor || "#c5b99b");
  if (site.wornField) fill(f, 0, 0, f.w * 0.7, f.d * 0.65, "#b4aa85");
  ctx.strokeStyle = "#ece7d3";
  ctx.lineWidth = 1.2;
  fieldPath(
    [
      [-w, -d],
      [w, -d],
      [w, d],
      [-w, d],
    ],
    true,
  );
  ctx.stroke();
  fieldPath([
    [0, -d],
    [0, d],
  ]);
  ctx.stroke();
  fieldPath(
    Array.from({ length: 49 }, (_, i) => [
      Math.cos((i / 48) * Math.PI * 2) * 3.6,
      Math.sin((i / 48) * Math.PI * 2) * 3.6,
    ]),
  );
  ctx.stroke();
  for (const sign of [-1, 1]) {
    fieldPath([
      [sign * w, -5],
      [sign * (w - 5), -5],
      [sign * (w - 5), 5],
      [sign * w, 5],
    ]);
    ctx.stroke();
  }
  if (layout.tennis) {
    const t = layout.tennis;
    fill(t, 0, 0, t.w + 2, t.d + 2, "#b9a08a");
    fill(t, 0, 0, t.w, t.d, "#5f8477");
    for (const u of [-t.w / 2 + 0.5, 0, t.w / 2 - 0.5])
      fill(t, u, 0, 0.13, t.d - 1, "#e6e3d4");
    for (const v of [-t.d / 2 + 0.5, t.d / 2 - 0.5])
      fill(t, 0, v, t.w - 1, 0.13, "#e6e3d4");
    for (const sign of [-1, 1])
      for (const v of [-1.8, 1.8])
        fill(t, sign * (t.w / 2 - 2), v, 3, 0.13, "#e6e3d4");
  }
  for (const s of site.steps || [])
    for (let i = 0; i < s.count; i++)
      fill(s, 0, i * 0.55, s.w, 0.22, "#d4ceba");
}
