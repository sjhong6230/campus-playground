import { segment as s, building as b, finishLayout } from "../shared/layout.js";
// Official illustrated campus map: distances are compressed to the game bounds.
const tiled = (x, z, w, d) =>
  s(x, z, w, d, { roof: "gable", roofColor: "#536f91" });
export function createLayout() {
  const layout = {
    homeDistance: 420,
    sources: {
      official: "https://www.minjok.hs.kr/",
      diagram: "https://www.minjok.hs.kr/sub01/sub08_1",
      dormitory: "https://www.minjok.hs.kr/sub03/sub01_2",
      checked: "2026-10-30",
    },
    buildings: [
      b("충무관", 3, 5, "#d5c4a5", [tiled(-24, -10, 27, 13)]),
      b("다산관", 3, 4, "#d1c2a4", [tiled(-53, 1, 23, 14)]),
      b("덕고관", 12, 12, "#d5d1b8", [
        s(-48, -40, 22, 11, { roofColor: "#aab8b0" }),
      ]),
      b("영어교육관", 2, 9, "#dbd0b3", [tiled(-19, -35, 22, 9)]),
      b("민족교육관", 2, 9, "#cfc4a7", [tiled(7, -36, 24, 10)]),
      b("체육관", 2, 8, "#c5a080", [
        s(40, -24, 22, 16, { roof: "barrel", roofColor: "#7fa793" }),
      ]),
      b("소사관", 5, 8, "#d7cbb5", [
        s(61, -27, 13, 21, { roofColor: "#758b9e" }),
      ]),
      b("창의관", 2, 15, "#d1c7b2", [tiled(40, -48, 18, 8)]),
      b("국궁장", 1, 4, "#c9b58b", [tiled(31, 4, 10, 8)]),
      b("가정교육관", 3, 6, "#d7c8a9", [tiled(53, 5, 22, 12)]),
    ],
    links: [],
    field: {
      ...s(-7, 19, 48, 23),
      height: 2,
      surface: "turf",
      color: "#93ab66",
    },
    tennis: { ...s(-18, 43, 52, 12), height: 1.5 },
    courtKind: "tennis",
    gate: {
      x: 59,
      z: 49,
      angle: 0,
      style: "piers",
      width: 9,
      sign: "민족사관고등학교",
    },
    parking: { x: 60, z: 32, angle: Math.PI / 2 },
    benches: [
      [-34, 23],
      [-27, -2],
      [20, 0],
      [25, 31],
    ],
    trees: [
      ...Array.from({ length: 17 }, (_, i) => [-72, -52 + i * 6.5]),
      ...Array.from({ length: 17 }, (_, i) => [-65 + i * 8, -56]),
      ...Array.from({ length: 12 }, (_, i) => [-65 + i * 8, 55]),
      [-33, -24],
      [-30, -36],
      [-4, -22],
      [20, -19],
      [24, -36],
      [25, -49],
      [69, -4],
      [68, 13],
      [35, 25],
      [35, 38],
      [-52, 28],
      [-60, 43],
    ],
    maxTrees: 58,
    hills: [],
    siteDetails: {
      paths: [
        {
          points: [
            [59, 53],
            [42, 37],
            [23, 34],
            [23, 3],
            [19, -14],
            [20, -28],
          ],
          width: 4,
          kind: "road",
        },
        {
          points: [
            [23, 3],
            [-28, 3],
            [-38, -8],
            [-34, -24],
            [-38, -30],
          ],
          width: 2.5,
          kind: "walk",
        },
        {
          points: [
            [28, -15],
            [52, -15],
          ],
          width: 2.2,
          kind: "walk",
        },
      ],
      retainingWalls: [
        { a: [-60, -29], b: [-35, -29], height: 4 },
        { a: [-36, 4], b: [17, 4], height: 2 },
      ],
      fences: [],
    },
  };
  for (const [i, building] of layout.buildings.entries()) {
    building.facade = {
      style: i === 2 || i === 6 ? "render" : "stone",
      color: building.color,
      trim: "#dcd0b6",
      window: "#526375",
      bandColor: "#927b5d",
    };
    for (const segment of building.segments)
      if (segment.roof === "flat") segment.roofDetails = { parapet: true };
  }
  return finishLayout(layout, (x, z) => 1.5 + Math.max(0, -z) * 0.25);
}
