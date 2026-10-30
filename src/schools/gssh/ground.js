import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  const garden = [];
  for (let x = 0; x <= 24; x += 6)
    for (let z = -25; z <= -7; z += 6)
      garden.push({
        x,
        z,
        w: 4.5,
        d: 4.5,
        color: (x + z) % 12 === -1 ? "#ad8975" : "#91a47e",
      });
  paintSite(args, {
    surfaces: [
      { x: 0, z: 0, w: 138, d: 104, color: "#bac4a7" },
      { x: 12, z: -16, w: 32, d: 27, color: "#d2c8ac" },
      ...garden,
    ],
    paths: [],
    fieldColor: "#c6b99c",
  });
}
