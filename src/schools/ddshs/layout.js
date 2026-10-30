import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
import { addDetails } from "./details.js";
// Photo-based massing, not a surveyed plan. See docs/sources/ddshs.txt.
export function createLayout() {
  const layout = {
    sources: {
      official: "https://ddsciencehs.djsch.kr/main.do?s=ddsciencehs",
      map: "https://map.naver.com/p/search/대전동신과학고등학교",
      photos: "https://m.joongdo.co.kr/view.php?key=20251125010009171",
      checked: "2026-10-30",
    },
    buildings: [
      b("교사동", 4, 2.5, "#b7d0c6", [s(-17, -30, 75, 10)]),
      b("동측 교사동", 4, 2.5, "#adb6b7", [
        s(27, -17, 12, 36, { roofColor: "#8cac9f" }),
      ]),
      b("동측 별관", 5, 2.5, "#c6a18e", [s(50, -8, 25, 30)]),
    ],
    links: [],
    field: {
      ...s(-17, 17, 68, 39),
      height: 1.5,
      surface: "grass",
      color: "#739461",
    },
    observatory: {
      x: 14,
      z: -30,
      y: 14.75,
      building: 0,
      radius: 1.3,
      color: "#dce1df",
    },
    gate: { x: 54, z: 44, angle: 0 },
    parking: { x: 49, z: 25, angle: 0 },
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
  return finishLayout(layout, (x, z) => 1.5 + Math.max(0, -z - 40) * 0.3);
}
