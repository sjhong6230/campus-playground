import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
export function createLayout() {
  const layout = {
    homeDistance: 340,
    sources: {
      official: "https://school.busanedu.net/haeundae-h/main.do",
      reference:
        "https://school.busanedu.net/images/web/schl/haeundae-h/widg/visual/main/mainVisualDetailFlpth2/img_ae1e3d93-c43e-45a4-8031-8633c42281721733978376932.jpg",
      checked: "2026-10-30",
    },
    buildings: [
      b("본관 · 대동관", 7, 6, "#a85e51", [
        s(-45, -27, 25, 36, { roofColor: "#7b927b" }),
      ]),
      b("도서관", 3, 14, "#b5b5a2", [s(-13, -47, 22, 15)]),
      b("기숙사", 4, 2, "#d6bdb2", [
        s(14, -3, 84, 14, { roofColor: "#c7c4b8" }),
      ]),
      b("동해회관 · 식당·체육관", 2, 8, "#a67664", [
        s(14, -27, 68, 20, { roof: "gable", roofColor: "#93adad" }),
      ]),
    ],
    links: [
      bridge(
        "기숙사·식당 구름다리",
        { x: -14, z: -10 },
        { x: -14, z: -17 },
        8,
        1,
        3,
      ),
    ],
    field: {
      ...s(12, 29, 85, 34),
      height: 2,
      surface: "turf",
      color: "#688d65",
    },
    gate: {
      x: -63,
      z: 46,
      angle: 0,
      style: "piers",
      width: 9,
      color: "#936a61",
      sign: "해운대고등학교",
      barrier: true,
    },
    parking: { x: -64, z: -17, angle: Math.PI / 2 },
    tennis: { ...s(-49, 32, 20, 19), height: 2 },
    courtKind: "basketball",
    benches: [
      [-3, 8],
      [27, 8],
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
      [-35, -60],
      [20, -60],
      [69, -20],
    ],
    siteDetails: {
      paths: [
        {
          points: [
            [-63, 51],
            [-63, 5],
            [-27, 5],
            [-27, -16],
            [-27, -48],
            [55, -48],
          ],
          width: 3,
          kind: "road",
        },
        {
          points: [
            [-30.5, 49],
            [54.5, 49],
          ],
          width: 1.8,
          kind: "walk",
        },
      ],
      retainingWalls: [
        { a: [-56, -8], b: [-32, -8], height: 4 },
        { a: [-24, -14], b: [50, -14], height: 5 },
      ],
      fences: [
        {
          points: [
            [-31.5, 11],
            [-31.5, 47],
            [55.5, 47],
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
  layout.buildings[0].facade.style = "brick";
  layout.buildings[3].facade.style = "brick";
  layout.buildings[2].facade.bandColor = "#b99590";
  finishLayout(layout, (x, z) => 2 + Math.max(0, -z) * 0.2);

  return layout;
}
