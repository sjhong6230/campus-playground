import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
import { addDetails } from "./details.js";

// Official e-campus aerial: central garden, west sports halls, east observatory.
// Dimensions and orientation are game-space estimates; see docs/sources/gssh.txt.
export function createLayout() {
  const layout = {
    sources: {
      official: "https://school.gyo6.net/gsshs/main.do",
      facilities:
        "https://school.gyo6.net/gsshs/cm/cntnts/cntntsView.do?cntntsId=130295&mi=130295",
      photos:
        "https://school.gyo6.net/gsshs/na/ntt/selectNttList.do?bbsId=29443&mi=130314",
      aerial:
        "https://school.gyo6.net/upload/old/school/upload/board/r100400483/29443/2023/04/board1682065535975.png",
      map: "https://map.naver.com/p/search/경산과학고등학교",
      checked: "2026-10-30",
    },
    buildings: [
      b("후면 교사동", 3, 2.5, "#bd947a", [
        s(-5, -40, 72, 11, { roofColor: "#62a69b" }),
      ]),
      b("본관동", 5, 2.5, "#ad8874", [
        s(39, -35, 16, 19, { roofColor: "#80b2a6" }),
      ]),
      b("자연과학동 · 천문대", 3, 2.5, "#b67e68", [
        s(51, 6, 17, 50, { roofColor: "#8bb5bf" }),
        s(48, -24, 23, 10, { roofColor: "#9cbec5" }),
      ]),
      b("강당 · 체육관", 3, 2.5, "#bd9478", [
        s(-23, 18, 29, 22, { floors: 2, roof: "gable", roofColor: "#528a77" }),
        s(-23, -13, 30, 23, { roof: "barrel", roofColor: "#acc3c6" }),
        s(-12, 3, 8, 9, { floors: 2, roofColor: "#a3bbc0" }),
      ]),
    ],
    links: [
      bridge(
        "본관–과학동 연결통로",
        { x: 47, z: -35 },
        { x: 51, z: -29 },
        5.5,
        1,
        3,
      ),
    ],
    observatory: {
      x: 51,
      z: 19,
      y: 11.75,
      building: 2,
      radius: 3.2,
      color: "#b4ccd5",
    },
    field: {
      ...s(-56, -16, 26, 43),
      height: 1.5,
      surface: "dirt",
      color: "#c6b99c",
    },
    gate: { x: 9, z: 48, angle: 0 },
    parking: { x: -53, z: 28, angle: Math.PI / 2 },
    benches: [
      [8, -8],
      [18, -8],
      [8, -19],
      [18, -19],
    ],
    trees: [
      ...Array.from({ length: 17 }, (_, i) => [-69, -48 + i * 6]),
      ...Array.from({ length: 17 }, (_, i) => [-62 + i * 8, -54]),
      ...Array.from({ length: 12 }, (_, i) => [68, -42 + i * 8]),
      ...Array.from({ length: 8 }, (_, i) => [31, -15 + i * 8]),
      [0, 29],
      [-4, 38],
      [22, 42],
      [19, -12],
      [8, -22],
      [7, -6],
    ],
    maxTrees: 60,
    hills: [],
  };
  addDetails(layout);
  return finishLayout(layout, (x, z) => 1.5 + Math.max(0, -z - 45) * 0.15);
}
