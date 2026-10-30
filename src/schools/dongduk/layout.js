import { segment as s, building as b, finishLayout } from "../shared/layout.js";
const tiled = (x, z, w, d) =>
  s(x, z, w, d, { roof: "gable", roofColor: "#b57060" });
export function createLayout() {
  const layout = {
    sources: {
      official: "https://dongduk.sen.hs.kr/",
      facilities: "https://dongduk.sen.hs.kr/40555/subMenu.do",
      panorama:
        "https://dongduk.sen.hs.kr/dggb/module/image/selectDesignImageView.do?sitemapId=383486&usrimgId=77770",
      annex:
        "https://dongduk.sen.hs.kr/dggb/module/image/selectDesignImageView.do?sitemapId=383486&usrimgId=77774",
      checked: "2026-10-30",
    },
    buildings: [
      b("동덕여고 본관", 5, 6, "#a9705d", [
        tiled(-29, -19, 12, 18),
        tiled(11, -19, 68, 14),
        tiled(53, -19, 16, 18),
      ]),
      b("동덕여중 교사동 · 공용 부지", 4, 6, "#ae7560", [
        tiled(-52, -5, 16, 46),
        tiled(-39.5, -19, 9, 14),
      ]),
      b("후면 강당 · 위치 근사", 2, 15, "#a47b66", [
        s(1, -45, 34, 16, { roof: "barrel", roofColor: "#a48772" }),
      ]),
      b("도서관 별관 · 위치 근사", 2, 13, "#b1755a", [tiled(48, -45, 24, 12)]),
    ],
    links: [],
    field: {
      ...s(8, 25, 83, 33),
      height: 2.5,
      surface: "dirt",
      color: "#c2b495",
    },
    gate: {
      x: -61,
      z: 47,
      angle: 0,
      style: "portal",
      width: 9,
      height: 4,
      color: "#b38a77",
      sign: "동덕여자중고등학교",
    },
    parking: { x: 62, z: 22, angle: Math.PI / 2 },
    benches: [
      [-18, 4],
      [-4, 4],
      [31, 4],
      [43, 4],
    ],
    trees: [
      ...Array.from({ length: 17 }, (_, i) => [-67 + i * 8.5, -55]),
      ...Array.from({ length: 9 }, (_, i) => [-69, -45 + i * 10]),
      ...Array.from({ length: 11 }, (_, i) => [-39 + i * 9, 52]),
      [-43, 29],
      [-43, 41],
      [69, -18],
      [69, -2],
      [69, 17],
      [69, 39],
      [-26, -42],
      [25, -42],
    ],
    maxTrees: 45,
    hills: [
      [-44, -59],
      [4, -59],
      [52, -59],
    ],
    siteDetails: {
      paths: [
        {
          points: [
            [-61, 52],
            [-61, 30],
            [-39, 30],
            [-39, 1],
            [56, 1],
            [61, 16],
            [61, 46],
          ],
          width: 3,
          kind: "road",
        },
        {
          points: [
            [-35, 46],
            [54, 46],
          ],
          width: 2,
          kind: "walk",
        },
      ],
      retainingWalls: [
        { a: [-34, 6], b: [10, 6], height: 3.5 },
        { a: [22, 6], b: [54, 6], height: 3.5 },
      ],
      fences: [
        {
          points: [
            [-35, 7],
            [-35, 43],
            [51, 43],
          ],
          height: 1.6,
        },
      ],
      stairs: [
        {
          x: 16,
          z: -0.75,
          angle: 0,
          width: 10,
          depth: 18.5,
          count: 10,
          upperY: 6,
          lowerY: 2.5,
          color: "#c6bdb0",
        },
      ],
    },
  };
  for (const building of layout.buildings) {
    building.facade = {
      style: "brick",
      color: building.color,
      trim: "#c9bca6",
      window: "#4e6268",
      bandColor: "#a97962",
    };
  }
  finishLayout(layout, (x, z) => 2.5 + Math.max(0, -z) * 0.24);
  const elevationAt = layout.elevationAt;
  layout.elevationAt = (x, z) =>
    Math.abs(x - 16) < 5 && Math.abs(z + 0.75) < 9.25 ? 2.5 : elevationAt(x, z);
  return layout;
}
