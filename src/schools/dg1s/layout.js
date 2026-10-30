import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
// Front court and colored glazing are photo-based. Rear massing is approximate.
export function createLayout() {
  const layout = {
    sources: {
      official: "https://dg1s.dge.hs.kr/",
      photos: "https://dg1s.co.kr/",
      facade: "https://www.veritas-a.com/news/articleView.html?idxno=12045",
      checked: "2026-10-30",
    },
    buildings: [
      b("교사동", 4, 2.5, "#d5d8ce", [
        s(-35, -14, 16, 42, { roofColor: "#91a5a7" }),
      ]),
      b("실험동", 4, 2.5, "#d9d7ca", [
        s(0, -14, 16, 42, { roofColor: "#9baeb0" }),
      ]),
      b("후면 교사동 · 근사", 4, 2.5, "#b99f88", [s(-17.5, -41, 51, 10)]),
      b("생활관 · 근사", 5, 2.5, "#c3b8a5", [s(40, -28, 22, 38)]),
      b("체육관 · 근사", 2, 2.5, "#d4c8b4", [
        s(48, 8, 25, 20, { roof: "barrel", roofColor: "#819ba6" }),
      ]),
    ],
    links: [
      bridge("상부 연결부", { x: -27, z: 3 }, { x: -8, z: 3 }, 11.5, 1, 5),
      bridge("중정 연결통로", { x: -27, z: -24 }, { x: -8, z: -24 }, 5.5, 1, 3),
    ],
    field: {
      ...s(-23, 32, 70, 27),
      height: 1.5,
      surface: "dirt",
      color: "#c5bb9e",
    },
    gate: {
      x: 61,
      z: 46,
      angle: 0,
      style: "piers",
      width: 9,
      sign: "대구일과학고등학교",
    },
    parking: { x: 47, z: 34, angle: 0 },
    benches: [
      [-19, -5],
      [-19, -15],
      [20, 16],
    ],
    trees: [
      ...Array.from({ length: 16 }, (_, i) => [-69, -49 + i * 6.5]),
      ...Array.from({ length: 17 }, (_, i) => [-63 + i * 8, -54]),
      ...Array.from({ length: 12 }, (_, i) => [-61 + i * 8, 53]),
      [22, -38],
      [23, -25],
      [23, -12],
      [22, 3],
      [67, 13],
      [67, -10],
      [67, -32],
    ],
    maxTrees: 52,
    hills: [],
    siteDetails: {
      paths: [
        {
          points: [
            [61, 51],
            [61, 25],
            [19, 20],
            [19, 9],
            [-18, 9],
            [-18, -19],
          ],
          width: 4,
          kind: "road",
        },
        {
          points: [
            [-64, 50],
            [-64, -47],
          ],
          width: 3,
          kind: "walk",
        },
      ],
      retainingWalls: [{ a: [-61, 14], b: [13, 14], height: 1 }],
      fences: [
        {
          points: [
            [-60, 17],
            [-60, 47],
            [14, 47],
          ],
          height: 1.5,
        },
      ],
    },
  };
  for (const building of layout.buildings) {
    building.facade = {
      style: "panel",
      color: building.color,
      trim: "#e5e3d7",
      window: "#377c91",
      bandColor: "#b6c9c6",
    };
    for (const segment of building.segments)
      if (segment.roof === "flat") segment.roofDetails = { parapet: true };
  }
  // Alternate colored vertical bays using existing facade primitives.
  for (const index of [0, 1]) {
    const segment = layout.buildings[index].segments[0];
    segment.facade = {
      ...layout.buildings[index].facade,
      trim: index === 0 ? "#dda94b" : "#d78358",
      glazedBays: [
        { u: -4, width: 3 },
        { u: 0, width: 3 },
        { u: 4, width: 3 },
      ],
    };
  }
  return finishLayout(layout);
}
