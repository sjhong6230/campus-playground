import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  const f = args.layout.field;
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 142, d: 108, color: "#acbd9b" },
      { x: f.x, z: f.z, w: f.w + 6, d: f.d + 6, color: "#a9796e" },
      { x: -17, z: -29, w: 52, d: 11, color: "#c7c3ae" },
    ],
    paths: [],
    fieldColor: "#628d66",
  });
}
