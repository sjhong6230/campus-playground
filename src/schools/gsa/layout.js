export function createLayout() {
  // North = -Z. Relative footprints traced from Naver aerial imagery.
  // The campus follows Cheomdangwagi-ro at approximately 20 degrees.
  // Heights, small roof fittings and landscaping are game approximations.
  const angle = 0.35;
  const segment = (x, z, w, d, extra = {}) => ({
    x,
    z,
    w,
    d,
    angle,
    ...extra,
  });
  const point = (frame, u, v) => {
    const c = Math.cos(frame.angle || 0),
      s = Math.sin(frame.angle || 0);
    return { x: frame.x + u * c + v * s, z: frame.z - u * s + v * c };
  };
  const study = { x: 5, z: -16, angle };
  const dorm = { x: 22, z: -30, angle };
  const dormSegment = (u, v, w, d) => {
    const p = point(dorm, u, v);
    return segment(p.x, p.z, w, d, { roof: "gable", roofColor: "#70918e" });
  };
  const bridge = (name, a, b, level, floors = 1, width = 2.8) => ({
    name,
    x: (a.x + b.x) / 2,
    z: (a.z + b.z) / 2,
    w: Math.hypot(b.x - a.x, b.z - a.z),
    d: width,
    angle: Math.atan2(a.z - b.z, b.x - a.x),
    baseY: 1.5 + (level - 1) * 3,
    floors,
    bottomSlab: true,
  });
  const main = segment(-23, 4, 39, 8);
  const science = segment(-33, -21, 33, 9);
  const layout = {
    sources: {
      map: "https://map.naver.com/p/search/광주과학고등학교",
      facilities: "https://www.namu.moe/w/광주과학고등학교/시설",
      official: "https://gsa.jge.hs.kr/sub/page.php?page_code=intro_01",
      checked: "2026-10-27",
      corrected: "2026-10-28",
    },
    buildings: [
      {
        name: "본관동",
        x: -23,
        z: 4,
        floors: 4,
        baseY: 1.5,
        color: "#d1c7b8",
        segments: [
          segment(-23, 4, 39, 8, { roof: "flat", roofColor: "#c4d0c5" }),
        ],
      },
      {
        name: "과학동",
        x: -33,
        z: -21,
        floors: 4,
        baseY: 1.5,
        color: "#cbc9b9",
        segments: [
          segment(-33, -21, 33, 9, { roof: "flat", roofColor: "#c8cfbf" }),
          segment(-22, -26, 11, 6, {
            floors: 3,
            roof: "flat",
            roofColor: "#c4cabb",
          }),
        ],
      },
      {
        name: "학습동 · 식당·강당",
        x: 5,
        z: -16,
        floors: 4,
        baseY: 1.5,
        color: "#d5cbbb",
        segments: [
          {
            ...segment(0, 0, 8, 37, {
              roof: "flat",
              roofColor: "#c7d1c7",
              openGroundFloor: true,
            }),
            ...point(study, -2, 0),
          },
          // The dormitory-facing strip retains the ground-floor hall/corridor.
          {
            ...segment(0, 0, 4, 37, { roof: "flat", roofColor: "#c7d1c7" }),
            ...point(study, 4, 0),
          },
        ],
      },
      {
        name: "남기숙사",
        x: 25,
        z: -38,
        floors: 4,
        baseY: 1.5,
        color: "#c4b7a4",
        segments: [
          dormSegment(0, -18, 29, 5.5),
          dormSegment(11.75, -9, 5.5, 12.5),
          dormSegment(0, 0, 29, 5.5),
        ],
      },
      {
        name: "여기숙사",
        ...point(dorm, 0, 16),
        floors: 4,
        baseY: 1.5,
        color: "#c6bca9",
        segments: [
          // Only the bottom stroke: its west end connects at level 2.
          dormSegment(0, 16, 29, 5.5),
        ],
      },
      {
        name: "체육관 · SLC",
        x: 31,
        z: 11,
        floors: 2,
        baseY: 1.5,
        color: "#d7d4c5",
        segments: [
          segment(31, 11, 17, 23, { roof: "flat", roofColor: "#e1e0d4" }),
        ],
      },
    ],
    links: [
      bridge(
        "본관–과학동 · 2–4층",
        point(main, -7, -4),
        point(science, -7, 4.5),
        2,
        3,
      ),
      bridge(
        "본관–학습동 · 2–3층",
        point(main, 19.5, 0),
        point(study, -6, 12),
        2,
        2,
      ),
      bridge(
        "과학동–남기숙사 · 2층",
        point({ x: -22, z: -26, angle }, 5.5, -1.5),
        point(dorm, -14.5, -18),
        2,
      ),
      bridge(
        "남기숙사–여기숙사 · 2층",
        point(dorm, -11.75, 2.75),
        point(dorm, -11.75, 13.25),
        2,
      ),
    ],
    field: segment(-10, 33, 51, 31),
    gate: { x: 26, z: 38, angle },
    tennis: segment(18, 13, 19, 9, { angle: angle + Math.PI / 2 }),
    courtKind: "basketball",
    parking: { x: 44, z: 4, angle: angle + Math.PI / 2 },
    benches: [
      [-37, -10],
      [-20, -14],
      [-13, 12],
      [7, 27],
      [35, 31],
    ],
    hills: [],
    trees: [
      ...Array.from({ length: 20 }, (_, i) => [-55 + i * 4.6, -25 - i * 1.67]),
      ...Array.from({ length: 14 }, (_, i) => [-54 + i * 1.75, -23 + i * 4.6]),
      ...Array.from({ length: 14 }, (_, i) => [39 + i * 1.3, -49 + i * 4.3]),
      ...Array.from({ length: 14 }, (_, i) => [-27 + i * 5, 57 - i * 1.8]),
      [-40, -12],
      [-37, -7],
      [-23, -14],
      [-18, -15],
      [-11, -16],
      [18, -34],
      [21, -36],
      [27, -34],
      [17, -18],
      [23, -18],
      [5, 30],
      [35, 32],
      [41, 29],
      [49, 20],
    ],
    maxTrees: 76,
    elevationAt() {
      return 1.5;
    },
    point(frame, u, v) {
      const c = Math.cos(frame.angle || 0),
        s = Math.sin(frame.angle || 0);
      return { x: frame.x + u * c + v * s, z: frame.z - u * s + v * c };
    },
  };
  for (const b of layout.buildings)
    for (const s of b.segments) {
      s.cos = Math.cos(s.angle);
      s.sin = Math.sin(s.angle);
    }
  return layout;
}
