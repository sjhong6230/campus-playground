export function createLayout() {
  /* North is -Z, east is +X. Hand-aligned to the Naver aerial/map view,
   checked against the school's published building diagram. Game units are
   approximate; these are not surveyed coordinates or engineering dimensions. */
  const layout = {
    sources: {
      map: "https://map.naver.com/p/search/서울과학고등학교",
      diagram: "https://gifted.hs.kr/bbs/board.php?bo_table=b1&wr_id=11",
      facilities: "https://d.namu.moe/w/서울과학고등학교/시설",
      checked: "2026-10-26",
    },
    buildings: [
      {
        name: "예지관",
        x: 16,
        z: -5,
        floors: 4,
        baseY: 6,
        color: "#e5dac7",
        segments: [{ x: 16, z: -5, w: 61, d: 18, angle: 0.12 }],
      },
      {
        name: "우암관",
        x: -46,
        z: -28,
        floors: 4,
        baseY: 10,
        color: "#dbddd6",
        segments: [
          { x: -55, z: -14, w: 31, d: 9, angle: 1.05 },
          { x: -34, z: -36, w: 35, d: 9, angle: 0.56 },
        ],
      },
      {
        name: "융합인재관",
        x: 54,
        z: -11,
        floors: 5,
        baseY: 6,
        color: "#d7c7ac",
        segments: [{ x: 54, z: -11, w: 12, d: 32, angle: 0.12 }],
      },
      {
        name: "창의인재관",
        x: 47,
        z: 38,
        floors: 4,
        baseY: 0,
        color: "#d5ddda",
        segments: [{ x: 47, z: 38, w: 15, d: 24, angle: 0.12 }],
      },
      {
        name: "의행관",
        x: 16,
        z: -34,
        floors: 5,
        baseY: 6,
        color: "#d2dbdb",
        segments: [{ x: 16, z: -34, w: 61, d: 17, angle: 0.12 }],
      },
      {
        name: "아람관",
        x: -20,
        z: 30,
        floors: 2,
        baseY: 0,
        color: "#c4b69d",
        segments: [{ x: -20, z: 30, w: 10, d: 24, angle: 0.12 }],
      },
    ],
    // Publicly visible connecting volumes; floor elevations are simplified.
    links: [
      {
        name: "예지관–우암관 통로",
        x: -22,
        z: -7,
        w: 21,
        d: 2.5,
        angle: -0.48,
        baseY: 9,
      },
      {
        name: "예지관–의행관 통로",
        x: 5,
        z: -20,
        w: 2.5,
        d: 12,
        angle: 0.12,
        baseY: 6,
      },
      {
        name: "의행관–융합인재관 통로",
        x: 50,
        z: -29,
        w: 9,
        d: 3,
        angle: 0.12,
        baseY: 12,
      },
      {
        name: "창의인재관 연결다리",
        x: 48,
        z: 19,
        w: 2.5,
        d: 12,
        angle: 0.12,
        baseY: 6,
      },
    ],
    field: { x: 16, z: 38, w: 43, d: 29, angle: 0.12 },
    gate: { x: 66, z: 17, angle: Math.PI / 2 },
    benches: [
      [-8, 12],
      [2, 11],
      [12, 10],
      [22, 9],
      [32, 8],
    ],
    observatory: { x: 17, z: -5, y: 18 },
    elevationAt(x, z) {
      const smooth = (t) => {
        t = Math.max(0, Math.min(1, t));
        return t * t * (3 - 2 * t);
      };
      let h =
        6 * (1 - smooth((z - 12) / 13)) +
        4 * (1 - smooth((x + 40) / 15)) * (1 - smooth((z + 4) / 15));
      for (const b of this.buildings)
        for (const s of b.segments) {
          const dx = x - s.x,
            dz = z - s.z,
            c = s.cos,
            a = s.sin,
            u = dx * c - dz * a,
            v = dx * a + dz * c,
            outside = Math.max(Math.abs(u) - s.w / 2, Math.abs(v) - s.d / 2, 0);
          h = Math.max(h, b.baseY * (1 - smooth(outside / 4)));
        }
      return h;
    },
    point(frame, u, v) {
      const c = Math.cos(frame.angle || 0),
        s = Math.sin(frame.angle || 0);
      return { x: frame.x + u * c + v * s, z: frame.z - u * s + v * c };
    },
  };

  // Cached footprint rotations for repeated ground contact queries.
  for (const b of layout.buildings)
    for (const s of b.segments) {
      s.cos = Math.cos(s.angle || 0);
      s.sin = Math.sin(s.angle || 0);
    }

  layout.hills = [
    [-79, -47],
    [-72, -68],
    [-48, -66],
    [-24, -67],
  ];
  layout.maxTrees = 65;
  layout.observatory.building = 0;
  layout.trees = (random) => {
    const candidates = [];
    for (let i = 0; i < 29; i++)
      candidates.push([-68 + i * 4.7, -55 + (random() - 0.5) * 2]);
    for (let i = 0; i < 16; i++) candidates.push([-69, -46 + i * 5.6]);
    for (let i = 0; i < 15; i++) candidates.push([-8 + i * 4.4, 56]);
    for (let i = 0; i < 12; i++)
      candidates.push([-8 + i * 3.8, 11.5 - i * 0.38]);
    for (let i = 0; i < 15; i++) candidates.push([63, -50 + i * 3.4]);
    return candidates;
  };
  return layout;
}
