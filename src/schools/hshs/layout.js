import {
  segment,
  building as b,
  bridge,
  point,
  local,
  finishLayout,
} from "../shared/layout.js";
export const campus = { x: 0, z: 0, angle: 0.9 };
export function createLayout() {
  const p = (u, v) => point(campus, u, v);
  const s = (u, v, w, d, extra = {}) =>
    segment(0, 0, w, d, { angle: campus.angle, ...p(u, v), ...extra });
  const science = p(42, 8);
  return finishLayout(
    {
      sources: {
        map: "https://map.naver.com/p/search/한성과학고등학교",
        diagram: "https://librewiki.net/wiki/한성과학고등학교",
        official: "https://hansungsh.sen.hs.kr",
        facilities: "https://www.namu.moe/w/한성과학고등학교/시설",
        checked: "2026-10-28",
      },
      buildings: [
        b("본관", 4, 10.5, "#d7c5a8", [
          s(0, -17, 92, 8, { roofColor: "#7f9a7b" }),
        ]),
        b("창조관 · 과학동", 5, 4.5, "#c5b7a0", [
          s(42, 7, 11, 27, { roofColor: "#7e9f8f" }),
          s(40, 23, 15, 5, { floors: 3, roofColor: "#7e9f8f" }),
        ]),
        b("인왕관 · 체육관", 2, 4.5, "#d5ccbb", [
          s(22, 8, 21, 21, { roof: "hip", roofColor: "#829991" }),
        ]),
        b("돈의관 · 남기숙사", 5, 1.5, "#c5bca8", [
          s(-32, 11, 13, 24, { roofColor: "#6d9083" }),
        ]),
        b("태하관 · 도서관", 5, 1.5, "#c5d0bd", [
          s(-46, 11, 8, 23, { roofColor: "#73988a" }),
        ]),
        // This small rear block is approximate; the older diagram predates Seohyeon.
        b("서현관 · 여기숙사", 4, 10.5, "#cbd2c2", [
          s(27, -29, 20, 7, { roofColor: "#668d7e" }),
        ]),
      ],
      links: [
        bridge("본관–돈의관 4층", p(-32, -13), p(-32, -1), 10.5),
        bridge("본관–창조관", p(42, -13), p(42, -6.5), 10.5, 2),
        bridge("돈의관–태하관", p(-38.5, 11), p(-42, 11), 7.5),
      ],
      observatory: { ...science, y: 21.5, building: 1 },
      field: s(-7, 11, 30, 25, { height: 10.5 }),
      gate: { ...p(-48, 29), angle: campus.angle },
      parking: { ...p(-31, 29), angle: campus.angle },
      benches: [p(-18, -6), p(-8, -6), p(2, -6), p(5, 26)].map((q) => [
        q.x,
        q.z,
      ]),
      hills: [],
      trees: [
        ...Array.from({ length: 22 }, (_, i) => p(-50 + i * 4.5, -36)),
        ...Array.from({ length: 20 }, (_, i) => p(-46 + i * 4.8, 33)),
        ...Array.from({ length: 10 }, (_, i) => p(53, -19 + i * 4.8)),
        ...[-22, -12, 0, 9].map((u) => p(u, -7)),
      ]
        .map((q) => [q.x, q.z])
        .filter(([x, z]) => Math.abs(x) < 73 && Math.abs(z) < 57),
      maxTrees: 56,
    },
    (x, z) => {
      const { v } = local(campus, x, z);
      return (
        1.5 +
        9 * Math.max(0, Math.min(1, (26 - v) / 22)) +
        Math.max(0, -v - 25) * 0.25
      );
    },
  );
}
