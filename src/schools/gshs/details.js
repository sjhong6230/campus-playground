// Public school CAMPUSMAP establishes facade identity; aerial imagery supplies
// the current green roof surfaces and relative circulation/terrace outlines.
export function refineCampus(layout) {
  const palettes = [
    ["brick", "#a57864", "#d4d5ca", "#30545c", "#d8d9cd"],
    ["stone", "#d0cebc", "#b6c1bb", "#284d59", "#768f94"],
    ["panel", "#d4cbb4", "#d9d8cc", "#355b66", "#b97855"],
    ["brick", "#aa846e", "#c7c8bc", "#456571", "#b7bfb8"],
    ["render", "#d7c9ad", "#bfbea8", "#364f59", "#c1bcaa"],
    ["render", "#d4d5c9", "#a5b1ab", "#3a5963", "#bac6c2"],
    ["render", "#d0c7af", "#aaa78e", "#4b6265", "#bebda5"],
    ["brick", "#b58a6e", "#d3c4ad", "#3f575c", "#c3bcaa"],
    ["panel", "#d6d8c8", "#a9b4b2", "#355460", "#688795"],
    ["brick", "#a97b66", "#d5cdb5", "#476563", "#c7c0aa"],
    ["render", "#c0b699", "#a3ad99", "#425e58", "#879f89"],
    ["render", "#bdc8bf", "#c8d0c6", "#43616c", "#a8bab3"],
  ];
  layout.buildings.forEach((b, i) => {
    const [style, color, trim, window, bandColor] = palettes[i];
    b.color = color;
    b.facade = { style, color, trim, window, bandColor };
    for (const s of b.segments) {
      if (!s.roof) s.roofColor = "#628c79";
      s.roofDetails = { parapet: !s.roof, equipment: false };
    }
  });
  layout.buildings[0].segments[0].facade = {
    ...layout.buildings[0].facade,
    glazedBays: [
      { u: -1, width: 4.1, projection: 0.7 },
      { u: 16.4, width: 2.9, projection: 0.55 },
    ],
  };
  for (const s of layout.buildings[1].segments.slice(2))
    s.facade = {
      style: "panel",
      color: "#72868a",
      trim: "#c8d0ca",
      window: "#264c5b",
      bandColor: "#456772",
      glazedBays: [{ u: 0, width: s.w - 1.5, projection: 0.12 }],
    };
  Object.assign(layout.buildings[3].segments[0], {
    roof: "hip",
    roofColor: "#5e7273",
    roofDetails: { parapet: false, equipment: false },
  });
  layout.buildings[8].segments[0].facade = {
    ...layout.buildings[8].facade,
    glazedBays: [{ u: 9.2, width: 2.4, projection: 0.55 }],
  };
  Object.assign(layout.field, { surface: "turf", color: "#507f53", height: 4 });
  Object.assign(layout.gate, {
    style: "piers",
    width: 10.5,
    height: 3.2,
    color: "#d1d7ce",
    sign: "경기과학고등학교",
    barrier: true,
  });
  const edge = (f, u, v) => {
    const p = layout.point(f, u, v);
    return [p.x, p.z];
  };
  const f = layout.field;
  layout.siteDetails = {
    retainingWalls: [
      { a: [-15, 11], b: [17, 29], height: 2.2, color: "#9b9c8d" },
      { a: [29, -33], b: [52, -18], height: 1.8, color: "#a7aa97" },
    ],
    fences: [
      {
        points: [
          edge(f, -f.w / 2 - 1, -f.d / 2 - 1),
          edge(f, f.w / 2 + 1, -f.d / 2 - 1),
        ],
        height: 2.5,
        color: "#4d6a60",
      },
      {
        points: [
          edge(f, -f.w / 2 - 1, f.d / 2 + 1),
          edge(f, f.w / 2 + 1, f.d / 2 + 1),
        ],
        height: 1.7,
        color: "#4d6a60",
      },
    ],
    paths: [
      {
        points: [
          [-7, 55],
          [0, 41],
          [8, 23],
          [24, 15],
          [34, 21],
          [47, 6],
          [60, 13],
        ],
        width: 4.4,
        kind: "road",
        color: "#92988f",
      },
      {
        points: [
          [-43, 25],
          [-31, 32],
          [-19, 39],
          [-8, 49],
        ],
        width: 4,
        kind: "road",
        color: "#9a9e93",
      },
      {
        points: [
          [-28, 15],
          [-30, 20],
          [-21, 24],
          [-9, 27],
          [2, 34],
        ],
        width: 1.5,
        kind: "walk",
        color: "#c9bfaa",
      },
      {
        points: [
          [-16, 9],
          [-14, -1],
          [-8, -14],
          [3, -31],
          [18, -35],
        ],
        width: 1.8,
        kind: "walk",
        color: "#c9c4ae",
      },
    ],
  };
  layout.hills = [];
  layout.maxTrees = 70;
  layout.sources.aerialDiagram =
    "https://gs-h.goesw.kr/images/web/gs-h/sub/img_0107.png";
  layout.sources.checked = "2026-10-29";
}
