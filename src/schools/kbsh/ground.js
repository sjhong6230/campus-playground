import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 128, d: 98, color: "#bec5b0" },
      { x: -44, z: 5, w: 28, d: 13, color: "#8eaa78" },
    ],
    paths: [],
    fieldColor: "#7f995b",
    wornField: true,
  });
  const { ctx, fieldPath, layout } = args;
  // Red perimeter track and white lanes, drawn without image dependencies.
  for (const [offset, width, color] of [
    [2.6, 35, "#b36e60"],
    [1.4, 1, "#ead4bc"],
    [2.5, 1, "#ead4bc"],
    [3.6, 1, "#ead4bc"],
  ]) {
    const w = layout.field.w / 2 + offset,
      d = layout.field.d / 2 + offset;
    fieldPath(
      [
        [-w + 5, -d],
        [w - 5, -d],
        [w, -d + 5],
        [w, d - 5],
        [w - 5, d],
        [-w + 5, d],
        [-w, d - 5],
        [-w, -d + 5],
      ],
      true,
    );
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.stroke();
  }
}
