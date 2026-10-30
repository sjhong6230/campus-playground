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
  for (const b of layout.buildings) b.facade.style = "panel";
  layout.buildings[0].facade.glazedBays = [
    { u: -25, width: 4 },
    { u: 25, width: 4 },
  ];
  layout.buildings[0].segments[0].roofDetails.canopy = {
    u: 0,
    v: 0,
    w: 52,
    d: 8,
    height: 0.4,
    color: "#395f74",
  };
  layout.buildings[1].facade.glazedBays = [{ u: 0, width: 12 }];
  Object.assign(layout.gate, {
    style: "piers",
    width: 8,
    height: 2,
    color: "#c7c4b5",
    sign: "창원과학고등학교",
    barrier: true,
  });
  layout.siteDetails = {
    paths: [
      {
        points: [
          [52, 51],
          [69, 37],
          [69, -37],
        ],
        width: 5,
        kind: "road",
      },
      {
        points: [
          [-64, 0],
          [56, 0],
        ],
        width: 3,
        kind: "walk",
      },
    ],
    retainingWalls: [{ a: [-35, -35], b: [35, -35], height: 2.4 }],
    fences: [
      {
        points: [
          [-41, 4],
          [-41, 40],
          [41, 40],
        ],
        height: 1.8,
      },
    ],
  };
}
