import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
import { addDetails } from "./details.js";

// Jigok campus opened in 2023. Wing lengths/angles are aerial-photo estimates.
export function createLayout() {
  const hub = { x: -22, z: -18 };
  const arm = (angle, length) =>
    s(
      hub.x + Math.cos(angle) * (7 + length / 2),
      hub.z - Math.sin(angle) * (7 + length / 2),
      length,
      10,
      { angle, roofColor: "#77928c" },
    );
  const layout = {
    sources: {
      official: "https://school.gyo6.net/kbs",
      map: "https://map.naver.com/p/search/경북과학고등학교",
      facilities:
        "https://school.gyo6.net/kbs/cm/cntnts/cntntsView.do?cntntsId=149046&mi=149046",
      aerial: "https://www.fnnews.com/news/202307071045415117",
      checked: "2026-10-30",
    },
    buildings: [
      b("교사동 · 중앙도서관", 4, 2.5, "#dde0da", [
        // Three wings meet a ring around an open central atrium.
        arm(Math.PI / 2, 23),
        arm(-Math.PI / 6, 31),
        arm((-5 * Math.PI) / 6, 29),
        s(-22, -23, 14, 4),
        s(-22, -13, 14, 4),
        s(-27, -18, 4, 6),
        s(-17, -18, 4, 6),
      ]),
      b("입지관 · 생활관", 4, 2.5, "#d6a28b", [
        s(32, -21, 34, 10, { angle: -0.2 }),
        s(53, -13, 15, 10, { angle: -0.55 }),
        s(58, -1, 10, 14),
      ]),
      b("생활관 · 식당", 2, 2.5, "#cbb39a", [s(13, -24, 10, 13)]),
    ],
    links: [
      bridge(
        "교사동–생활관 연결통로",
        { x: 5, z: -4 },
        { x: 16, z: -16 },
        5.5,
        1,
        3,
      ),
    ],
    observatory: {
      x: -22,
      z: -23,
      y: 14.75,
      building: 0,
      radius: 1.8,
      color: "#d2dedd",
    },
    field: {
      ...s(10, 26, 52, 28),
      height: 1.5,
      surface: "grass",
      color: "#7f995b",
    },
    tennis: { ...s(22, -40, 19, 10), height: 2.5 },
    courtKind: "basketball",
    gate: { x: 51, z: 44, angle: 0 },
    parking: { x: -45, z: 28, angle: Math.PI / 2 },
    benches: [
      [-16, 4],
      [-6, 5],
      [4, 5],
      [16, 5],
      [40, 30],
    ],
    trees: [
      ...Array.from({ length: 16 }, (_, i) => [-65, -48 + i * 6.4]),
      ...Array.from({ length: 17 }, (_, i) => [-58 + i * 7.4, 51]),
      ...Array.from({ length: 16 }, (_, i) => [-59 + i * 7.5, -54]),
      ...Array.from({ length: 9 }, (_, i) => [68, -39 + i * 9]),
      [-32, 9],
      [-28, 17],
      [-27, 30],
      [42, 12],
      [41, 23],
    ],
    maxTrees: 63,
    hills: [],
  };
  addDetails(layout);
  return finishLayout(
    layout,
    (x, z) => 1.5 + Math.max(0, -x - 55) * 0.28 + Math.max(0, -z - 47) * 0.25,
  );
}
