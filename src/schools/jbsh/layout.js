import { segment as s, building as b, finishLayout } from "../shared/layout.js";
export function createLayout() {
  const layout = {
    homeDistance: 325,
    sources: {
      official: "https://school.jbedu.kr/ejbs/",
      reference: "https://www.kyobit.com/news/articleView.html?idxno=591",
      checked: "2026-10-30",
    },
    buildings: [
      b("본관", 3, 5, "#c6ac83", [
        s(-24, -18, 34, 15),
        s(-2, -18, 10, 19, { color: "#d5d7c8" }),
        s(22, -18, 38, 15),
      ]),
      b("서측 부속동", 2, 5, "#c3ae89", [s(-51, -18, 20, 16)]),
      b("동측 부속동", 2, 5, "#d6d8c5", [s(52, -18, 22, 16)]),
      b("입지관 · 기숙사 · 위치 근사", 2, 6, "#b9a389", [s(46, -45, 34, 13)]),
      b("청운관 · 기숙사 · 위치 근사", 2, 6, "#c4b393", [s(-46, -45, 34, 13)]),
    ],
    links: [],
    field: {
      ...s(0, 29, 110, 34),
      height: 1.5,
      surface: "turf",
      color: "#a0aa70",
    },
    gate: {
      x: -63,
      z: 49,
      angle: 0,
      style: "piers",
      width: 9,
      color: "#a78f66",
      sign: "전북과학고등학교",
      barrier: true,
    },
    parking: { x: 65, z: 10, angle: Math.PI / 2 },

    benches: [
      [-15, 8],
      [15, 8],
    ],
    trees: [
      ...Array.from({ length: 17 }, (_, i) => [-68 + i * 8.5, -56]),
      ...Array.from({ length: 12 }, (_, i) => [-62 + i * 11, 54]),
      [-69, -36],
      [-69, -14],
      [-69, 7],
      [-69, 30],
      [70, -35],
      [70, -13],
      [70, 8],
      [70, 30],
    ],
    maxTrees: 37,
    hills: [
      [-50, -60],
      [0, -60],
      [50, -60],
    ],
    siteDetails: {
      paths: [
        {
          points: [
            [-63, 54],
            [-63, 4],
            [65, 4],
            [65, -49],
          ],
          width: 3,
          kind: "road",
        },
        {
          points: [
            [-55, 49],
            [55, 49],
          ],
          width: 1.8,
          kind: "walk",
        },
      ],
      retainingWalls: [
        { a: [-55, 8], b: [-9, 8], height: 3.5 },
        { a: [7, 8], b: [57, 8], height: 3.5 },
      ],
      fences: [
        {
          points: [
            [-56, 11],
            [-56, 47],
            [56, 47],
          ],
          height: 1.5,
        },
      ],
      stairs: [
        {
          x: -1,
          z: 1,
          angle: 0,
          width: 10,
          depth: 18,
          count: 10,
          upperY: 5,
          lowerY: 1.5,
          color: "#c7c5b4",
        },
      ],
    },
  };
  for (const building of layout.buildings) {
    building.facade = {
      style: "panel",
      color: building.color,
      trim: "#e0dbca",
      window: "#60777b",
      bandColor: "#b1b3a5",
    };
    for (const segment of building.segments) {
      if (segment.color)
        segment.facade = { ...building.facade, color: segment.color };
      segment.roofDetails = { parapet: segment.roof === "flat" };
    }
  }
  layout.buildings[0].segments[1].facade = {
    ...layout.buildings[0].facade,
    glazedBays: [{ u: 0, width: 6 }],
  };
  finishLayout(layout, (x, z) => 1.5 + Math.max(0, -z) * 0.1);
  const ground = layout.elevationAt;
  layout.elevationAt = (x, z) =>
    Math.abs(x - -1) < 5 && Math.abs(z - 1) < 9 ? 1.5 : ground(x, z);
  return layout;
}
