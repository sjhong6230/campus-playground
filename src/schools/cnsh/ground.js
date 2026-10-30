import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 142, d: 108, color: "#a9b68e" },
      { x: -19, z: 29, w: 84, d: 41, color: "#a98170" },
      { x: 0, z: -5, w: 126, d: 8, color: "#b7b9a9" },
    ],
    paths: [],
    fieldColor: "#79956b",
  });
}
