import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 142, d: 108, color: "#bcc4ab" },
      { x: -38, z: 16, w: 27, d: 42, color: "#95a37e" },
      { x: 25, z: -28, w: 22, d: 9, color: "#a4af8b" },
      { x: 1, z: 0, w: 102, d: 8, color: "#cfbca4" },
    ],
    paths: [],
    fieldColor: "#bcb994",
    wornField: true,
  });
}
