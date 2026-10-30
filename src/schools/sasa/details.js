export function addDetails(layout) {
  for (const [i, b] of layout.buildings.entries()) {
    b.facade = {
      style: i === 1 ? "panel" : "brick",
      color: b.color,
      trim: "#f0eee3",
      bandColor: "#e4e1d2",
      window: "#456b76",
    };
    for (const s of b.segments)
      if (s.roof === "flat") s.roofDetails = { parapet: true };
  }
  layout.buildings[0].segments[0].facade = {
    ...layout.buildings[0].facade,
    glazedBays: [{ u: 20, width: 3.5, projection: 0.12 }],
  };
  // A modest rooftop observatory enclosure, not an invented large hemisphere.
  layout.buildings[0].segments[2].roofDetails.canopy = {
    u: 0,
    v: 0,
    w: 5,
    d: 8,
    height: 1.3,
    color: "#b4c7c9",
  };
  layout.buildings[1].segments[0].roofDetails.canopy = {
    u: 0,
    v: 0,
    w: 11,
    d: 7,
    height: 0.35,
    color: "#b6bfb8",
  };
  Object.assign(layout.gate, {
    style: "piers",
    width: 8.5,
    height: 2.4,
    barrier: true,
    sign: "세종과학예술영재학교",
    color: "#deded4",
  });
  layout.siteDetails = {
    paths: [
      {
        points: [
          [51, 48],
          [51, 4],
          [36, -1],
        ],
        width: 5.6,
        kind: "road",
        color: "#a7776c",
      },
      {
        points: [
          [-52, 48],
          [-52, -42],
        ],
        width: 3.5,
        kind: "road",
      },
      {
        points: [
          [-44, 10],
          [19, 10],
          [22, 46],
        ],
        width: 2.2,
        kind: "walk",
      },
      {
        points: [
          [-35, 0],
          [-35, 10],
        ],
        width: 2,
        kind: "walk",
      },
      {
        points: [
          [3, -4],
          [3, 10],
        ],
        width: 2,
        kind: "walk",
      },
    ],
    retainingWalls: [{ a: [-44, 12], b: [16, 12], height: 1.2 }],
    fences: [
      {
        points: [
          [-47, 13],
          [-47, 46],
          [19, 46],
        ],
        height: 1.8,
      },
    ],
  };
}
