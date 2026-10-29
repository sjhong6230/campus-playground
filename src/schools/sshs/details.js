// Exterior/entrance refinements from the public aerial layout and June 2025
// entrance photograph. Dimensions remain normalized game units.
export function refineCampus(layout) {
  const palettes = [
    ["brick", "#a16f5c", "#d7d5c7", "#354c53", "#d6d2c3"],
    ["render", "#d4d6cb", "#8c9591", "#365560", "#afb8b3"],
    ["brick", "#ac8069", "#d2d3c9", "#345159", "#bdbdb2"],
    ["stone", "#bfc6c1", "#d8dcd5", "#395b65", "#a1b4b3"],
    ["panel", "#cbd0cb", "#b0bdb8", "#32515c", "#a4b3ae"],
    ["brick", "#ac8870", "#d4cbb8", "#3c5557", "#c9bba2"],
  ];
  layout.buildings.forEach((b, i) => {
    const [style, color, trim, window, bandColor] = palettes[i];
    b.color = color;
    b.facade = { style, color, trim, window, bandColor };
    for (const s of b.segments) {
      s.roofColor = i === 3 ? "#7d8b83" : "#7e8a79";
      s.roofDetails = { parapet: true, equipment: false };
    }
  });
  Object.assign(layout.field, { surface: "dirt", color: "#b09b77", height: 0 });
  Object.assign(layout.gate, {
    style: "open",
    width: 8.2,
    height: 2.6,
    color: "#a8ada8",
    sign: "서울과학고등학교",
    barrier: true,
  });
  layout.siteDetails = {
    // The upper teaching terrace drops toward the southern dirt field.
    retainingWalls: [
      { a: [-8, 20], b: [38, 14.5], height: 3.6, color: "#999b8c" },
      { a: [-34, -6], b: [-25, 6], height: 2.6, color: "#9a998c" },
    ],
    fences: [
      {
        points: [
          [-9, 53.5],
          [39, 53.5],
        ],
        height: 1.5,
        color: "#5c6d67",
      },
      {
        points: [
          [62, 28],
          [60, 51],
          [42, 56],
        ],
        height: 1.5,
        color: "#5c6d67",
      },
    ],
    paths: [
      {
        points: [
          [65, 17],
          [56, 16],
          [45, 10],
          [-13, 16],
        ],
        width: 5,
        kind: "road",
        color: "#969b96",
      },
      {
        points: [
          [42, 13],
          [29, 15],
          [12, 17],
          [-7, 19],
        ],
        width: 1.6,
        kind: "walk",
        color: "#c8bfa9",
      },
      {
        points: [
          [-17, -7],
          [-29, -13],
          [-42, -25],
        ],
        width: 2.2,
        kind: "walk",
        color: "#c7c3b4",
      },
    ],
  };
  layout.sources.entrance = "https://www.sedaily.com/NewsView/2GTZUDN97C";
  layout.sources.checked = "2026-10-29";
}
