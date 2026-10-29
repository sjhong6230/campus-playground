// Footprints/solar parking from the public aerial view; Cheongmyeong facade
// from the actual photograph on the official facilities page.
export function refineCampus(layout) {
  const palettes = [
    ["brick", "#ae9678", "#d0cbb7", "#3b575a", "#bdbba5"],
    ["panel", "#c5c7b8", "#d9dace", "#3f5c64", "#a6b7ad"],
    ["render", "#c9c5b5", "#dee0d4", "#41606c", "#afb8ac"],
    ["brick", "#b29254", "#c8c6a8", "#335360", "#608d79"],
    ["brick", "#a38b72", "#c6bca6", "#3d5458", "#b5b49c"],
    ["render", "#bec1ad", "#d4d4be", "#3d6265", "#8eaaa0"],
  ];
  layout.buildings.forEach((b, i) => {
    const [style, color, trim, window, bandColor] = palettes[i];
    b.color = color;
    b.facade = { style, color, trim, window, bandColor };
    for (const s of b.segments) {
      if (!s.roof) s.roofColor = i === 3 ? "#63947c" : "#b8beb1";
      s.roofDetails = { parapet: !s.roof, equipment: false };
    }
  });
  // Aerial shows pitched roofs around the courtyard and a white flat research roof.
  for (const s of layout.buildings[0].segments.slice(2, 4))
    Object.assign(s, {
      roof: "gable",
      roofColor: "#81735d",
      roofDetails: { parapet: false, equipment: false },
    });
  layout.buildings[0].segments[1].roofColor = "#63917a";
  layout.buildings[3].segments[0].facade = {
    ...layout.buildings[3].facade,
    glazedBays: [
      { u: -8.5, width: 4.2, projection: 0.85 },
      { u: 2.8, width: 2.8, projection: 0.65 },
    ],
  };
  // Six solar-panel parking roofs form two ranks southeast of the dining hall.
  // Columns and roof are regular destructible school geometry, with no walls.
  layout.buildings.push({
    name: "태양광 주차 캐노피",
    x: 53,
    z: 27,
    floors: 1,
    baseY: 4,
    color: "#929e96",
    facade: {
      style: "panel",
      color: "#929e96",
      trim: "#a8b3ab",
      window: "#304a59",
    },
    segments: [22, 31].flatMap((z) =>
      [43, 53, 63].map((x) => ({
        x,
        z,
        w: 8,
        d: 6,
        angle: 0.07,
        floors: 1,
        openGroundFloor: true,
        roof: "flat",
        roofColor: "#294b60",
        roofDetails: { parapet: false, equipment: false },
      })),
    ),
  });
  Object.assign(layout.field, { surface: "dirt", color: "#b8a681", height: 1 });
  Object.assign(layout.gate, {
    style: "piers",
    width: 8.2,
    height: 2.4,
    color: "#acb3a9",
    sign: "인천과학고등학교",
    barrier: true,
  });
  layout.siteDetails = {
    retainingWalls: [
      { a: [-15, 11], b: [-16.7, 36], height: 1.7, color: "#9b9e8c" },
      { a: [14, -24], b: [25, -18], height: 1.8, color: "#a4a794" },
      { a: [40, -16], b: [62, -17.5], height: 1.5, color: "#9b9e8c" },
    ],
    fences: [
      {
        points: [
          [-65, 18],
          [-65, 38],
          [-53, 38],
        ],
        height: 2.3,
        color: "#507064",
      },
      {
        points: [
          [-47, 12],
          [-48.8, 38],
          [-19, 39],
        ],
        height: 1.6,
        color: "#597163",
      },
    ],
    paths: [
      {
        points: [
          [13, 43],
          [12, 20],
          [13, 17],
        ],
        width: 3.2,
        kind: "road",
        color: "#a0a598",
      },
      {
        points: [
          [-51, 42],
          [-52, 15],
          [-53, -6],
          [-47, -17],
          [-24, -21],
        ],
        width: 4,
        kind: "road",
        color: "#92998d",
      },
      {
        points: [
          [-14, 39],
          [-15, 11],
          [-17, -18],
        ],
        width: 1.8,
        kind: "walk",
        color: "#c9c5af",
      },
      {
        points: [
          [-7, -7],
          [14, -7],
          [28, -7],
          [40, -15],
          [53, -21],
        ],
        width: 1.4,
        kind: "walk",
        color: "#cfc4a8",
      },
      {
        points: [
          [33, 27],
          [38, 27],
          [68, 27],
        ],
        width: 3.1,
        kind: "road",
        color: "#90978e",
      },
    ],
  };
  // Remove trees inside the clearly visible solar parking apron.
  layout.trees = layout.trees.filter(
    ([x, z]) => !(x > 38 && x < 68 && z > 17 && z < 36),
  );
  layout.hills = [];
  layout.maxTrees = 68;
  layout.sources.dormPhoto =
    "https://i-science.icehs.kr/images/Facility/00610/3/1/1.jpg";
  layout.sources.checked = "2026-10-29";
}
