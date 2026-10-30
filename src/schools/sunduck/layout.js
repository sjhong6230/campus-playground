import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
import { addDetails } from "./details.js";
// Photo-based massing, not a surveyed plan. See docs/sources/sunduck.txt.
export function createLayout() {
  const layout = {
    sources: {
      official: "https://sunduck.sen.hs.kr/",
      map: "https://map.naver.com/p/search/선덕고등학교",
      photos: "https://www.localnaeil.com/News/View/653413",
      checked: "2026-10-30",
    },
    buildings: [
      b("본관", 5, 4.5, "#aa845b", [s(-2, -13, 84, 12)]),
      b("서측 별관", 3, 4.5, "#b39c6a", [s(-55, -19, 20, 22)]),
      b("후면 교사동", 4, 4.5, "#a28865", [s(-2, -39, 64, 10)]),
    ],
    links: [
      bridge(
        "별관 연결통로",
        { x: -45, z: -17 },
        { x: -44, z: -17 },
        7.5,
        1,
        3,
      ),
    ],
    field: {
      ...s(-4, 25, 79, 32),
      height: 1.5,
      surface: "grass",
      color: "#81a15f",
    },

    gate: { x: 52, z: 45, angle: 0 },
    parking: { x: -3, z: 0, angle: 0 },
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
  return finishLayout(layout, (x, z) => 1.5 + Math.max(0, 7 - z) * 0.13);
}
