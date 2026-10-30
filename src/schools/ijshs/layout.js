import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";

// Official 2024 front panorama; hidden rear footprints and distances are approximate.
export function createLayout() {
  const layout = {
    sources: {
      official: "https://ijss.icehs.kr/main.do",
      photos: "https://ijss.icehs.kr/upload/sysImg/ijss/1710487956658.png",
      facilities: "https://ijss.icehs.kr/sub/info.do?m=0705&s=ijss",
      checked: "2026-10-30",
    },
    buildings: [
      b("본관", 5, 2.5, "#bb9278", [
        s(-38, -17, 25, 14, { roofColor: "#b8bdb2" }),
        s(-13, -17, 25, 18, {
          color: "#d8d7cb",
          roof: "gable",
          roofColor: "#bfc6bf",
        }),
        s(20.5, -17, 42, 14, { roofColor: "#b8bdb2" }),
        s(47.5, -17, 12, 14, { color: "#d8d7cb", roofColor: "#aebebd" }),
      ]),
      b("누리마루 · 체육관·식당", 3, 2.5, "#b9846d", [
        s(-51, 7, 25, 25, { roof: "barrel", roofColor: "#9cabb6" }),
      ]),
      b("형설관 · 기숙사", 6, 2.5, "#c6b5a1", [
        s(-53, -42, 25, 12, { roofColor: "#a7b4b0" }),
        s(-53, -31, 11, 10, { roofColor: "#a7b4b0" }),
      ]),
    ],
    links: [
      bridge(
        "형설관 3·4층 연결통로",
        { x: -44, z: -36 },
        { x: -44, z: -24 },
        8.5,
        2,
        3,
      ),
      bridge(
        "누리마루 연결통로",
        { x: -44, z: -10 },
        { x: -44, z: -5.5 },
        5.5,
        1,
        4,
      ),
    ],
    field: {
      ...s(9, 26, 74, 34),
      height: 1.5,
      surface: "dirt",
      color: "#c4ad83",
    },
    gate: {
      x: -62,
      z: 49,
      angle: 0,
      style: "piers",
      width: 8,
      sign: "인천진산과학고등학교",
    },
    parking: { x: 62, z: -24, angle: Math.PI / 2 },
    benches: [
      [-22, 3],
      [-5, 3],
      [15, 3],
      [35, 3],
      [-45, 35],
    ],
    trees: [
      ...Array.from({ length: 16 }, (_, i) => [-67 + i * 8.5, -54]),
      ...Array.from({ length: 12 }, (_, i) => [-48 + i * 10, 52]),
      ...Array.from({ length: 9 }, (_, i) => [69, -43 + i * 10]),
      [-69, -29],
      [-69, -13],
      [-69, 4],
      [-69, 22],
      [-32, 13],
      [-32, 26],
      [-33, 39],
      [-49, 27],
      [-50, 42],
      [-24, -41],
      [-9, -42],
      [7, -42],
      [25, -42],
      [43, -42],
    ],
    maxTrees: 51,
    hills: [],
    siteDetails: {
      paths: [
        {
          points: [
            [-62, 53],
            [-62, 31],
            [-36, 31],
            [-36, -1],
            [59, -1],
            [62, -45],
          ],
          width: 4,
          kind: "road",
        },
        {
          points: [
            [-26, 47],
            [50, 47],
            [50, 5],
            [-28, 5],
          ],
          width: 2,
          kind: "walk",
        },
      ],
      retainingWalls: [{ a: [-29, 6], b: [49, 6], height: 1 }],
      fences: [
        {
          points: [
            [-30, 7],
            [-30, 45],
            [48, 45],
            [48, 7],
          ],
          height: 2,
          color: "#668d78",
        },
      ],
    },
  };
  for (const building of layout.buildings) {
    building.facade = {
      style: "brick",
      color: building.color,
      trim: "#d9dcd3",
      window: "#577781",
      bandColor: "#d8dacf",
    };
    for (const segment of building.segments) {
      if (segment.color)
        segment.facade = {
          ...building.facade,
          style: "stone",
          color: segment.color,
        };
      if (segment.roof === "flat") segment.roofDetails = { parapet: true };
    }
  }
  for (const index of [0, 2]) {
    layout.buildings[0].segments[index].roofDetails.canopy = {
      u: 0,
      v: 0,
      w: index === 0 ? 19 : 25,
      d: 8,
      height: 1.5,
      color: "#436f91",
    };
  }
  return finishLayout(layout);
}
