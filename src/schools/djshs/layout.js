import { addDetails } from "./details.js";
import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
export function createLayout() {
  const layout = finishLayout(
    {
      sources: {
        map: "https://map.naver.com/p/search/대전과학고등학교",
        official: "https://djshs.djsch.kr/sub/info.do?m=0106&s=djshs",
        facilities: "https://d.namu.moe/w/대전과학고등학교/시설",
        checked: "2026-10-28",
      },
      buildings: [
        b("탐의관", 5, 1.5, "#c7a58b", [
          s(2, 0, 60, 11, { roofColor: "#b5c6c3" }),
        ]),
        b("일신관", 4, 1.5, "#d8bd9f", [
          s(0, -29, 60, 15, { roof: "gable", roofColor: "#637e7b" }),
        ]),
        b("다산관", 7, 1.5, "#d3c7b6", [
          s(-40, -10, 11, 44, { observatory: true, roofColor: "#bac9c5" }),
          s(-40, 25, 11, 20, { floors: 2, roofColor: "#d8d9cd" }),
        ]),
        b("식당동 · 체육관", 2, 1.5, "#d1d2c1", [
          s(43, -23, 15, 23, { roof: "barrel", roofColor: "#c9d2c9" }),
        ]),
        b("여명관 A동", 4, 1.5, "#bda995", [
          s(43, 24, 11, 48, { roof: "gable", roofColor: "#5b767b" }),
        ]),
        b("여명관 B동", 5, 1.5, "#bfab95", [
          s(27, 30, 11, 34, { roof: "gable", roofColor: "#5b767b" }),
        ]),
      ],
      links: [
        bridge("일신관–탐의관", { x: 0, z: -21.5 }, { x: 0, z: -5.5 }, 7.5, 2),
        bridge(
          "다산관–일신관",
          { x: -34.5, z: -27 },
          { x: -30, z: -27 },
          4.5,
          3,
        ),
        bridge("다산관–탐의관", { x: -34.5, z: 0 }, { x: -28, z: 0 }, 7.5, 3),
        bridge("탐의관–여명관 B동", { x: 27, z: 5.5 }, { x: 27, z: 13 }, 7.5),
        bridge("여명관 A–B동", { x: 32.5, z: 36 }, { x: 37.5, z: 36 }, 7.5),
        bridge("일신관–식당동", { x: 30, z: -25 }, { x: 35.5, z: -25 }, 4.5),
      ],
      field: s(-7, 29, 43, 32, { height: 1.5 }),
      gate: { x: -54, z: 43, angle: Math.PI / 2 },
      parking: { x: -56, z: -25, angle: Math.PI / 2 },
      benches: [
        [-27, 9],
        [-28, 46],
        [12, 46],
        [-52, 11],
      ],
      hills: [],
      trees: [
        ...Array.from({ length: 20 }, (_, i) => [-59 + i * 5.8, -43]),
        ...Array.from({ length: 18 }, (_, i) => [57, -38 + i * 5.2]),
        ...Array.from({ length: 18 }, (_, i) => [-47 + i * 5.4, 53]),
        [-52, -3],
        [-52, 4],
        [-29, 10],
        [-22, 9],
        [-15, 9],
        [-7, 9],
        [1, 9],
        [8, 9],
      ],
      maxTrees: 64,
    },
    (x, z) => 1.5 + Math.max(0, x - 53) * 0.4 + Math.max(0, z - 49) * 0.35,
  );
  return addDetails(layout);
}
