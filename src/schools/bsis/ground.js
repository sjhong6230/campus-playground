import { paintSite } from "../shared/ground.js";

export function paintGround(args) {
  const { rect, path, fieldPath, ctx, layout } = args;
  paintSite(args, {
    surfaces: [
      { x: 2, z: -18, w: 65, d: 72, color: "#b8bdad" },
      { x: 1, z: 32, w: 72, d: 39, color: "#a8afa0" },
      { x: -11, z: -7, w: 19, d: 13, color: "#71916a" },
      { x: 24, z: -4, w: 17, d: 9, color: "#6e8c65" },
    ],
    paths: [],
    fieldColor: "#b7b28e",
    wornField: true,
  });
  // Rounded rectangular track surrounds the weathered dirt playing surface.
  const f = layout.field;
  function track(w, d, r) {
    return Array.from({ length: 4 }, (_, corner) => {
      const a0 = (corner * Math.PI) / 2;
      const cx = (corner === 0 || corner === 3 ? 1 : -1) * (w / 2 - r);
      const cz = (corner < 2 ? 1 : -1) * (d / 2 - r);
      return Array.from({ length: 9 }, (_, i) => {
        const a = a0 + (i * Math.PI) / 16;
        return [cx + r * Math.cos(a), cz + r * Math.sin(a)];
      });
    }).flat();
  }
  fieldPath(track(f.w + 2.5, f.d + 2.5, 2), true);
  ctx.lineWidth = 22;
  ctx.strokeStyle = "#a46154";
  ctx.stroke();
  for (const offset of [0.5, 1.25, 2]) {
    fieldPath(track(f.w + offset * 2, f.d + offset * 2, 1.4 + offset), true);
    ctx.strokeStyle = "#d9b4a0";
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }
  // Upper multi-use court beside the smaller basketball court.
  rect(-3, -48, 26, 10, "#5e8070");
  path(
    [
      [-15, -52],
      [9, -52],
      [9, -44],
      [-15, -44],
      [-15, -52],
    ],
    0.12,
    "#e1e1cc",
  );
  path(
    [
      [-3, -52],
      [-3, -44],
    ],
    0.12,
    "#e1e1cc",
  );
  for (const row of [0, 1, 2])
    rect(-15, 14.3 + row * 0.5, 33, 0.25, row % 2 ? "#bcbda9" : "#dfdcc8");
  rect(-13, 13.3, 6, 2, "#8caf9b");
}
