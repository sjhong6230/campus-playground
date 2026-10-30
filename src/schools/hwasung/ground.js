import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 144, d: 108, color: "#bdc7ae" },
      { x: -6, z: -29, w: 42, d: 16, color: "#9aaf86" },
      { x: 5, z: -29, w: 4, d: 14, color: "#d0c3a7" },
      { x: -9, z: 22, w: 71, d: 7, color: "#cfc7b3" },
    ],
    paths: [],
    fieldColor: "#c7bd9c",
  });
}
