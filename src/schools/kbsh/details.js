export function addDetails(layout) {
  for (const [i, b] of layout.buildings.entries()) {
    b.facade = {
      style: i === 0 ? "panel" : "brick",
      color: b.color,
      trim: "#e5e7df",
      bandColor: "#bbc5c1",
      window: "#486d79",
    };
    for (const s of b.segments) s.roofDetails = { parapet: true };
  }
  // The long white classroom wing and orange dormitory have rooftop arrays.
  for (const s of [
    layout.buildings[0].segments[1],
    ...layout.buildings[1].segments,
  ])
    s.roofDetails.canopy = {
      u: 0,
      v: 0,
      w: s.w - 1.8,
      d: s.d - 1.8,
      height: 0.3,
      color: "#344f61",
    };
  layout.buildings[0].segments[2].facade = {
    ...layout.buildings[0].facade,
    glazedBays: [{ u: -10, width: 4, projection: 0.18 }],
  };
  Object.assign(layout.gate, {
    style: "piers",
    width: 9,
    height: 2.2,
    barrier: true,
    sign: "경북과학고등학교",
    color: "#d5d9d3",
  });
  layout.siteDetails = {
    paths: [
      {
        points: [
          [51, 48],
          [65, 37],
          [65, 9],
        ],
        width: 5.8,
        kind: "road",
      },
      {
        points: [
          [51, 44],
          [-36, 44],
          [-55, 37],
          [-55, 9],
        ],
        width: 3.4,
        kind: "road",
      },
      {
        points: [
          [-29, 7],
          [39, 7],
          [44, 15],
          [44, 38],
        ],
        width: 2.3,
        kind: "walk",
      },
    ],
    retainingWalls: [{ a: [-59, -47], b: [-59, 1], height: 2.1 }],
    fences: [
      {
        points: [
          [-20, 10],
          [-20, 43],
          [39, 43],
          [39, 10],
        ],
        height: 1.7,
      },
      {
        points: [
          [11, -47],
          [33, -47],
          [33, -33],
        ],
        height: 2.5,
      },
    ],
  };
}
