import { refineCampus } from "./details.js";

export function createLayout() {
  /* KSA: relative photo-aligned model. Dimensions/elevations are game approximations.
 Sources: user supplied aerial views; https://ksa.hs.kr/Home/Sub/14
 https://ksa.hs.kr/Content/images/camtour/index.html (building names).
 The rear of the photo is -Z; this is not a surveyed north bearing. */
  const layout = {
    sources: {
      diagram: "https://ksa.hs.kr/Home/Sub/14",
      facilities: "https://ksa.hs.kr/Content/images/camtour/index.html",
      checked: "2026-10-27",
    },
    buildings: [
      {
        name: "본관",
        x: -12,
        z: 0,
        floors: 4,
        baseY: 3,
        color: "#c29b86",
        segments: [
          {
            x: -17,
            z: 0,
            w: 31,
            d: 11,
            angle: 0,
            roof: "flat",
            roofColor: "#4a826e",
          },
          {
            x: 4,
            z: 0,
            w: 11,
            d: 15,
            angle: 0,
            color: "#e2e1d2",
            roof: "flat",
            roofColor: "#508b77",
          },
        ],
      },
      {
        name: "탐구관",
        x: -9,
        z: -28,
        floors: 5,
        baseY: 10,
        color: "#b77e69",
        segments: [{ x: -9, z: -28, w: 39, d: 9, angle: 0 }],
      },
      {
        name: "형설관",
        x: -10,
        z: -43,
        floors: 5,
        baseY: 13,
        color: "#ba8e7b",
        segments: [{ x: -10, z: -43, w: 33, d: 8, angle: 0 }],
      },
      {
        name: "창조관",
        x: 29,
        z: -35,
        floors: 8,
        baseY: 10,
        color: "#d7d8ce",
        segments: [{ x: 29, z: -35, w: 18, d: 13, angle: 0 }],
      },
      {
        name: "드림디자인센터",
        x: -37,
        z: -25,
        floors: 5,
        baseY: 8,
        color: "#dce0d8",
        segments: [{ x: -37, z: -25, w: 10, d: 18, angle: 0 }],
      },
      {
        name: "견우관",
        x: 39,
        z: -6,
        floors: 6,
        baseY: 6,
        color: "#bf8e79",
        segments: [
          { x: 26, z: -9, w: 10, d: 26, angle: 0 },
          { x: 42, z: 0, w: 23, d: 9, angle: 0 },
          { x: 53, z: -9, w: 9, d: 26, angle: 0 },
        ],
      },
      {
        name: "직녀관",
        x: 64,
        z: -4,
        floors: 6,
        baseY: 6,
        color: "#bc8978",
        segments: [
          {
            x: 64,
            z: -4,
            w: 10,
            d: 24,
            angle: 0,
            roof: "flat",
            roofColor: "#608b78",
          },
        ],
      },
      {
        name: "백양관",
        x: 59,
        z: 18,
        floors: 5,
        baseY: 4,
        color: "#ddd9cc",
        segments: [
          {
            x: 59,
            z: 18,
            w: 13,
            d: 14,
            angle: 0,
            roof: "flat",
            roofColor: "#5c957e",
          },
        ],
      },
      {
        name: "예지관",
        x: -56,
        z: 5,
        floors: 7,
        baseY: 1,
        color: "#d1c1a5",
        segments: [
          {
            x: -56,
            z: 5,
            w: 18,
            d: 23,
            angle: 0,
            roof: "flat",
            roofColor: "#d2d9d1",
          },
        ],
      },
    ],
    links: [
      {
        name: "탐구–형설 연결부",
        x: 5,
        z: -35,
        w: 6,
        d: 7,
        angle: 0,
        baseY: 16,
      },
      {
        name: "본관–탐구 연결부",
        x: -20,
        z: -14,
        w: 7,
        d: 16,
        angle: 0,
        baseY: 9,
      },
      {
        name: "창조–탐구 연결부",
        x: 15,
        z: -28,
        w: 12,
        d: 3,
        angle: 0,
        baseY: 16,
      },
      {
        name: "본관–생활관 연결부",
        x: 14,
        z: -2,
        w: 10,
        d: 3,
        angle: 0,
        baseY: 9,
      },
    ],
    field: { x: -19, z: 32, w: 54, d: 31, angle: 0 },
    gate: { x: 37, z: 53, angle: 0 },
    benches: [
      [-35, 12],
      [-24, 12],
      [-13, 12],
      [8, 18],
      [33, 28],
    ],
    observatory: { x: 29, z: -35, y: 34.3, building: 3 },
    tennis: { x: -62, z: 30, w: 18, d: 10, angle: Math.PI / 2 },
    parking: { x: 22, z: 36, angle: Math.PI / 2 },
    hills: [
      [-66, -53],
      [-43, -65],
      [-13, -68],
      [15, -66],
      [46, -64],
      [72, -49],
    ],
    trees: [
      ...Array.from({ length: 28 }, (_, i) => [
        -70 + i * 5.1,
        -53 + Math.sin(i * 1.7) * 3,
      ]),
      ...Array.from({ length: 13 }, (_, i) => [-72, -45 + i * 7]),
      ...Array.from({ length: 13 }, (_, i) => [72, -45 + i * 7]),
      ...Array.from({ length: 16 }, (_, i) => [
        -65 + i * 8.4,
        53 + Math.sin(i) * 1.4,
      ]),
      [9, 27],
      [11, 43],
      [34, 34],
      [40, 42],
      [48, 28],
      [22, 20],
      [36, 21],
      [7, 17],
      [64, 33],
    ],
    elevationAt(x, z) {
      const smooth = (t) => {
        t = Math.max(0, Math.min(1, t));
        return t * t * (3 - 2 * t);
      };
      let h = 13 * (1 - smooth((z + 43) / 58));
      const f = this.field,
        fo = Math.max(
          Math.abs(x - f.x) - f.w / 2,
          Math.abs(z - f.z) - f.d / 2,
          0,
        );
      if (fo === 0) return 0;
      h *= smooth(fo / 5);
      for (const b of this.buildings)
        for (const s of b.segments) {
          const dx = x - s.x,
            dz = z - s.z,
            u = dx * s.cos - dz * s.sin,
            v = dx * s.sin + dz * s.cos;
          if (Math.abs(u) <= s.w / 2 && Math.abs(v) <= s.d / 2) return b.baseY;
        }
      for (const b of this.buildings)
        for (const s of b.segments) {
          const dx = x - s.x,
            dz = z - s.z,
            u = dx * s.cos - dz * s.sin,
            v = dx * s.sin + dz * s.cos,
            out = Math.max(Math.abs(u) - s.w / 2, Math.abs(v) - s.d / 2, 0),
            a = 1 - smooth(out / 3);
          h = h * (1 - a) + b.baseY * a;
        }
      return h;
    },
    point(f, u, v) {
      const c = Math.cos(f.angle || 0),
        s = Math.sin(f.angle || 0);
      return { x: f.x + u * c + v * s, z: f.z - u * s + v * c };
    },
  };
  refineCampus(layout);
  for (const b of layout.buildings)
    for (const s of b.segments) {
      s.cos = Math.cos(s.angle || 0);
      s.sin = Math.sin(s.angle || 0);
    }

  layout.courtKind = "tennis";
  return layout;
}
