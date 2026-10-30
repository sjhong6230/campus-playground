import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 142, d: 108, color: "#adb596" },
      { x: 10, z: 0, w: 92, d: 14, color: "#c7c0ad" },
      { x: -48, z: 35, w: 23, d: 27, color: "#92a07b" },
      { x: 62, z: 23, w: 13, d: 33, color: "#a4aaa0" },
    ],
    paths: [],
    fieldColor: "#c2b495",
    wornField: true,
  });
}
