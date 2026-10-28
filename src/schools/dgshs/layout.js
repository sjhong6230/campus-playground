import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
export function createLayout() {
  return finishLayout(
    {
      sources: {
        map: "https://map.naver.com/p/search/대구과학고등학교",
        official:
          "https://dshs.dge.hs.kr/dshsh/cm/cntnts/cntntsView.do?cntntsId=10018442&mi=10018442",
        facilities: "https://www.namu.moe/w/대구과학고등학교",
        checked: "2026-10-28",
      },
      buildings: [
        b("본관", 7, 4.5, "#bb8972", [
          s(-23, -28, 14, 40, { roofColor: "#657b87" }),
          s(-23, -50, 18, 4, { floors: 3, roofColor: "#d2d3c5" }),
        ]),
        b("궁리관", 5, 4.5, "#d4c6ad", [
          s(-11, 2, 36, 11, {
            roof: "gable",
            roofColor: "#68869c",
            observatory: true,
          }),
          s(-27, 10, 5, 5, { floors: 4 }),
        ]),
        b("거경관", 3, 1.5, "#bba58a", [s(-29, 33, 10, 29)]),
        b("입지관 · 기숙사", 5, 4.5, "#c4ae97", [
          s(5, 37, 12, 29, { roofColor: "#a1b7a3" }),
          s(5, 17, 14, 11, { roofColor: "#a1b7a3" }),
        ]),
        b("식당", 1, 1.5, "#ddd6c6", [
          s(-9, 36, 8, 27, { roofColor: "#d0d2c9" }),
        ]),
      ],
      links: [
        bridge("본관–궁리관", { x: -21, z: -8 }, { x: -21, z: -3.5 }, 7.5),
        bridge("궁리관–거경관", { x: -27, z: 12.5 }, { x: -27, z: 18.5 }, 7.5),
        bridge("궁리관–입지관", { x: 2, z: 7.5 }, { x: 2, z: 11.5 }, 7.5),
      ],
      field: s(5, -29, 34, 26, { angle: Math.PI / 2, height: 4.5 }),
      tennis: s(22, 9, 21, 9, { angle: Math.PI / 2 }),
      courtKind: "basketball",
      gate: { x: 24, z: -50, angle: 0 },
      parking: { x: -37, z: -29, angle: Math.PI / 2 },
      benches: [
        [-8, -7],
        [24, -7],
        [18, 31],
        [-18, 15],
      ],
      hills: [],
      trees: [
        ...Array.from({ length: 20 }, (_, i) => [-42, -52 + i * 5.2]),
        ...Array.from({ length: 18 }, (_, i) => [
          32 + (i % 3) * 2,
          -43 + i * 5.3,
        ]),
        ...Array.from({ length: 12 }, (_, i) => [-35 + i * 5.5, 55]),
        ...Array.from({ length: 10 }, (_, i) => [-13 + i * 4, -51]),
        [-18, 17],
        [-16, 45],
        [22, 38],
        [26, 27],
        [24, -8],
        [-13, -7],
      ],
      maxTrees: 66,
    },
    (x, z) =>
      1.5 +
      3 * Math.max(0, Math.min(1, (x + 34) / 23)) +
      Math.max(0, x - 33) * 0.17,
  );
}
