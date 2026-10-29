import {
  segment as s,
  building as b,
  bridge,
  finishLayout,
} from "../shared/layout.js";
import { addDetails } from "./details.js";

// North-up footprints from the public aerial view; heights are game-scale
// terraces, not surveyed elevations. Official floor counts are in sources/bsis.txt.
export function createLayout() {
  const layout = {
    sources: {
      official: "https://school.busanedu.net/bsis-h/main.do",
      map: "https://map.naver.com/p/search/부산일과학고등학교",
      plan: "https://school.busanedu.net/bsis-h/na/ntt/selectNttInfo.do?mi=607004&nttSn=53626435",
      aerial: "https://v.daum.net/v/EwGZ7PmKxh?f=m",
      checked: "2026-10-29",
    },
    buildings: [
      b("제석관 · 본관", 5, 4.5, "#d2d7d2", [
        s(-7, 6, 28, 7),
        s(5, -0.5, 5, 6),
      ]),
      b("창의관 · 과학동", 5, 5.5, "#d0d7d2", [
        s(-8, -18, 24, 10, { observatory: true }),
        s(6.5, -13, 5, 14),
      ]),
      b("형설관 · 특별동", 4, 6, "#d8dad2", [s(23, -14, 20, 8)]),
      b("면학관 · 학년동", 4, 4.5, "#d3d7d1", [s(23, 6, 17, 7)]),
      b("회화관 · 남기숙사", 5, 8, "#d9d9cf", [
        s(-3, -37, 29, 7, { angle: -0.17 }),
      ]),
      b("모란관 · 여기숙사", 5, 8, "#d6d7ce", [s(26, -33, 13, 7)]),
      // Three above-ground levels; the basement and double-height gym interior
      // are simplified by the shared structural model, not surveyed geometry.
      b("승학관 · 강당·식당·체육관", 3, 1.5, "#dce0d8", [
        s(25, 31, 16, 26, { roofColor: "#d3dcd9" }),
      ]),
    ],
    links: [
      bridge("제석관–창의관", { x: 5, z: -3.5 }, { x: 6.5, z: -6 }, 7.5, 3, 3),
      bridge("제석관–면학관", { x: 7, z: 6 }, { x: 14.5, z: 6 }, 7.5, 2, 2.8),
      bridge("창의관–형설관", { x: 9, z: -15 }, { x: 13, z: -14 }, 8.5, 3, 2.8),
      bridge(
        "기숙사 연결부",
        { x: 10.7, z: -35 },
        { x: 19.5, z: -33 },
        8,
        3,
        3.2,
      ),
      bridge(
        "창의관–기숙사",
        { x: 8, z: -22.5 },
        { x: 11.5, z: -33 },
        8,
        3,
        3.1,
      ),
      bridge("면학관–승학관", { x: 30, z: 9.5 }, { x: 30, z: 18 }, 4.5, 1, 3),
    ],
    observatory: {
      x: -16,
      z: -16,
      y: 20.75,
      building: 1,
      radius: 1.8,
      color: "#c9d4d5",
    },
    field: {
      ...s(-15, 30, 34, 23),
      height: 1.5,
      surface: "dirt",
      color: "#b8b28d",
    },
    tennis: { ...s(25, -48, 10, 10), height: 9 },
    courtKind: "basketball",
    gate: { x: 10, z: 52, angle: 0 },
    parking: { x: -14, z: 48, angle: 0 },
    benches: [
      [-28, 14],
      [-18, 14],
      [-8, 14],
      [-16, -5],
      [-10, -5],
      [22, -4],
    ],
    trees: [
      ...Array.from({ length: 16 }, (_, i) => [
        -44 - 2 * Math.sin(i),
        -52 + i * 6.8,
      ]),
      ...Array.from({ length: 16 }, (_, i) => [
        42 + 2 * Math.sin(i),
        -52 + i * 6.8,
      ]),
      ...Array.from({ length: 12 }, (_, i) => [-61 + i * 10.5, -57]),
      ...Array.from({ length: 9 }, (_, i) => [-63 + i * 7, 56]),
      [-16, -6],
      [-11, -6],
      [-17, -10],
      [24, -3],
      [29, -4],
      [-51, 30],
      [-57, 19],
      [-54, -15],
      [51, -26],
      [54, 3],
      [55, 35],
    ],
    maxTrees: 68,
    hills: [],
  };
  addDetails(layout);
  return finishLayout(layout, (x, z) => {
    const uphill = Math.max(0, Math.min(1, (17 - z) / 66));
    const woodedSlope = Math.max(0, Math.abs(x) - 36) * 0.25;
    return 1.5 + uphill * 7.5 + woodedSlope;
  });
}
