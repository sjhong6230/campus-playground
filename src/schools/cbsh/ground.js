import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 142, d: 108, color: "#a7b28e" },
      { x: 5, z: -13, w: 104, d: 8, color: "#b6bca9" },
      { x: -47, z: 35, w: 27, d: 24, color: "#8d9f72" },
      { x: 44, z: 45, w: 51, d: 21, color: "#809a7b" },
    ],
    paths: [],
    fieldColor: "#8fa36d",
  });
}
