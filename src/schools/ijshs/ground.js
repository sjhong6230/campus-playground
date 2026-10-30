import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 142, d: 108, color: "#adbba0" },
      { x: 4, z: -2, w: 106, d: 14, color: "#c9c8b9" },
      { x: -47, z: 37, w: 28, d: 29, color: "#91a17b" },
      { x: 10, z: -41, w: 74, d: 21, color: "#91a17b" },
      { x: 62, z: -24, w: 12, d: 47, color: "#a6aaa3" },
    ],
    paths: [],
    fieldColor: "#c4ad83",
    wornField: true,
  });
}
