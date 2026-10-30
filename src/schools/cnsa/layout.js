import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
export function createLayout() {
  const layout = {
    homeDistance: 365,
    sources: {
      official: "https://cnsa.hs.kr/sub01/sub06.php",
      reference: "https://cnsa.hs.kr/images/sub/cg_pc2.jpg",
      checked: "2026-10-30",
    },
    buildings: [
      b("C동 · 특별교과동", 4, 3, "#cdbd99", [s(-23, -1, 66, 14)]),
      b("N동 · 행정동·다산관", 5, 3, "#c5bea6", [s(19, -19, 14, 42)]),
      b("A동 · 인문사회동", 4, 3, "#d0c2a5", [s(43, -13, 34, 13)]),
      b("S동 · 자연과학동", 4, 3, "#cabc9e", [s(43, -39, 34, 13)]),
      b("인재관 · 기숙사", 7, 3, "#c3a98c", [
        s(-48, -33, 14, 35),
        s(-23, -44, 36, 13),
      ]),
      b("식당동 · Lake View", 3, 3, "#d3c5a9", [
        s(10, -49, 24, 12, { roofColor: "#c8c8bc" }),
      ]),
      b("충무관 · 체육관", 2, 2, "#b9c9c8", [
        s(48, 27, 28, 25, { roofColor: "#bbc7c2" }),
      ]),
    ],
    links: [
      bridge("C동·N동 연결통로", { x: 10, z: -1 }, { x: 12, z: -1 }, 6, 2, 3),
      bridge(
        "N동·식당 연결통로",
        { x: 19, z: -40 },
        { x: 19, z: -43 },
        6,
        1,
        3,
      ),
    ],
    field: {
      ...s(-15, 29, 70, 32),
      height: 2,
      surface: "turf",
      color: "#7c9c69",
    },
    gate: {
      x: -24,
      z: 51,
      angle: 0,
      style: "piers",
      width: 9,
      color: "#668d9b",
      sign: "충남삼성고등학교",
      barrier: true,
    },
    parking: { x: -64, z: 16, angle: Math.PI / 2 },

    benches: [
      [-30, 9],
      [0, 9],
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
      [-45, -60],
      [5, -60],
      [57, -60],
    ],
    siteDetails: {
      paths: [
        {
          points: [
            [-24, 55],
            [-24, 49],
            [68, 49],
            [68, -50],
          ],
          width: 3,
          kind: "road",
        },
        {
          points: [
            [-50, 48],
            [20, 48],
          ],
          width: 1.8,
          kind: "walk",
        },
      ],
      retainingWalls: [],
      fences: [
        {
          points: [
            [-51, 12],
            [-51, 46],
            [21, 46],
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
  for (const i of [0, 1, 2, 3, 6]) {
    const seg = layout.buildings[i].segments[0];
    seg.facade = {
      ...layout.buildings[i].facade,
      glazedBays: [
        { u: -seg.w / 3, width: seg.w / 5 },
        { u: 0, width: seg.w / 5 },
        { u: seg.w / 3, width: seg.w / 5 },
      ],
    };
  }
  for (const i of [0, 2, 3]) {
    const seg = layout.buildings[i].segments[0];
    seg.roofDetails.canopy = {
      u: 0,
      v: 0,
      w: seg.w - 4,
      d: 8,
      height: 1.3,
      color: "#687f91",
    };
  }
  layout.buildings[4].facade.style = "brick";
  finishLayout(layout, (x, z) => 2 + Math.max(0, -z) * 0.025);

  return layout;
}
