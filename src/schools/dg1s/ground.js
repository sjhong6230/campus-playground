import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 140, d: 106, color: "#b6c2a4" },
      { x: -17.5, z: -10, w: 20, d: 33, color: "#d0cbbc" },
      { x: -17.5, z: -8, w: 9, d: 16, color: "#87a27a" },
    ],
    paths: [],
    fieldColor: "#c5bb9e",
  });
}
