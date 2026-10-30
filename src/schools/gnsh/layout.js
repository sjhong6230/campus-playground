import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
import { addDetails } from "./details.js";

// School-published April 2025 aerials. Curves use short straight wings.
// Photo orientation and game dimensions are approximate; see docs/sources/gnsh.txt.
export function createLayout() {
  const layout = {
    sources: {
      official: "https://gshs-h.gne.go.kr/gshs-h/main.do",
      photos:
        "https://gshs-h.gne.go.kr/gshs-h/na/ntt/selectNttInfo.do?mi=269757&nttSn=90127373",
      map: "https://map.naver.com/p/search/경남과학고등학교",
      checked: "2026-10-30",
    },
    buildings: [
      b("본관 · 교사동", 4, 3, "#b27963", [
        s(-48, -14, 23, 13, { angle: 0.18, roofColor: "#b9c8cc" }),
        s(-25, -14, 24, 13, { angle: -0.18, roofColor: "#b9c8cc" }),
        s(-8, -18, 12, 13, { angle: -0.28, roofColor: "#b9c8cc" }),
      ]),
      b("원형 출입부 · 근사", 4, 3, "#d5d8d0", [
        s(2, -17, 16, 16, {
          angle: Math.PI / 4,
          roofColor: "#637f8b",
          openGroundFloor: true,
        }),
      ]),
      b("과학동 · 천문대", 4, 3, "#bb8875", [
        s(-23, -35, 43, 12, { roofColor: "#c7d1ce" }),
        s(-45, -31, 12, 13, { floors: 2, roofColor: "#8aa995" }),
      ]),
      b("후면 교사동", 4, 3, "#af725e", [
        s(17, -42, 35, 12, { angle: -0.12, roofColor: "#9ca8a3" }),
      ]),
      b("체육관", 2, 3, "#c28c79", [
        s(39, -15, 27, 18, { roof: "barrel", roofColor: "#43a6c6" }),
      ]),
      b("운동장 옆 교사동", 4, 1.5, "#c6beb9", [
        s(62, 14, 15, 27, { roofColor: "#b9c6c5" }),
      ]),
    ],
    links: [
      bridge(
        "교사동 연결통로",
        { x: -25, z: -29 },
        { x: -25, z: -21 },
        6,
        2,
        3,
      ),
    ],
    observatory: {
      x: -34,
      z: -35,
      y: 15.25,
      building: 2,
      radius: 2.6,
      color: "#d4dcda",
    },
    field: {
      ...s(14, 26, 66, 38),
      height: 1.5,
      surface: "dirt",
      color: "#bcb994",
    },
    tennis: { ...s(62, 41, 15, 18), height: 1.5 },
    courtKind: "basketball",
    gate: { x: -42, z: 49, angle: 0 },
    parking: { x: -61, z: -36, angle: Math.PI / 2 },
    benches: [
      [-38, 7],
      [-48, 7],
      [-30, 18],
      [23, -28],
    ],
    trees: [
      ...Array.from({ length: 16 }, (_, i) => [-69, -51 + i * 6.7]),
      ...Array.from({ length: 13 }, (_, i) => [-65 + i * 8, -55]),
      ...Array.from({ length: 11 }, (_, i) => [-30 + i * 7.5, 53]),
      [-54, 3],
      [-44, 1],
      [-32, 1],
      [-56, 17],
      [-52, 29],
      [-33, 34],
      [16, -29],
      [24, -28],
      [35, -29],
      [70, -23],
      [70, -9],
    ],
    maxTrees: 51,
    hills: [],
  };
  addDetails(layout);
  return finishLayout(layout, (x, z) => (z < 3 ? 3 : 1.5));
}
