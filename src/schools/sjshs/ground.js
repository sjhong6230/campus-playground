import { paintSite } from "../shared/ground.js";
import { campus, dorm } from "./layout.js";
import { point } from "../shared/layout.js";
export function paintGround(args) {
  const p = (u, v) => {
    const q = point(campus, u, v);
    return [q.x, q.z];
  };
  paintSite(args, {
    surfaces: [
      {
        ...point(campus, -5, -26),
        angle: campus.angle,
        w: 94,
        d: 57,
        color: "#b5b7a2",
      },
      {
        ...point(campus, 23, 4),
        angle: campus.angle,
        w: 32,
        d: 29,
        color: "#c1b49c",
      },
      {
        ...point(campus, 27, -28),
        angle: campus.angle,
        w: 24,
        d: 13,
        color: "#a1ab88",
      },
    ],
    paths: [
      {
        points: [p(-56, -57), p(-56, -12), p(-47, 8), p(-41, 15)],
        width: 5,
        color: "#818c85",
      },
      {
        points: [p(-44, 6), p(-37, 0), p(5, 0), p(9, -10)],
        width: 3.6,
        color: "#c6b99e",
      },
      {
        points: [p(42, -48), p(43, 11), [58, 49], [43, 58], [3, 56]],
        width: 2.8,
        color: "#969d8b",
      },
      { points: [p(-43, -39), p(1, -39)], width: 3, color: "#b4a58c" },
      {
        points: Array.from({ length: 33 }, (_, i) => {
          const a = (i / 32) * Math.PI * 2;
          return [dorm.x + 9 * Math.cos(a), dorm.z + 9 * Math.sin(a)];
        }),
        width: 2.5,
        color: "#bcae96",
      },
    ],
    fieldColor: "#c7b898",
    steps: [
      { ...point(campus, -24, -6), angle: campus.angle, w: 31, count: 4 },
    ],
  });
}
