import { segment as s, building as b, finishLayout } from "../shared/layout.js";
export function createLayout() {
  const layout = {
    sources: {
      official: "https://unjeong-h.goepj.kr/unjeong-h/main.do",
      classification:
        "https://unjeong-h.goepj.kr/unjeong-h/na/ntt/selectNttList.do?bbsId=3189&mi=4074",
      checked: "2026-10-30",
    },
    buildings: [
      b("본관", 5, 2.5, "#c5bd8b", [
        s(-17, -15, 67, 12, { roofColor: "#b5c4b8" }),
        s(23, -15, 13, 18, { color: "#b8a36d", roofColor: "#aaa078" }),
      ]),
      b("후면 교사동", 4, 2.5, "#b98f7a", [
        s(-18, -43, 66, 11, { roof: "gable", roofColor: "#7a8a99" }),
        s(-52, -30, 12, 37),
      ]),
      b("체육관", 2, 2.5, "#cbd3b9", [
        s(45, -9, 24, 24, { roofColor: "#b8bba4" }),
      ]),
    ],
    links: [],
    field: {
      ...s(-13, 24, 75, 37),
      height: 1.5,
      surface: "turf",
      color: "#628d66",
    },
    tennis: { ...s(-62, 23, 13, 23), height: 1.5 },
    courtKind: "basketball",
    gate: {
      x: 51,
      z: 33,
      angle: 0,
      style: "piers",
      width: 9,
      height: 2.6,
      color: "#c1b4a1",
      sign: "운정고등학교",
    },
    parking: { x: 49, z: -38, angle: 0 },
    benches: [
      [-33, 1],
      [-17, 1],
      [0, 1],
    ],
    trees: [
      ...Array.from({ length: 17 }, (_, i) => [-72, -51 + i * 6.5]),
      ...Array.from({ length: 17 }, (_, i) => [-65 + i * 8, -55]),
      ...Array.from({ length: 13 }, (_, i) => [-65 + i * 8, 52]),
      [65, -24],
      [66, -6],
      [65, 12],
      [65, 30],
    ],
    maxTrees: 51,
    hills: [],
    siteDetails: {
      paths: [
        {
          points: [
            [51, 52],
            [51, 29],
            [57, 16],
            [63, 8],
            [63, -48],
          ],
          width: 4,
          kind: "road",
        },
        {
          points: [
            [-47, 2],
            [28, 2],
            [34, 9],
          ],
          width: 2,
          kind: "walk",
        },
      ],
      retainingWalls: [{ a: [-49, 3], b: [25, 3], height: 1 }],
      fences: [
        {
          points: [
            [-52, 4],
            [-52, 45],
            [27, 45],
          ],
          height: 2,
        },
      ],
    },
  };
  for (const building of layout.buildings) {
    building.facade = {
      style: "brick",
      color: building.color,
      trim: "#e1ddc9",
      window: "#456b7a",
      bandColor: "#b9b995",
    };
    for (const segment of building.segments)
      if (segment.roof === "flat") segment.roofDetails = { parapet: true };
  }
  layout.buildings[0].segments[0].facade = {
    ...layout.buildings[0].facade,
    glazedBays: [{ u: -7, width: 7 }],
  };
  layout.buildings[0].segments[0].roofDetails.canopy = {
    u: -19,
    v: 0,
    w: 23,
    d: 9,
    height: 1.2,
    color: "#637f93",
  };
  layout.buildings[0].segments[1].facade = {
    ...layout.buildings[0].facade,
    style: "panel",
    color: "#b8a36d",
  };
  layout.buildings[2].facade = {
    ...layout.buildings[2].facade,
    style: "panel",
    bandColor: "#aec297",
  };
  return finishLayout(layout);
}
