import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 142, d: 108, color: "#aeb795" },
      { x: 12, z: 29, w: 92, d: 41, color: "#a98170" },
      { x: 0, z: -5, w: 126, d: 8, color: "#b7b9a9" },
    ],
    paths: [],
    fieldColor: "#688d65",
  });
}
