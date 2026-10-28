import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [{ x: -3, z: 0, w: 77, d: 110, color: "#b6b8a5" }],
    paths: [
      {
        points: [
          [-51, -60],
          [-54, 60],
        ],
        width: 9,
        color: "#717b7d",
      },
      {
        points: [
          [-46, -57],
          [30, -57],
          [31, -47],
          [25, -45],
        ],
        width: 5,
        color: "#8f9690",
      },
      {
        points: [
          [-38, -50],
          [-38, 52],
          [20, 52],
          [25, 31],
        ],
        width: 3.4,
        color: "#92988c",
      },
      {
        points: [
          [-11, -48],
          [-11, -8],
          [27, -8],
          [27, 26],
          [19, 47],
        ],
        width: 3,
        color: "#cbb89a",
      },
      {
        points: [
          [-18, 11],
          [-18, 47],
        ],
        width: 4,
        color: "#d1c7b1",
      },
    ],
    steps: [{ x: 5, z: -10, angle: 0, w: 29, count: 5 }],
  });
}
