import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [{ x: 0, z: 0, w: 136, d: 104, color: "#b6c1ab" }],
    paths: [],
    fieldColor: "#b7ad8a",
  });
}
