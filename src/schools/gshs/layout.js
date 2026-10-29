import { refineCampus } from "./details.js";

export function createLayout() {
  /* GSHS: north = -Z, east = +X. Hand-traced relative footprints from
   Naver aerial imagery; names cross-checked against the official campus map.
   Dimensions, elevations and facades are game approximations, not survey data. */
  const layout = {
    sources: {
      map: "https://map.naver.com/p/search/경기과학고등학교",
      diagram:
        "https://gs-h.goesw.kr/gs-h/cm/cntnts/cntntsView.do?mi=1236&cntntsId=1038",
      facilities: "https://namu.moe/w/경기과학고등학교",
      checked: "2026-10-27",
    },
    buildings: [
      {
        name: "본관",
        x: 7,
        z: 10,
        floors: 4,
        baseY: 4,
        color: "#b58d79",
        segments: [{ x: 7, z: 10, w: 39, d: 7.6, angle: -0.54 }],
      },
      {
        name: "SRC · 과학영재연구센터",
        x: -53,
        z: 10,
        floors: 7,
        baseY: 0,
        color: "#e3ded0",
        segments: [
          { x: -58, z: 8, w: 23, d: 7, angle: 0.98 },
          { x: -50, z: 1, w: 12, d: 7, angle: -0.27 },
          { x: -47, z: 12, w: 15, d: 7, angle: 0.98, floors: 4 },
          { x: -55, z: 19, w: 12, d: 6, angle: -0.4, floors: 3 },
        ],
      },
      {
        name: "학술정보관",
        x: -18,
        z: 2,
        floors: 3,
        baseY: 4,
        color: "#d6c4a7",
        segments: [{ x: -18, z: 2, w: 12, d: 8, angle: 1.0 }],
      },
      {
        name: "식당",
        x: -8,
        z: -9,
        floors: 2,
        baseY: 6,
        color: "#e0d4bf",
        segments: [{ x: -8, z: -9, w: 9, d: 10, angle: 0.98 }],
      },
      {
        name: "학습관",
        x: 9,
        z: -15,
        floors: 3,
        baseY: 6,
        color: "#e0cba5",
        segments: [
          {
            x: 9,
            z: -15,
            w: 23,
            d: 8,
            angle: 0.98,
            roof: "gable",
            roofColor: "#485b62",
          },
        ],
      },
      {
        name: "자치관",
        x: -1,
        z: -20,
        floors: 3,
        baseY: 6,
        color: "#cfc5b1",
        segments: [{ x: -1, z: -20, w: 9, d: 7, angle: -0.56 }],
      },
      {
        name: "아름관",
        x: 19,
        z: -27,
        floors: 3,
        baseY: 8,
        color: "#c3b9a3",
        segments: [
          {
            x: 19,
            z: -27,
            w: 13,
            d: 7,
            angle: -0.56,
            roof: "gable",
            roofColor: "#665349",
          },
        ],
      },
      {
        name: "우정1관",
        x: 22,
        z: -14,
        floors: 3,
        baseY: 6,
        color: "#c6a184",
        segments: [{ x: 22, z: -14, w: 20, d: 6, angle: 0.98 }],
      },
      {
        name: "우정2관",
        x: 42,
        z: -23,
        floors: 4,
        baseY: 6,
        color: "#d9d9c7",
        segments: [{ x: 42, z: -23, w: 24, d: 8, angle: -0.56 }],
      },
      {
        name: "창조관",
        x: 59,
        z: -5,
        floors: 3,
        baseY: 4,
        color: "#cdb39a",
        segments: [
          {
            x: 59,
            z: -5,
            w: 19,
            d: 11,
            angle: 1.25,
            roof: "barrel",
            roofColor: "#659985",
          },
        ],
      },
      {
        name: "그린클럽",
        x: 68,
        z: 11,
        floors: 1,
        baseY: 4,
        color: "#c5b59c",
        segments: [{ x: 68, z: 11, w: 7, d: 4, angle: -0.3 }],
      },
      {
        name: "미래과학교육원 · 인접 시설",
        x: -26,
        z: 43,
        floors: 3,
        baseY: 0,
        color: "#c3cfc9",
        segments: [
          { x: -26, z: 40, w: 23, d: 8, angle: -0.6 },
          { x: -17, z: 48, w: 13, d: 10, angle: 0.97 },
        ],
      },
    ],
    links: [
      {
        name: "본관–학습관 연결부",
        x: -4,
        z: 0,
        w: 5,
        d: 3,
        angle: 0.98,
        baseY: 6,
      },
    ],
    field: { x: 33, z: -3, w: 31, d: 20, angle: 0.98 },
    gate: { x: -7, z: 55, angle: -0.6 },
    benches: [
      [-20, 22],
      [-12, 24],
      [-4, 26],
      [45, 13],
      [50, 5],
    ],
    observatory: { x: -50, z: 1, y: 21, building: 1 },
    tennis: { x: 70, z: -4, w: 14, d: 6, angle: 1.25 },
    parking: { x: -40, z: 29, angle: -0.6 },
    hills: [
      [-40, -63],
      [-12, -66],
      [20, -65],
      [48, -62],
      [75, -49],
    ],
    trees: [
      ...Array.from({ length: 27 }, (_, i) => [
        -67 + i * 5,
        -50 + Math.sin(i * 2) * 4,
      ]),
      ...Array.from({ length: 15 }, (_, i) => [
        -66 + i * 8,
        -39 + Math.sin(i * 3) * 3,
      ]),
      ...Array.from({ length: 12 }, (_, i) => [
        -40 + i * 5,
        20 + Math.sin(i * 0.8) * 4,
      ]),
      ...Array.from({ length: 9 }, (_, i) => [48 + Math.sin(i) * 4, 7 + i * 4]),
      ...Array.from({ length: 8 }, (_, i) => [-69, -30 + i * 7]),
    ],
    elevationAt(x, z) {
      const smooth = (t) => {
        t = Math.max(0, Math.min(1, t));
        return t * t * (3 - 2 * t);
      };
      let h =
        3 * (1 - smooth((z - 4) / 27)) * smooth((x + 45) / 20) +
        3 * (1 - smooth((z + 8) / 20)) * smooth((x + 25) / 20);
      const f = this.field,
        fdx = x - f.x,
        fdz = z - f.z,
        fu = fdx * Math.cos(f.angle) - fdz * Math.sin(f.angle),
        fv = fdx * Math.sin(f.angle) + fdz * Math.cos(f.angle),
        fo = Math.max(Math.abs(fu) - f.w / 2, Math.abs(fv) - f.d / 2, 0);
      if (fo < 1e-6) return 4;
      h = h * smooth(fo / 4) + 4 * (1 - smooth(fo / 4));
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
            c = s.cos,
            a = s.sin,
            u = dx * c - dz * a,
            v = dx * a + dz * c,
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

  // Cached footprint rotations for repeated ground contact queries.
  for (const b of layout.buildings)
    for (const s of b.segments) {
      s.cos = Math.cos(s.angle || 0);
      s.sin = Math.sin(s.angle || 0);
    }

  layout.courtKind = "tennis";
  return layout;
}
