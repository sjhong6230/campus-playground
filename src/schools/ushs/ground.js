import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 142, d: 108, color: "#a9b38f" },
      { x: -1, z: 34, w: 83, d: 34, color: "#b9b29b" },
      { x: 0, z: -5, w: 126, d: 8, color: "#b7b9a9" },
    ],
    paths: [],
    fieldColor: "#c4b695",
  });
}
