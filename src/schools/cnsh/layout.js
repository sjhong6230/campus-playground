import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
export function createLayout() {
  const layout = {
    homeDistance: 325,
    sources: {
      official: "https://www.cnsh.cnehs.kr/",
      reference: "https://mint7539.tistory.com/70",
      checked: "2026-10-30",
    },
    buildings: [
      b("본관 · 교실·실험실", 4, 5, "#dddcd0", [
        s(-11, -16, 72, 16),
        s(36, -16, 22, 18, { color: "#846b66" }),
        s(51, -20, 8, 16, { color: "#ced6cf" }),
      ]),
      b("후동 · 도서관·급식실 · 위치 근사", 3, 5, "#be9a8b", [
        s(-5, -43, 65, 14),
      ]),
      b("체육관 · 위치 근사", 2, 5, "#bba78f", [
        s(-52, -39, 22, 23, { roof: "barrel", roofColor: "#a5b5a4" }),
      ]),
      b("DREAM HIGH · 기숙사 · 위치 근사", 4, 2, "#c0b8a6", [
        s(58, 25, 20, 38),
      ]),
    ],
    links: [
      bridge("본동·후동 연결통로", { x: 4, z: -24 }, { x: 4, z: -36 }, 8, 2, 3),
    ],
    field: {
      ...s(-19, 29, 77, 34),
      height: 2,
      surface: "turf",
      color: "#79956b",
    },
    gate: {
      x: -61,
      z: 48,
      angle: 0,
      style: "piers",
      width: 9,
      color: "#7a9567",
      sign: "충남과학고등학교",
      barrier: true,
    },
    parking: { x: 35, z: 30, angle: Math.PI / 2 },
    observatory: {
      x: 36,
      z: -16,
      y: 17,
      building: 0,
      radius: 3.5,
      color: "#d7ddd7",
    },
    benches: [
      [-34, 8],
      [-4, 8],
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
      [-48, -60],
      [0, -60],
      [48, -60],
    ],
    siteDetails: {
      paths: [
        {
          points: [
            [-61, 52],
            [-61, 4],
            [43, 4],
            [43, 49],
          ],
          width: 3,
          kind: "road",
        },
        {
          points: [
            [-57.5, 49],
            [19.5, 49],
          ],
          width: 1.8,
          kind: "walk",
        },
      ],
      retainingWalls: [{ a: [-56, 8], b: [20, 8], height: 3 }],
      fences: [
        {
          points: [
            [-58.5, 11],
            [-58.5, 47],
            [20.5, 47],
          ],
          height: 1.5,
        },
      ],
      stairs: [],
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
  layout.buildings[0].segments[0].facade = {
    ...layout.buildings[0].facade,
    bandColor: "#91ad64",
    trim: "#eeeae1",
    glazedBays: [
      { u: -23, width: 6 },
      { u: 0, width: 6 },
      { u: 23, width: 6 },
    ],
  };
  layout.buildings[0].segments[2].facade = {
    ...layout.buildings[0].facade,
    glazedBays: [{ u: 0, width: 6 }],
  };
  finishLayout(layout, (x, z) => 2 + Math.max(0, -z) * 0.1);

  return layout;
}
