import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
export function createLayout() {
  const layout = {
    homeDistance: 360,
    sources: {
      official: "https://www.hana.hs.kr/",
      diagram: "https://www.hana.hs.kr/introduce/facility.do?tab=2",
      aerial: "https://eng.hana.hs.kr/assets/images/school_16.jpg",
      checked: "2026-10-30",
    },
    buildings: [
      b("누리동 · 본관", 7, 3, "#657779", [
        s(24, 3, 20, 18, { openGroundFloor: true, roofColor: "#7e8c8b" }),
        s(24, -19.5, 12, 27, { floors: 5, roofColor: "#8c9995" }),
        s(47, 0, 26, 12, { floors: 3, color: "#b9c9c6" }),
      ]),
      b("가온동 A", 3, 8, "#ced1c6", [s(-22, -24, 36, 14)]),
      b("가온동 B", 4, 4, "#d8d9cd", [
        s(-22, 0, 36, 14, { openGroundFloor: true }),
      ]),
      b("미르동 · 체육관", 2, 2.5, "#c8cbc1", [s(-57, 30, 23, 26)]),
      b("어울림관 · 식당", 2, 8, "#c4cec3", [s(11, -23, 14, 18)]),
      b("해오름동 · 생활관", 8, 10, "#c9d2c5", [
        s(-37, -45, 18, 13),
        s(-16, -45, 18, 13),
        s(5, -45, 18, 13),
      ]),
      b("하나아트센터", 2, 2.5, "#c6c7ba", [
        s(58, 23, 24, 22, { roofColor: "#a7b3aa" }),
        s(65, 7, 10, 10, { floors: 3 }),
      ]),
    ],
    links: [
      bridge("가온동 B 연결통로", { x: -4, z: 0 }, { x: 14, z: 0 }, 7, 2, 3),
      bridge(
        "가온동 A·식당 연결통로",
        { x: -4, z: -23 },
        { x: 4, z: -23 },
        11,
        1,
        3,
      ),
      bridge(
        "생활관 연결통로",
        { x: -22, z: -38.5 },
        { x: -22, z: -31 },
        14,
        1,
        3,
      ),
    ],
    field: {
      ...s(-15, 28, 48, 27),
      height: 2.5,
      surface: "turf",
      color: "#67946d",
    },
    gate: {
      x: 27,
      z: 47,
      angle: 0,
      style: "piers",
      width: 9,
      color: "#97654c",
      sign: "하나고등학교",
    },
    parking: { x: 60, z: -33, angle: Math.PI / 2 },
    benches: [
      [7, 17],
      [17, 30],
      [-43, 8],
    ],
    trees: [
      ...Array.from({ length: 16 }, (_, i) => [-67 + i * 8.5, -55]),
      ...Array.from({ length: 8 }, (_, i) => [-70, -45 + i * 10]),
      ...Array.from({ length: 12 }, (_, i) => [-67 + i * 8, 54]),
      [17, 18],
      [20, 34],
      [39, 38],
      [44, -42],
      [45, -25],
      [43, -12],
    ],
    maxTrees: 42,
    hills: [
      [-49, -59],
      [4, -59],
      [57, -57],
    ],
    siteDetails: {
      paths: [
        {
          points: [
            [-68, 49],
            [68, 49],
          ],
          width: 4,
          kind: "road",
        },
        {
          points: [
            [27, 49],
            [27, 23],
            [40, 15],
          ],
          width: 3,
          kind: "walk",
        },
        {
          points: [
            [-44, 10],
            [10, 10],
            [10, -12],
          ],
          width: 2,
          kind: "walk",
        },
      ],
      retainingWalls: [
        { a: [-42, -15], b: [-3, -15], height: 3 },
        { a: [-48, -36], b: [15, -36], height: 2 },
      ],
      fences: [
        {
          points: [
            [-40, 13],
            [-40, 43],
            [10, 43],
            [10, 13],
          ],
          height: 2,
        },
      ],
    },
  };
  layout.buildings.forEach((building, index) => {
    building.facade = {
      style: index === 0 ? "panel" : "stone",
      color: building.color,
      trim: "#dfe4d9",
      window: "#477b7d",
      bandColor: "#aebfb9",
    };
    building.segments.forEach((segment) => {
      segment.roofDetails = { parapet: true };
      if (segment.color)
        segment.facade = { ...building.facade, color: segment.color };
    });
  });
  for (const index of [1, 2])
    layout.buildings[index].segments[0].facade = {
      ...layout.buildings[index].facade,
      glazedBays: [
        { u: -10, width: 7 },
        { u: 0, width: 7 },
        { u: 10, width: 7 },
      ],
    };
  for (const segment of layout.buildings[5].segments.slice(0, 2))
    segment.roofDetails.canopy = {
      u: 0,
      v: 0,
      w: 15,
      d: 8,
      height: 1.4,
      color: "#4f7395",
    };
  return finishLayout(layout, (x, z) => 2.5 + Math.max(0, -z) * 0.16);
}
