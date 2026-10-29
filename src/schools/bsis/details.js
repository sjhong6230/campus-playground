export function addDetails(layout) {
  for (const [i, building] of layout.buildings.entries()) {
    building.facade = {
      style: "panel",
      color: building.color,
      trim: "#e0e4dc",
      window: "#355b66",
      bandColor: i < 4 ? "#8faaa5" : "#b6b9a8",
    };
    for (const segment of building.segments) {
      if (segment.roofColor === "#a7b9a6") segment.roofColor = "#bec8c3";
      segment.roofDetails = { parapet: true, equipment: false };
    }
  }
  // The three long blue arrays are visible in both 2022 and current imagery.
  for (const i of [2, 4, 5]) {
    const segment = layout.buildings[i].segments[0];
    segment.roofDetails.canopy = {
      u: 0,
      v: 0,
      w: segment.w - 2,
      d: segment.d - 2,
      height: 0.45,
      color: "#355c72",
    };
  }
  layout.buildings[0].segments[0].facade = {
    ...layout.buildings[0].facade,
    glazedBays: [
      { u: -11, width: 3.5, projection: 0.35 },
      { u: 11, width: 3.5, projection: 0.35 },
    ],
  };
  const gym = layout.buildings[6];
  gym.segments[0].facade = {
    ...gym.facade,
    window: "#425d61",
    bandColor: "#bfc7c2",
    glazedBays: [
      { u: 0, width: 13.8, side: 1, projection: 0.12 },
      { u: 0, width: 13.8, side: -1, projection: 0.12 },
    ],
  };
  gym.segments[0].roofDetails.equipment = true;
  Object.assign(layout.gate, {
    style: "piers",
    width: 8,
    height: 2.6,
    color: "#c2c9be",
    sign: "부산일과학고등학교",
    barrier: true,
    guardhouse: { u: 6, v: -2, w: 3.4, d: 3, height: 2.6, color: "#c8cfc5" },
  });
  layout.siteDetails = {
    paths: [
      {
        points: [
          [5, 58],
          [10, 52],
          [10, 44],
          [10, 20],
          [14, 12],
        ],
        width: 4.5,
        kind: "road",
        color: "#8c9690",
      },
      {
        points: [
          [10, 52],
          [-24, 53],
          [-37, 45],
          [-38, 24],
          [-36, 14],
          [-29, 2],
          [-27, -29],
          [-22, -48],
        ],
        width: 3.4,
        kind: "road",
        color: "#a99d88",
      },
      {
        points: [
          [35, 42],
          [35, 7],
          [36, -32],
          [33, -55],
          [-18, -55],
        ],
        width: 2.4,
        kind: "walk",
        color: "#bdaf96",
      },
      {
        points: [
          [-31, 13],
          [-9, 13],
          [5, 13],
        ],
        width: 2,
        kind: "walk",
        color: "#d0cab5",
      },
      {
        points: [
          [-22, -7],
          [-15, -3],
          [-4, -3],
          [-1, -12],
        ],
        width: 1.3,
        kind: "walk",
        color: "#c6b79b",
      },
    ],
    retainingWalls: [
      { a: [-33, 15], b: [3, 15], height: 1.5, color: "#a7ad9d" },
      { a: [-37, 44], b: [-37, 20], height: 2, color: "#8e9886" },
      { a: [35, 44], b: [35, 17], height: 2.5, color: "#9da694" },
      { a: [-21, -54], b: [32, -54], height: 1.5, color: "#9aa48f" },
    ],
    fences: [
      {
        points: [
          [-34, 17],
          [-34, 43],
          [4, 43],
        ],
        height: 2.4,
        color: "#4d7163",
      },
      {
        points: [
          [-18, -43],
          [-18, -54],
          [32, -54],
          [32, -42],
        ],
        height: 2.7,
        color: "#507363",
      },
    ],
  };
}
