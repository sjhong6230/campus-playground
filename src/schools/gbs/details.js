export function addDetails(layout) {
  for (const [i, building] of layout.buildings.entries()) {
    building.facade = {
      style: i === 5 ? "panel" : "stone",
      color: building.color,
      trim: "#dfdfd3",
      window: i === 0 ? "#467f7a" : "#38555a",
      bandColor: i === 0 ? "#c4b99a" : "#aab6aa",
    };
    for (const segment of building.segments) {
      if (segment.roofColor === "#a7b9a6") segment.roofColor = "#5f8f79";
      segment.roofDetails = {
        parapet: segment.roof === "flat",
        equipment: false,
      };
    }
  }
  const main = layout.buildings[0].segments[0];
  main.facade = {
    ...layout.buildings[0].facade,
    glazedBays: [{ u: 0, width: 40, side: 1, projection: 0.18 }],
  };
  // Gold posts and a flat canopy above the wide green-glazed east elevation
  // are visible in the official homepage photograph; this is not an extra floor.
  main.roofDetails.canopy = {
    u: -1,
    v: 0,
    w: 22,
    d: 6.7,
    height: 2.2,
    color: "#b39b61",
  };
  for (const i of [1, 2]) {
    const wing = layout.buildings[i].segments[0];
    wing.facade = {
      ...layout.buildings[i].facade,
      glazedBays: [{ u: 10, width: 3.2, side: 1, projection: 0.15 }],
    };
  }
  Object.assign(layout.gate, {
    style: "piers",
    width: 9,
    height: 2.1,
    color: "#c7c8bb",
    sign: "경기북과학고등학교",
  });
  layout.siteDetails = {
    paths: [
      {
        points: [
          [59, -44],
          [10, -44],
          [10, 18],
          [8, 28],
          [8, 54],
        ],
        width: 4.2,
        kind: "road",
        color: "#989d94",
      },
      {
        points: [
          [-55, -45],
          [-57, 18],
          [-57, 52],
          [-45, 55],
          [8, 55],
          [53, 55],
          [58, 49],
          [58, -44],
        ],
        width: 3.7,
        kind: "road",
        color: "#8e978e",
      },
      {
        points: [
          [13, 20],
          [48.5, 20],
          [48.5, -39],
          [54, -42],
        ],
        width: 1.8,
        kind: "walk",
        color: "#c9c2a9",
      },
      {
        points: [
          [-46, -33],
          [-46, -9],
          [-16, -9],
          [-16, -17],
        ],
        width: 1.8,
        kind: "walk",
        color: "#c5bda5",
      },
      {
        points: [
          [-42, 9],
          [-42, 21],
          [-25, 21],
          [-25, 48],
          [5, 48],
        ],
        width: 1.7,
        kind: "walk",
        color: "#c7bfa7",
      },
      {
        points: [
          [-23, 27],
          [-10, 27],
          [-10, 37],
        ],
        width: 1.3,
        kind: "walk",
        color: "#beb69e",
      },
    ],
    retainingWalls: [
      { a: [15, -36], b: [15, 14], height: 1.5, color: "#a1aa99" },
      { a: [-52, -32], b: [-52, 13], height: 1.7, color: "#9ca38e" },
      { a: [-53, 48], b: [-5, 48], height: 0.8, color: "#a7ac98" },
    ],
    fences: [
      {
        points: [
          [49, -37],
          [49, 18],
          [17, 18],
        ],
        height: 2.2,
        color: "#4c6d5c",
      },
      {
        points: [
          [-40, 10],
          [-40, 20],
          [-14, 20],
        ],
        height: 2.2,
        color: "#4f7168",
      },
      // The present map labels this narrow enclosure as a golf practice area.
      {
        points: [
          [45, 24],
          [54, 24],
          [54, 44],
          [45, 44],
        ],
        height: 6,
        color: "#4e7568",
      },
    ],
  };
}
