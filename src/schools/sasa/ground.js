import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 112, d: 101, color: "#bec5ae" },
      { x: -15, z: 4, w: 49, d: 11, color: "#8fa779" },
      { x: 28, z: 24, w: 14, d: 33, color: "#8ca475" },
    ],
    paths: [],
    fieldColor: "#729451",
    steps: [{ x: -14, z: 12.8, angle: 0, w: 56, count: 4 }],
  });
  const { ctx, fieldPath, layout, rect, path } = args;
  for (const [offset, width, color] of [
    [2.6, 35, "#ad6858"],
    [1.4, 1, "#ecd5bd"],
    [2.5, 1, "#ecd5bd"],
    [3.6, 1, "#ecd5bd"],
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
  // Garden biotope, benches and planted beds are a schematic landscape.
  rect(28, 7, 7, 4, "#739b9b");
  for (const x of [-29, -17, -5]) {
    rect(x, 4, 6, 5, "#768e5f");
    path(
      [
        [x - 4, 0],
        [x - 4, 9],
      ],
      0.8,
      "#d4cfbb",
    );
  }
}
