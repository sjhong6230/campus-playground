import { segment as s, building as b, finishLayout } from "../shared/layout.js";
export function createLayout() {
  const layout = {
    homeDistance: 325,
    sources: {
      official: "https://jinseon.sen.hs.kr/",
      reference:
        "https://jinseon.sen.hs.kr/dggb/module/image/selectDesignImageView.do?sitemapId=248465&usrimgId=26233",
      checked: "2026-10-30",
    },
    buildings: [
      b("고등학교 교사동", 4, 4, "#d9d5ba", [
        s(14, -18, 92, 15),
        s(9, -8, 10, 5, { color: "#c5c9c1" }),
      ]),
      b("연화관 · 위치 근사", 5, 4, "#b5aa9a", [s(-49, -17, 23, 24)]),
      b("회당기념관", 2, 4, "#aa7451", [
        s(-34, -43, 23, 18, { roof: "gable", roofColor: "#5b6361" }),
      ]),
      b("중학교 교사동 · 공유 부지·위치 근사", 4, 4, "#c8c8b3", [
        s(20, -44, 76, 13),
      ]),
    ],
    links: [],
    field: {
      ...s(0, 29, 110, 35),
      height: 1.5,
      surface: "dirt",
      color: "#c8b798",
    },
    gate: {
      x: 62,
      z: 47,
      angle: 0,
      style: "piers",
      width: 9,
      color: "#9c6976",
      sign: "진선여자고등학교",
      barrier: true,
    },
    parking: { x: 64, z: -1, angle: Math.PI / 2 },

    benches: [
      [-15, 7.5],
      [15, 7.5],
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
    hills: [],
    siteDetails: {
      paths: [
        {
          points: [
            [62, 52],
            [62, 5],
            [-61, 5],
            [-61, -49],
          ],
          width: 3,
          kind: "road",
        },
        {
          points: [
            [-55, 49.5],
            [55, 49.5],
          ],
          width: 1.8,
          kind: "walk",
        },
      ],
      retainingWalls: [
        { a: [-54, 7], b: [-2, 7], height: 2.5 },
        { a: [16, 7], b: [56, 7], height: 2.5 },
      ],
      fences: [
        {
          points: [
            [-56, 10.5],
            [-56, 47.5],
            [56, 47.5],
          ],
          height: 1.5,
        },
      ],
      stairs: [
        {
          x: 8,
          z: 2,
          angle: 0,
          width: 10,
          depth: 15,
          count: 8,
          upperY: 4,
          lowerY: 1.5,
          color: "#c6c2b4",
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
    style: "stone",
    color: "#c5c9c1",
    glazedBays: [{ u: 0, width: 6 }],
  };
  layout.buildings[1].facade.glazedBays = [
    { u: -7, width: 4 },
    { u: 0, width: 4 },
    { u: 7, width: 4 },
  ];
  finishLayout(layout, (x, z) => 1.5 + Math.max(0, -z) * 0.025);
  const ground = layout.elevationAt;
  layout.elevationAt = (x, z) =>
    Math.abs(x - 8) < 5 && Math.abs(z - 2) < 7.5 ? 1.5 : ground(x, z);
  return layout;
}
