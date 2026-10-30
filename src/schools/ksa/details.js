// The dated 2017 official oblique campus image is used as a visual reference,
// not as a survey or proof that every present-day facade is unchanged.
export function refineCampus(layout) {
  // The main teaching block turns uphill behind its pale entrance volume.
  layout.buildings[0].segments.push({
    x: 4,
    z: -15.5,
    w: 11,
    d: 16,
    angle: 0,
    floors: 4,
    roof: "flat",
    roofColor: "#527d69",
    color: "#b48470",
  });
  const palettes = [
    ["brick", "#ae7e68", "#d5cebc", "#344e55", "#c6c1b1"],
    ["brick", "#aa705c", "#c7c4b2", "#304c55", "#8e8e80"],
    ["brick", "#ad7d66", "#c4c4b5", "#324e58", "#b1aea0"],
    ["stone", "#c9cbbf", "#abb5ae", "#3d5962", "#b6beb6"],
    ["panel", "#505b5b", "#d4d7c9", "#2d414b", "#ce783f"],
    ["brick", "#ab7967", "#ddd9c8", "#37525c", "#c8c7b8"],
    ["brick", "#ad7964", "#c8c4b3", "#3c525a", "#b6b4a3"],
    ["panel", "#c6c9bd", "#b6bfb8", "#35515c", "#8daba8"],
    ["stone", "#c7c3ad", "#d5d4c4", "#2e4d59", "#9caeac"],
  ];
  layout.buildings.forEach((b, i) => {
    const [style, color, trim, window, bandColor] = palettes[i];
    b.color = color;
    b.facade = { style, color, trim, window, bandColor };
    for (const s of b.segments)
      s.roofDetails = { parapet: true, equipment: false };
  });
  layout.buildings[0].segments[1].facade = {
    style: "stone",
    color: "#d7d8c7",
    trim: "#bbc5bd",
    window: "#3d5d67",
    bandColor: "#bdc7bc",
    glazedBays: [{ u: 0, width: 3.2, projection: 0.2 }],
  };
  layout.buildings[8].segments[0].facade = {
    ...layout.buildings[8].facade,
    glazedBays: [{ u: 0, width: 12.5, projection: 0.15 }],
  };
  layout.buildings[7].segments[0].facade = {
    ...layout.buildings[7].facade,
    glazedBays: [{ u: 0, width: 3.6, projection: 0.2 }],
  };
  Object.assign(layout.field, { surface: "turf", color: "#497f58", height: 0 });
  Object.assign(layout.gate, {
    style: "piers",
    width: 9,
    height: 2.8,
    color: "#b1b3a6",
    sign: "한국과학영재학교",
    barrier: true,
  });
  layout.siteDetails = {
    retainingWalls: [
      { a: [-43, 10], b: [-5, 10], height: 2.1, color: "#9e9a87" },
      { a: [22, 13], b: [52, 13], height: 3.8, color: "#939887" },
      { a: [55, 27], b: [67, 27], height: 2.1, color: "#a5a491" },
      { a: [-42, -34], b: [-22, -34], height: 2.3, color: "#969587" },
      { a: [-43, 13.2], b: [-7, 13.2], height: 0.65, color: "#9d8974" },
    ],
    fences: [
      {
        points: [
          [-69, 19],
          [-69, 41],
          [-55, 41],
        ],
        height: 2.9,
        color: "#496a5d",
      },
      {
        points: [
          [-49, 18],
          [-49, 50],
          [9, 50],
        ],
        height: 1.7,
        color: "#58766a",
      },
    ],
    paths: [
      {
        points: [
          [37, 53],
          [32, 41],
          [21, 27],
          [14, 19],
        ],
        width: 5,
        kind: "road",
        color: "#a3a99b",
      },
      {
        points: [
          [20, 12],
          [39, 14],
          [58, 31],
          [67, 41],
        ],
        width: 4.4,
        kind: "road",
        color: "#a3a99b",
      },
      {
        points: [
          [9, 10],
          [-18, 10],
          [-42, 10],
          [-44, -16],
          [-37, -39],
        ],
        width: 2.2,
        kind: "walk",
        color: "#c8c5ae",
      },
      {
        points: [
          [-32, -16],
          [-18, -16],
          [-3, -16],
        ],
        width: 1.4,
        kind: "walk",
        color: "#cdbca2",
      },
    ],
  };
  layout.hills = [];
  layout.maxTrees = 74;
  layout.sources.aerialDiagram =
    "https://ksa.hs.kr/Content/images/content/schoolinfo/map_2017.jpg";
  layout.sources.checked = "2026-10-30";
}
