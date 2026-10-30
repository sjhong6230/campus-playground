import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  const f = args.layout.field;
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 144, d: 108, color: "#9fb184" },
      { x: f.x, z: f.z, w: f.w + 7, d: f.d + 7, color: "#b98268" },
      { x: -23, z: -3, w: 32, d: 8, color: "#cdbd95" },
      { x: 35, z: 44, w: 17, d: 17, color: "#8fa66e" },
    ],
    paths: [],
    fieldColor: "#93ab66",
  });
}
