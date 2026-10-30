import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
import { addDetails } from "./details.js";
// Photo-based massing, not a surveyed plan. See docs/sources/hafs.txt.
export function createLayout() {
  const layout = {
    sources: {
      official: "https://www.hafs.hs.kr/",
      map: "https://map.naver.com/p/search/용인한국외국어대학교부설고등학교",
      photos: "https://v.daum.net/v/20240429170640655",
      checked: "2026-10-30",
    },
    buildings: [
      b("전면 교사동", 5, 2.5, "#c3b49a", [
        s(8, -12, 66, 12),
        s(34, -26, 9, 16),
      ]),
      b("후면 교사동", 5, 2.5, "#c9c2ae", [
        s(-2, -36, 62, 10),
        s(-34, -24, 12, 36),
      ]),
      b("체육관", 2, 2.5, "#ad9270", [
        s(-54, -23, 24, 25, { roof: "barrel", roofColor: "#e1e4de" }),
      ]),
      b("원형 전면부", 2, 2.5, "#b5a285", [
        s(-17, 9, 15, 15, { roofColor: "#9caa79" }),
        ...Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return s(-17 + Math.cos(a) * 9, 9 + Math.sin(a) * 9, 7.6, 4, {
            angle: -a - Math.PI / 2,
            roofColor: "#9caa79",
          });
        }),
      ]),
    ],
    links: [
      bridge("전면 연결부", { x: -17, z: -6 }, { x: -17, z: -2 }, 2.5, 2, 5),
    ],
    field: {
      ...s(50, 22, 26, 43),
      height: 1.5,
      surface: "dirt",
      color: "#bcae89",
    },
    tennis: { ...s(-52, 25, 22, 32), height: 1.5 },
    courtKind: "basketball",
    gate: { x: 20, z: 46, angle: 0 },
    parking: { x: 19, z: 31, angle: 0 },
    benches: [
      [0, 48],
      [12, 48],
      [-12, 48],
    ],
    trees: [
      ...Array.from({ length: 17 }, (_, i) => [-70, -52 + i * 6.4]),
      ...Array.from({ length: 18 }, (_, i) => [-65 + i * 7.4, -56]),
      ...Array.from({ length: 17 }, (_, i) => [-64 + i * 8, 55]),
    ],
    maxTrees: 52,
    hills: [],
  };
  addDetails(layout);
  return finishLayout(layout, (x, z) => 1.5 + Math.max(0, -z - 20) * 0.1);
}
