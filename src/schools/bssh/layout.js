import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
import { addDetails } from "./details.js";
// Photo-based massing, not a surveyed plan. See docs/sources/bssh.txt.
export function createLayout() {
  const layout = {
    sources: {
      official: "https://school.busanedu.net/bss-h/main.do",
      map: "https://map.naver.com/p/search/부산과학고등학교",
      photos: "https://news.nate.com/view/20240819n30590",
      checked: "2026-10-30",
      diagram:
        "https://school.busanedu.net/bss-h/cm/cntnts/cntntsView.do?cntntsId=14143&mi=652748",
    },
    buildings: [
      b("E동 · 중앙현관", 4, 3.5, "#ad6954", [s(-3, 16, 114, 8)]),
      b("A동 · 과학실", 4, 3.5, "#ad6954", [s(-52, -4, 12, 32)]),
      b("B동 · 교실", 4, 3.5, "#b6755b", [s(-20, -4, 12, 32)]),
      b("C동 · 교실", 4, 3.5, "#b6755b", [s(12, -4, 12, 32)]),
      b("D동 · 체육관", 4, 3.5, "#d9d9d1", [s(44, -4, 20, 32)]),
      b("후면 별동", 4, 4.5, "#b47a61", [s(-20, -49, 82, 9)]),
    ],
    links: [],
    field: {
      ...s(-20, -32, 78, 16),
      height: 4.5,
      surface: "grass",
      color: "#8b9a67",
    },

    gate: { x: 54, z: 46, angle: 0 },
    parking: { x: -49, z: 36, angle: 0 },
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
  return finishLayout(layout, (x, z) => 1.5 + Math.max(0, 25 - z) * 0.045);
}
