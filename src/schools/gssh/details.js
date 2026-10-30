export function addDetails(layout) {
  for (const b of layout.buildings) {
    b.facade = {
      style: "brick",
      color: b.color,
      trim: "#d9cdb7",
      bandColor: "#d2bfa9",
      window: "#486e78",
    };
    for (const s of b.segments)
      if (s.roof === "flat") s.roofDetails = { parapet: true };
  }
  layout.buildings[1].facade = {
    ...layout.buildings[1].facade,
    style: "panel",
    glazedBays: [{ u: 0, width: 10 }],
  };
  layout.buildings[0].facade.glazedBays = [{ u: 0, width: 5 }];
  layout.buildings[2].segments[0].roofDetails.canopy = {
    u: 0,
    v: -8,
    w: 11,
    d: 17,
    height: 0.9,
    color: "#91b8c5",
  };
  layout.buildings[3].facade.bandColor = "#57a1a0";
  Object.assign(layout.gate, {
    style: "piers",
    width: 9,
    height: 2.3,
    color: "#d3c7ac",
    sign: "경산과학고등학교",
    barrier: true,
  });
  layout.siteDetails = {
    paths: [
      {
        points: [
          [9, 53],
          [9, 32],
          [13, 16],
          [13, -2],
        ],
        width: 5,
        kind: "road",
        color: "#aaa995",
      },
      {
        points: [
          [-65, 47],
          [-40, 47],
          [9, 32],
        ],
        width: 4,
        kind: "road",
      },
      {
        points: [
          [-4, -29],
          [28, -29],
          [28, 0],
        ],
        width: 2.5,
        kind: "walk",
      },
      {
        points: [
          [0, -3],
          [27, -3],
        ],
        width: 2.2,
        kind: "walk",
      },
    ],
    retainingWalls: [{ a: [-40, -39], b: [-40, 7], height: 1 }],
    fences: [
      {
        points: [
          [-71, -39],
          [-71, 8],
          [-42, 8],
        ],
        height: 1.7,
      },
    ],
  };
}
