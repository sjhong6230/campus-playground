import { segment as s, building as b, finishLayout } from "../shared/layout.js";
// The official 2025 facilities diagram is schematic, not a measured site plan.
export function createLayout() {
  const layout = {
    sources: {
      official: "https://hwasung-h.goehs.kr/hwasung-h/main.do",
      diagram:
        "https://hwasung-h.goehs.kr/hwasung-h/cm/cntnts/cntntsView.do?cntntsId=505&mi=4191",
      photos: "https://edu.chosun.com/m/edu_article.html?contid=2024101180035",
      checked: "2026-10-30",
    },
    buildings: [
      b("본관 동관", 5, 2.5, "#d6d7c9", [
        s(12, -8, 57, 13, { roofColor: "#9baea5" }),
      ]),
      b("본관 서관 · 공용", 5, 2.5, "#c7c6b5", [
        s(-43, -8, 43, 13, { roofColor: "#a5b3a6" }),
      ]),
      b("별관 서관", 3, 2.5, "#c1a28a", [s(-42, -31, 25, 14)]),
      b("별관 동관", 3, 2.5, "#d3d4c7", [s(41, -29, 20, 17)]),
      b("백련관 A·B", 4, 2.5, "#cbb49d", [s(-12, -47, 39, 11)]),
      b("백련관 C", 5, 2.5, "#c4b099", [s(19, -47, 19, 11)]),
      b("도서관", 5, 2.5, "#d7d6c5", [s(43, -47, 21, 11)]),
      b("호연관", 5, 2.5, "#c7ac95", [
        s(52, 19, 18, 23, { roofColor: "#9eaea3" }),
      ]),
      b("LIBERTAS 체육관", 2, 2.5, "#d2d4c7", [
        s(0, 13, 21, 13, { roofColor: "#a8bbb2" }),
      ]),
      b("다목적실 · 공용", 4, 2.5, "#c6cbbf", [
        s(-51, 16, 23, 18, { roofColor: "#9eb7b2" }),
      ]),
    ],
    links: [],
    field: {
      ...s(-10, 40, 65, 22),
      height: 1.5,
      surface: "dirt",
      color: "#c7bd9c",
    },
    gate: {
      x: 29,
      z: 51,
      angle: 0,
      style: "piers",
      width: 9,
      sign: "화성고등학교",
    },
    parking: { x: 65, z: -18, angle: Math.PI / 2 },
    benches: [
      [-18, 22],
      [19, 17],
      [-20, -27],
      [3, -28],
    ],
    trees: [
      ...Array.from({ length: 16 }, (_, i) => [-71, -50 + i * 6.6]),
      ...Array.from({ length: 18 }, (_, i) => [-65 + i * 7.7, -56]),
      ...Array.from({ length: 12 }, (_, i) => [-64 + i * 8, 56]),
      [-21, -31],
      [-7, -31],
      [6, -31],
      [65, 1],
      [67, 37],
      [52, 45],
    ],
    maxTrees: 52,
    hills: [],
    siteDetails: {
      paths: [
        {
          points: [
            [29, 55],
            [30, 34],
            [30, 9],
            [28, 2],
          ],
          width: 4,
          kind: "road",
        },
        {
          points: [
            [-65, 28],
            [-65, -28],
          ],
          width: 3,
          kind: "walk",
        },
        {
          points: [
            [-25, -26],
            [27, -26],
          ],
          width: 2,
          kind: "walk",
        },
      ],
      retainingWalls: [{ a: [-39, 26], b: [24, 26], height: 1 }],
      fences: [
        {
          points: [
            [-44, 29],
            [-44, 52],
            [24, 52],
          ],
          height: 1.4,
        },
      ],
    },
  };
  for (const building of layout.buildings) {
    building.facade = {
      style: "panel",
      color: building.color,
      trim: "#e1e1d4",
      window: "#467780",
      bandColor: "#b9b8a3",
    };
    for (const segment of building.segments)
      segment.roofDetails = { parapet: true };
  }
  layout.buildings[0].facade.glazedBays = [
    { u: -14, width: 9 },
    { u: 6, width: 10 },
  ];
  layout.buildings[1].facade.glazedBays = [{ u: 12, width: 8 }];
  layout.buildings[3].facade.glazedBays = [{ u: 0, width: 12 }];
  return finishLayout(layout);
}
