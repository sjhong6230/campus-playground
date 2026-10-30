import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
export function createLayout() {
  const layout = {
    homeDistance: 350,
    sources: {
      official: "https://school.use.go.kr/ushs-h/",
      reference:
        "https://www.ulsanpress.net/news/articleView.html?idxno=535032",
      checked: "2026-10-30",
    },
    buildings: [
      b("본관", 4, 4, "#bd8d6c", [
        s(-13, 0, 60, 14),
        s(-48, 0, 10, 18, { color: "#b5c1c0" }),
      ]),
      b("서측 교사동", 4, 6, "#bc8b6c", [s(-41, -26, 18, 25)]),
      b("중앙 교사동", 4, 6, "#bd8e70", [s(-11, -26, 18, 25)]),
      b("후면 교사동", 4, 8, "#c19578", [s(-12, -46, 35, 12)]),
      b("기숙사 · 위치 근사", 4, 7, "#b28a6b", [
        s(48, -28, 16, 35),
        s(28, -45, 24, 14),
      ]),
      b("체육관", 2, 4, "#b39170", [
        s(29, 3, 25, 23, { roofColor: "#d3d3c6" }),
      ]),
      b("증축 실험실습동 · 위치 근사", 4, 2, "#c9c8b8", [
        s(-56, 29, 23, 26, { roofColor: "#bdc3b6" }),
      ]),
    ],
    links: [
      bridge(
        "서측 연결통로",
        { x: -41, z: -13.5 },
        { x: -41, z: -7 },
        10,
        2,
        3,
      ),
      bridge(
        "중앙 연결통로",
        { x: -11, z: -13.5 },
        { x: -11, z: -7 },
        10,
        2,
        3,
      ),
      bridge("중정 연결통로", { x: -32, z: -26 }, { x: -20, z: -26 }, 12, 1, 3),
    ],
    field: {
      ...s(-1, 34, 76, 27),
      height: 2,
      surface: "dirt",
      color: "#c4b695",
    },
    gate: {
      x: 49,
      z: 48,
      angle: 0,
      style: "piers",
      width: 9,
      color: "#a58062",
      sign: "울산과학고등학교",
      barrier: true,
    },
    parking: { x: 55, z: 24, angle: Math.PI / 2 },

    benches: [
      [-16, 16.5],
      [14, 16.5],
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
      [-52, -60],
      [0, -60],
      [54, -60],
    ],
    siteDetails: {
      paths: [
        {
          points: [
            [49, 52],
            [49, 11],
            [-39, 11],
            [-39, -48],
          ],
          width: 3,
          kind: "road",
        },
        {
          points: [
            [-39, 50.5],
            [37, 50.5],
          ],
          width: 1.8,
          kind: "walk",
        },
      ],
      retainingWalls: [
        { a: [-39, 17], b: [39, 17], height: 2 },
        { a: [-32, -39], b: [6, -39], height: 2 },
      ],
      fences: [
        {
          points: [
            [-40, 19.5],
            [-40, 48.5],
            [38, 48.5],
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
  layout.buildings[0].segments[1].facade = {
    ...layout.buildings[0].facade,
    style: "panel",
    color: "#b5c1c0",
    glazedBays: [{ u: 0, width: 7 }],
  };
  layout.buildings[0].facade.glazedBays = [
    { u: -20, width: 8 },
    { u: -7, width: 8 },
    { u: 7, width: 8 },
    { u: 20, width: 8 },
  ];
  layout.buildings[6].facade = {
    style: "panel",
    color: "#cacbbc",
    trim: "#e5e3d4",
    window: "#617779",
    bandColor: "#a8ac9f",
    glazedBays: [
      { u: -7, width: 4 },
      { u: 0, width: 4 },
      { u: 7, width: 4 },
    ],
  };
  finishLayout(layout, (x, z) => 2 + Math.max(0, -z) * 0.13);

  return layout;
}
