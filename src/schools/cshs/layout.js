import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
import { addDetails } from "./details.js";
// Photo-based massing, not a surveyed plan. See docs/sources/cshs.txt.
export function createLayout() {
  const layout = {
    sources: {
      official: "https://csh-h.gne.go.kr/csh-h/main.do",
      map: "https://map.naver.com/p/search/창원과학고등학교",
      photos: "https://www.yna.co.kr/view/AKR20130205061300052",
      checked: "2026-10-30",
    },
    buildings: [
      b("교사동", 4, 2.5, "#b5bec2", [s(0, -16, 64, 13)]),
      b("관측실동", 5, 2.5, "#a9b6bd", [s(-52, -20, 20, 25)]),
      b("체육관", 3, 2.5, "#c7cecb", [
        s(50, -14, 25, 26, { roof: "barrel", roofColor: "#9fb4b7" }),
      ]),
      b("생활관 · 근사", 5, 5.5, "#c0bdb0", [s(0, -44, 62, 10)]),
    ],
    links: [
      bridge(
        "서측 연결통로",
        { x: -42, z: -16 },
        { x: -32, z: -16 },
        5.5,
        2,
        4,
      ),
      bridge(
        "동측 연결통로",
        { x: 32, z: -16 },
        { x: 37.5, z: -16 },
        5.5,
        2,
        4,
      ),
    ],
    field: {
      ...s(0, 22, 76, 30),
      height: 1.5,
      surface: "dirt",
      color: "#b7ad8a",
    },
    observatory: {
      x: -52,
      z: -20,
      y: 17.75,
      building: 1,
      radius: 3.1,
      color: "#d3dde0",
    },
    tennis: { ...s(-57, 23, 18, 24), height: 1.5 },
    courtKind: "basketball",
    gate: { x: 52, z: 46, angle: 0 },
    parking: { x: 56, z: 22, angle: 0 },
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
  return finishLayout(layout, (x, z) => 1.5 + Math.max(0, -z - 27) * 0.18);
}
