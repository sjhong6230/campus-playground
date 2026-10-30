import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [{ x: 0, z: 0, w: 136, d: 104, color: "#b8c3a8" }],
    paths: [],
    fieldColor: "#739461",
  });
  const { ctx, fieldPath, layout } = args;
  // Procedural track; no reference-photo pixels are included.
  const w = layout.field.w / 2 + 2,
    d = layout.field.d / 2 + 2;
  fieldPath(
    [
      [-w, -d],
      [w, -d],
      [w, d],
      [-w, d],
    ],
    true,
  );
  ctx.strokeStyle = "#b16e5e";
  ctx.lineWidth = 12;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.strokeStyle = "#eadfd0";
  ctx.lineWidth = 1;
  ctx.stroke();
}
