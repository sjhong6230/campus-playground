import { addDetails } from "./details.js";
import {
  segment,
  building as b,
  bridge,
  point,
  local,
  finishLayout,
} from "../shared/layout.js";
export const campus = { x: 0, z: 0, angle: 0.32 };
export const dorm = { x: 25, z: 32, angle: 0 };
export function createLayout() {
  const p = (u, v) => point(campus, u, v);
  const s = (u, v, w, d, extra = {}) =>
    segment(0, 0, w, d, { ...p(u, v), angle: campus.angle, ...extra });
  const radial = (degrees, r) => {
    const a = (degrees * Math.PI) / 180;
    return { x: dorm.x + r * Math.cos(a), z: dorm.z + r * Math.sin(a) };
  };
  // The satellite image resolves four wings; their official letter ordering is unverified.
  const wings = [
    [-65, "북동"],
    [10, "동"],
    [75, "남"],
    [140, "남서"],
  ].map(([a, name]) => {
    const q = radial(a, 18);
    return b(`미리내 · ${name}동`, 5, 1.5, "#dbd9cc", [
      segment(q.x, q.z, 15, 8, {
        angle: (-a * Math.PI) / 180,
        roof: "gable",
        roofColor: "#d2d7cf",
      }),
    ]);
  });
  // A low-segment C-shaped gallery preserves the open central courtyard.
  const gallery = Array.from({ length: 9 }, (_, i) => {
    const a = -110 + i * 30,
      q = radial(a, 10);
    return segment(q.x, q.z, 5.55, 3, {
      angle: (-(a + 90) * Math.PI) / 180,
      roofColor: "#c3ccc4",
    });
  });
  const observatory = p(-26, -49);
  const layout = finishLayout(
    {
      sources: {
        map: "https://map.naver.com/p/search/세종과학고등학교",
        official: "https://sjsh.sen.hs.kr",
        facilities: "https://www.namu.moe/w/세종과학고등학교/시설",
        checked: "2026-10-29",
      },
      buildings: [
        b("집현전 · 본관", 4, 4.5, "#d9d0bb", [
          s(7, -28, 11, 31, { roofColor: "#789c89" }),
          s(25, -39.5, 25, 8, { roofColor: "#789c89" }),
          s(25, -16.5, 25, 8, { roofColor: "#789c89" }),
        ]),
        b("장영실관 · 과학동", 4, 4.5, "#d5c6ac", [
          s(-15, -49, 33, 9, { roofColor: "#709b83", observatory: true }),
        ]),
        // Three slab levels approximate the exposed basement, dining hall and tall gym.
        b("한누리관 · 식당·체육관", 3, 1.5, "#d4c7af", [
          s(23, 4, 24, 21, { roof: "barrel", roofColor: "#76877b" }),
        ]),
        ...wings,
        b("미리내 · 원형 연결부", 4, 1.5, "#d8d8ce", gallery),
      ],
      links: [
        bridge("집현전–장영실관 1–4층", p(1.5, -49), p(7, -43.5), 4.5, 4, 3.2),
        bridge("집현전–한누리관", p(7, -12.5), p(9, 4), 4.5, 1, 3),
        bridge("한누리관–미리내", p(9, 4), { x: 23, z: 35 }, 4.5, 1, 2.6),
      ],
      observatory: {
        ...observatory,
        y: 16.75,
        building: 1,
        radius: 2.4,
        color: "#c8d5d6",
      },
      field: s(-24, -22, 34, 27, { height: 3.8 }),
      tennis: s(-47, -15, 12, 9),
      courtKind: "basketball",
      gate: { ...p(-44, 6), angle: campus.angle },
      parking: { ...p(-22, -39), angle: campus.angle },
      benches: [p(-35, -5), p(-26, -5), p(-16, -5), p(24, -28)].map((q) => [
        q.x,
        q.z,
      ]),
      hills: [],
      trees: [
        ...Array.from({ length: 13 }, (_, i) => p(-51, -47 + i * 4.6)),
        ...Array.from({ length: 10 }, (_, i) => p(-41 + i * 4, -5)),
        ...Array.from({ length: 11 }, (_, i) => p(43, -43 + i * 4.5)),
        ...Array.from({ length: 11 }, (_, i) => ({ x: 6 + i * 4.5, z: 56 })),
        ...Array.from({ length: 7 }, (_, i) => ({ x: 57, z: 14 + i * 5.5 })),
        p(28, -28),
        p(35, -27),
        p(-38, 8),
        p(-43, 11),
      ]
        .map((q) => [q.x, q.z])
        .filter(([x, z]) => Math.abs(x) < 73 && Math.abs(z) < 57),
      maxTrees: 56,
    },
    (x, z) => {
      const { u, v } = local(campus, x, z);
      return (
        1.5 +
        3 * Math.max(0, Math.min(1, (3 - v) / 12)) +
        Math.max(0, -u - 55) * 0.3
      );
    },
  );
  return addDetails(layout);
}
