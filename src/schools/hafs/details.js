export function addDetails(layout) {
  for (const b of layout.buildings) {
    b.facade = {
      style: "brick",
      color: b.color,
      trim: "#d9d7cb",
      bandColor: "#cecbbc",
      window: "#547781",
    };
    for (const s of b.segments)
      if (s.roof === "flat") s.roofDetails = { parapet: true };
  }
  for (const b of layout.buildings) b.facade.style = "stone";
  layout.buildings[0].facade.glazedBays = [
    { u: -9, width: 5 },
    { u: 16, width: 4 },
  ];
  layout.buildings[1].facade.glazedBays = [{ u: 0, width: 4 }];
  layout.buildings[3].facade.glazedBays = [{ u: 0, width: 5 }];
  Object.assign(layout.gate, {
    style: "piers",
    width: 8,
    height: 2,
    color: "#c7c4b5",
    sign: "용인한국외국어대학교부설고등학교",
    barrier: true,
  });
  layout.siteDetails = {
    paths: [
      {
        points: [
          [20, 51],
          [33, 43],
          [33, 10],
        ],
        width: 5,
        kind: "road",
      },
      {
        points: [
          [-31, 25],
          [0, 25],
          [0, 2],
        ],
        width: 2.6,
        kind: "walk",
      },
    ],
    retainingWalls: [{ a: [-38, -48], b: [35, -48], height: 1.3 }],
    fences: [
      {
        points: [
          [-66, 5],
          [-66, 44],
          [-39, 44],
        ],
        height: 2.3,
      },
    ],
  };
}
