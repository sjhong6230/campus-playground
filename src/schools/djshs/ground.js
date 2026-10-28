import { paintSite } from "../shared/ground.js";
export function paintGround(args) {
  paintSite(args, {
    surfaces: [{ x: -3, z: 5, w: 115, d: 92, color: "#b5baa6" }],
    paths: [
      {
        points: [
          [-67, -48],
          [58, -48],
        ],
        width: 6,
        color: "#7c8680",
      },
      {
        points: [
          [-55, -44],
          [-55, 43],
          [-33, 43],
        ],
        width: 5,
        color: "#8a938a",
      },
      {
        points: [
          [-52, -39],
          [53, -39],
          [53, 49],
          [-34, 49],
        ],
        width: 3.2,
        color: "#929b8e",
      },
      {
        points: [
          [-30, -17],
          [31, -17],
        ],
        width: 4,
        color: "#b8b3a1",
      },
      {
        points: [
          [-28, 8],
          [19, 8],
          [19, 45],
        ],
        width: 2.2,
        color: "#d2c6ae",
      },
    ],
    fieldColor: "#9ca77a",
    wornField: true,
    steps: [{ x: -8, z: 9, angle: 0, w: 36, count: 4 }],
  });
}
