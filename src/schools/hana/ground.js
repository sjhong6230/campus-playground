import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 142, d: 108, color: "#a8b498" },
      { x: 25, z: 29, w: 27, d: 34, color: "#c5c6b7" },
      { x: -22, z: -12, w: 39, d: 9, color: "#b8c0b0" },
      { x: 59, z: -32, w: 15, d: 33, color: "#a1aba4" },
    ],
    paths: [],
    fieldColor: "#67946d",
  });
}
