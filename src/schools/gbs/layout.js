import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
import { addDetails } from "./details.js";

// X = east, -Z = north. The separate science education center to the north
// is deliberately outside this campus; its observatory is not a school dome.
export function createLayout() {
  const layout = {
    sources: {
      official: "https://gbs-h.goeujb.kr/gbs-h/main.do",
      map: "https://map.naver.com/p/search/경기북과학고등학교",
      plan: "https://gbs-h.goeujb.kr/gbs-h/cm/cntnts/cntntsView.do?cntntsId=928&mi=3858",
      checked: "2026-10-29",
    },
    buildings: [
      b("본관", 5, 3.2, "#d1d0c1", [
        s(1, -16, 51, 7, { angle: Math.PI / 2 }),
        s(-3.5, -40, 9, 5),
      ]),
      b("과학실험동", 4, 3.2, "#d6d9d1", [
        s(-25, -24, 26, 8.5),
        s(-30, -30, 12, 3.5),
      ]),
      b("일반강의동", 4, 3.2, "#d4d6cb", [
        s(-26, 2, 26, 8),
        s(-30, -3.5, 10, 3),
      ]),
      // The two courtyards face different directions in the satellite image.
      // Their floor counts are approximate exterior massing, not floor plans.
      b("기숙사 · 서관", 4, 2.5, "#d1d0bf", [
        s(-33.5, 33.5, 5, 24),
        s(-42, 24, 17, 5),
        s(-42.5, 43, 18, 5),
      ]),
      b("기숙사 · 동관", 4, 2.5, "#d5d2c2", [
        s(-10, 43, 22, 5),
        s(-19, 32, 4, 17),
        s(-1, 32, 4, 17),
      ]),
      b("복합동 · 체육관·식당", 3, 1.8, "#d0d4d0", [
        s(30, 32.5, 23, 17, { roof: "barrel", roofColor: "#c6d0cf" }),
        s(16, 33, 4.5, 20),
      ]),
    ],
    links: [
      bridge(
        "본관–과학실험동",
        { x: -12, z: -24 },
        { x: -2.5, z: -24 },
        6.2,
        3,
        3.2,
      ),
      bridge(
        "본관–일반강의동",
        { x: -13, z: 2 },
        { x: -2.5, z: 2 },
        6.2,
        3,
        3.2,
      ),
      bridge(
        "기숙사 앞 연결부",
        { x: -29, z: 22 },
        { x: -3, z: 22 },
        5.5,
        1,
        2.5,
      ),
      bridge("본관–기숙사", { x: 1, z: 9.5 }, { x: 1, z: 21 }, 6.2, 1, 3.4),
    ],
    field: {
      ...s(32, -10, 53, 29, { angle: Math.PI / 2 }),
      height: 1.5,
      surface: "dirt",
      color: "#bfb69a",
    },
    tennis: { ...s(-27, 15, 22, 9), height: 2.5 },
    courtKind: "basketball",
    gate: { x: 55, z: -44, angle: Math.PI / 2 },
    parking: { x: 30, z: 50, angle: 0 },
    benches: [
      [14, -29],
      [14, -19],
      [14, -9],
      [14, 1],
      [-23, 31],
      [-23, 39],
    ],
    trees: [
      ...Array.from({ length: 16 }, (_, i) => [
        -64 + 2 * Math.sin(i * 2),
        -52 + i * 6.8,
      ]),
      ...Array.from({ length: 13 }, (_, i) => [
        -70 + 2 * Math.sin(i),
        -49 + i * 8,
      ]),
      ...Array.from({ length: 9 }, (_, i) => [-55 + i * 11, -52]),
      ...Array.from({ length: 7 }, (_, i) => [51, -32 + i * 7]),
      ...Array.from({ length: 5 }, (_, i) => [-25, 25 + i * 4.3]),
      [-44, -15],
      [-38, -12],
      [-31, -12],
      [-24, -12],
      [-18, -11],
      [-43, 34],
      [-10, 32],
      [-50, 53],
      [-38, 53],
      [-22, 52],
      [64, 27],
      [64, 37],
      [64, 47],
      [62, -9],
      [63, 4],
    ],
    maxTrees: 72,
    hills: [],
  };
  addDetails(layout);
  return finishLayout(layout, (x, z) => {
    const westernWoodland = Math.max(0, -x - 48) * 0.34;
    const northernSlope = Math.max(0, -z - 45) * 0.2;
    return 1.5 + westernWoodland + northernSlope;
  });
}
