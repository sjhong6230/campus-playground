import { refineCampus } from "./details.js";

export function createLayout() {
  /* ISHS, Unseo: north=-Z, east=+X. Relative footprints traced from the public
   Naver aerial view; names checked against the school facilities page.
   Heights, facades and planting are game approximations, not survey data. */
  const layout = {
    sources: {
      map: "https://map.naver.com/p/search/인천과학고등학교",
      facilities:
        "https://i-science.icehs.kr/sub/info.do?m=0106&page=0106&s=isciencehs",
      checked: "2026-10-27",
    },
    buildings: [
      {
        name: "덕성동 · 본관",
        x: 12,
        z: 9,
        floors: 3,
        baseY: 3,
        color: "#b79a7c",
        segments: [
          {
            x: 12,
            z: 14,
            w: 31,
            d: 5,
            angle: 0.07,
            roof: "gable",
            roofColor: "#81735d",
          },
          {
            x: 12,
            z: -1,
            w: 31,
            d: 5,
            angle: 0.07,
            floors: 4,
            observatory: true,
          },
          { x: -1, z: 7, w: 5, d: 10, angle: 0.07 },
          { x: 25, z: 5, w: 5, d: 10, angle: 0.07 },
          {
            x: -9,
            z: 10,
            w: 7,
            d: 16,
            angle: 0.07,
            floors: 1,
            roof: "gable",
            roofColor: "#548773",
          },
        ],
      },
      {
        name: "창의동 · 연구동",
        x: 7,
        z: -13,
        floors: 4,
        baseY: 5,
        color: "#c9c7b6",
        segments: [{ x: 7, z: -13, w: 28, d: 8, angle: 0.07 }],
      },
      {
        name: "자주동 · 신관",
        x: -34,
        z: -2,
        floors: 4,
        baseY: 1,
        color: "#d1c5ad",
        segments: [{ x: -34, z: -2, w: 25, d: 14, angle: 0.08 }],
      },
      {
        name: "청명관",
        x: 29,
        z: -32,
        floors: 5,
        baseY: 7,
        color: "#c29b65",
        segments: [
          { x: 27, z: -31, w: 24, d: 7, angle: 0.57 },
          { x: 39, z: -37, w: 9, d: 7, angle: 0.07 },
        ],
      },
      {
        name: "청운관",
        x: 44,
        z: -25,
        floors: 3,
        baseY: 7,
        color: "#a78b79",
        segments: [
          {
            x: 46,
            z: -28.5,
            w: 19,
            d: 6,
            angle: 0.07,
            roof: "gable",
            roofColor: "#796858",
          },
          {
            x: 34,
            z: -21,
            w: 6,
            d: 12,
            angle: 0.07,
            roof: "gable",
            roofColor: "#796858",
          },
          {
            x: 57,
            z: -28.5,
            w: 6,
            d: 12,
            angle: 0.07,
            roof: "gable",
            roofColor: "#796858",
          },
        ],
      },
      {
        name: "식당·체력단련동",
        x: 54,
        z: 5,
        floors: 2,
        baseY: 6,
        color: "#c5c2ae",
        segments: [
          {
            x: 54,
            z: 5,
            w: 19,
            d: 19,
            angle: 0.07,
            roof: "hip",
            roofColor: "#649280",
          },
        ],
      },
    ],
    links: [
      {
        name: "자주–덕성 연결통로",
        x: -16,
        z: -3,
        w: 11,
        d: 2.2,
        angle: 0.07,
        baseY: 5,
      },
      {
        name: "창의–기숙사 연결통로",
        x: 29,
        z: -11,
        w: 18,
        d: 2.1,
        angle: 0.07,
        baseY: 7,
      },
      {
        name: "덕성–식당 연결통로",
        x: 36,
        z: 11,
        w: 15,
        d: 2.2,
        angle: 0.07,
        baseY: 6,
      },
    ],
    field: { x: -32, z: 24, w: 29, d: 24, angle: 0.07 },
    gate: { x: 13, z: 44, angle: 0.07 },
    benches: [
      [-4, -7],
      [17, -7],
      [25, -7],
      [9, 30],
      [26, 29],
    ],
    tennis: { x: -59, z: 28, w: 17, d: 8, angle: 1.64 },
    parking: { x: 13, z: 29, angle: 1.64 },
    hills: [
      [-35, -62],
      [-8, -63],
      [18, -66],
      [47, -63],
      [77, -45],
    ],
    trees: [
      ...Array.from({ length: 25 }, (_, i) => [
        -65 + i * 5.4,
        -45 + Math.sin(i * 0.8) * 5,
      ]),
      ...Array.from({ length: 15 }, (_, i) => [
        -61 + i * 8,
        40 + Math.sin(i) * 2,
      ]),
      ...Array.from({ length: 9 }, (_, i) => [69, -33 + i * 8]),
      ...Array.from({ length: 8 }, (_, i) => [-48, 10 + i * 3]),
      [-10, 31],
      [-8, 25],
      [0, 31],
      [29, 24],
      [35, 26],
      [40, 30],
      [44, 26],
      [48, 32],
      [52, 27],
      [59, 33],
      [-3, -7],
      [4, -7],
      [20, -7],
      [26, -7],
      [41, -19],
      [49, -20],
    ],
    elevationAt(x, z) {
      const smooth = (t) => {
        t = Math.max(0, Math.min(1, t));
        return t * t * (3 - 2 * t);
      };
      let h = 1 + 6 * smooth((x + 20) / 80) * (1 - 0.4 * smooth((z - 10) / 35));
      const f = this.field,
        dx = x - f.x,
        dz = z - f.z,
        fu = dx * Math.cos(f.angle) - dz * Math.sin(f.angle),
        fv = dx * Math.sin(f.angle) + dz * Math.cos(f.angle),
        fo = Math.max(Math.abs(fu) - f.w / 2, Math.abs(fv) - f.d / 2, 0);
      if (fo < 1e-6) return 1;
      h = h * smooth(fo / 3) + 1 * (1 - smooth(fo / 3));
      for (const b of this.buildings)
        for (const s of b.segments) {
          const dx = x - s.x,
            dz = z - s.z,
            u = dx * s.cos - dz * s.sin,
            v = dx * s.sin + dz * s.cos;
          if (Math.abs(u) <= s.w / 2 + 1e-6 && Math.abs(v) <= s.d / 2 + 1e-6)
            return b.baseY;
        }
      for (const b of this.buildings)
        for (const s of b.segments) {
          const dx = x - s.x,
            dz = z - s.z,
            u = dx * s.cos - dz * s.sin,
            v = dx * s.sin + dz * s.cos,
            outside = Math.max(Math.abs(u) - s.w / 2, Math.abs(v) - s.d / 2, 0),
            blend = 1 - smooth(outside / 3);
          h = h * (1 - blend) + b.baseY * blend;
        }
      return h;
    },
    point(frame, u, v) {
      const c = Math.cos(frame.angle || 0),
        s = Math.sin(frame.angle || 0);
      return { x: frame.x + u * c + v * s, z: frame.z - u * s + v * c };
    },
  };
  refineCampus(layout);
  for (const b of layout.buildings)
    for (const s of b.segments) {
      s.cos = Math.cos(s.angle || 0);
      s.sin = Math.sin(s.angle || 0);
    }

  layout.courtKind = "basketball";
  return layout;
}
