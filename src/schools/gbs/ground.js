import { paintSite } from "../shared/ground.js";

export function paintGround(args) {
  const { ctx, rect, path, layout, X, Z } = args;
  paintSite(args, {
    surfaces: [
      { x: -19, z: -15, w: 68, d: 62, color: "#aab2a2" },
      { x: -5, z: 33, w: 99, d: 35, color: "#b4b9aa" },
      { x: -28, z: -12, w: 26, d: 13, color: "#748d65" },
      { x: -42, z: 34, w: 12, d: 11, color: "#839477" },
      { x: -10, z: 32, w: 11, d: 12, color: "#7d9376" },
      { x: -25, z: 34, w: 6, d: 25, color: "#6e8965" },
    ],
    paths: [],
    fieldColor: "#c4ba9c",
    wornField: true,
    steps: [{ x: 13.2, z: -11, angle: Math.PI / 2, w: 44, count: 4 }],
  });
  // The older schematic shows a tennis outline here. The current satellite
  // instead identifies a tall fenced golf enclosure east of the complex.
  rect(49.5, 34, 8, 19, "#427a62");
  for (const z of [28, 32, 36, 40]) rect(47, z, 2, 2.6, "#6c9a7c");
  rect(30, 54, 26, 2.2, "#779986");

  // Replace the generic court markings with the blue basketball surface
  // visible south of the classroom wing.
  const c = layout.tennis;
  rect(c.x, c.z, c.w, c.d, "#577c86");
  path(
    [
      [c.x - 10, c.z - 4],
      [c.x + 10, c.z - 4],
      [c.x + 10, c.z + 4],
      [c.x - 10, c.z + 4],
      [c.x - 10, c.z - 4],
    ],
    0.12,
    "#dbdcca",
  );
  path(
    [
      [c.x, c.z - 4],
      [c.x, c.z + 4],
    ],
    0.12,
    "#dbdcca",
  );
  const circle = (x, z, r) => {
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const angle = (i * Math.PI) / 20;
      const px = X(x + Math.cos(angle) * r);
      const pz = Z(z + Math.sin(angle) * r);
      i ? ctx.lineTo(px, pz) : ctx.moveTo(px, pz);
    }
    ctx.strokeStyle = "#d8ddcf";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  };
  circle(c.x, c.z, 1.7);
  for (const sign of [-1, 1]) {
    rect(c.x + sign * 8.5, c.z, 3.2, 4.3, "#837c65");
    path(
      [
        [c.x + sign * 10, c.z - 2.15],
        [c.x + sign * 6.9, c.z - 2.15],
        [c.x + sign * 6.9, c.z + 2.15],
        [c.x + sign * 10, c.z + 2.15],
      ],
      0.12,
      "#dbdcca",
    );
    circle(c.x + sign * 6.9, c.z, 1.6);
  }
}
