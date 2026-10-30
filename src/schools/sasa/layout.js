import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
import { addDetails } from "./details.js";

// Relative massing follows the published aerial rendering and completed facade.
// Orientation and dimensions are approximate; the neighbouring school is omitted.
export function createLayout() {
  const layout = {
    sources: {
      official: "https://sasa.sjeduhs.kr",
      map: "https://map.naver.com/p/search/세종과학예술영재학교",
      facilities: "https://www.namu.moe/w/세종과학예술영재학교/시설",
      diagram: "https://m.nocutnews.co.kr/news/amp/1198455",
      checked: "2026-10-30",
    },
    buildings: [
      b("S동 · 보통·전문교과", 5, 3, "#d6c6a2", [
        s(-12, -10, 48, 9),
        s(-40, -15, 8, 19),
        s(-12, -23, 9, 17),
      ]),
      b("A동 · 학생지원·예술", 5, 3, "#e3e4dd", [
        s(22, -10, 20, 12),
        s(29, -19, 10, 6),
        s(26, -28, 8, 12),
      ]),
      b("체육관 · 급식실", 3, 3, "#c8c8b9", [
        s(40, -30, 20, 15, { roof: "barrel", roofColor: "#b6c3c3" }),
      ]),
      b("기숙사동", 5, 3, "#cfb894", [s(4, -44, 42, 8), s(29, -43, 8, 10)]),
    ],
    links: [
      bridge("본관–기숙사 데크", { x: 27, z: -34 }, { x: 27, z: -38 }, 6, 2, 3),
    ],
    field: {
      ...s(-14, 29, 58, 26),
      height: 1.5,
      surface: "grass",
      color: "#729451",
    },
    gate: { x: 51, z: 44, angle: 0 },
    parking: { x: 41, z: 24, angle: Math.PI / 2 },
    benches: [
      [-34, 7],
      [-23, 7],
      [-12, 7],
      [0, 7],
      [28, 3],
    ],
    trees: [
      ...Array.from({ length: 16 }, (_, i) => [-61, -49 + i * 6.5]),
      ...Array.from({ length: 16 }, (_, i) => [-57 + i * 7.7, 52]),
      ...Array.from({ length: 13 }, (_, i) => [-48 + i * 8, -54]),
      ...Array.from({ length: 10 }, (_, i) => [62, -46 + i * 9]),
      [-35, 3],
      [-24, 3],
      [-13, 3],
      [-2, 3],
      [9, 3],
      [25, 10],
      [25, 21],
      [25, 32],
    ],
    maxTrees: 63,
    hills: [],
  };
  addDetails(layout);
  return finishLayout(
    layout,
    (x, z) => 1.5 + Math.max(0, -z - 37) * 0.2 + Math.max(0, x - 54) * 0.3,
  );
}
