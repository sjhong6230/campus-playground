import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 136, d: 101, color: "#b8c4aa" },
      { x: 0, z: -9, w: 31, d: 8, color: "#c5c3b7" },
    ],
    paths: [],
    fieldColor: "#8d9c70",
  });
}
