import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 142, d: 108, color: "#b2b79b" },
      { x: 0, z: 29, w: 117, d: 42, color: "#b9b29b" },
      { x: 0, z: -5, w: 126, d: 8, color: "#b7b9a9" },
    ],
    paths: [],
    fieldColor: "#c8b798",
  });
}
