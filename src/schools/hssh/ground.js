import { paintSite } from "../shared/ground.js";
import { point } from "../shared/layout.js";
import { campus } from "./layout.js";
export function paintGround(args) {
  const route = (points) =>
    points.map(([u, v]) => {
      const p = point(campus, u, v);
      return [p.x, p.z];
    });
  paintSite(args, {
    surfaces: [{ ...campus, w: 112, d: 65, color: "#b9bda6" }],
    paths: [
      {
        points: route([
          [-58, 38],
          [54, 38],
          [58, 27],
          [57, -24],
          [45, -32],
        ]),
        width: 6,
        color: "#7f8983",
      },
      {
        points: route([
          [-52, 29],
          [-53, -23],
          [46, -23],
          [51, -17],
          [51, 34],
          [-44, 34],
          [-52, 29],
        ]),
        width: 3.2,
        color: "#a0a596",
      },
      {
        points: route([
          [-23, -8],
          [10, -8],
          [10, 26],
        ]),
        width: 2.7,
        color: "#cfc3ac",
      },
      {
        points: route([
          [-37, 25],
          [-37, -7],
        ]),
        width: 2,
        color: "#d8cdb8",
      },
    ],
  });
}
