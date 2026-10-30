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
  layout.buildings[0].facade.trim = "#d9a052";
  layout.buildings[0].facade.bandColor = "#d2c4a2";
  layout.buildings[0].segments[0].roofColor = "#8a9b80";
  layout.buildings[1].facade.glazedBays = [{ u: 3, width: 6 }];
  Object.assign(layout.gate, {
    style: "piers",
    width: 8,
    height: 2,
    color: "#c7c4b5",
    sign: "선덕고등학교",
    barrier: true,
  });
  layout.siteDetails = {
    paths: [
      {
        points: [
          [52, 51],
          [56, 32],
          [56, -28],
        ],
        width: 5,
        kind: "road",
      },
      {
        points: [
          [-54, 3],
          [43, 3],
        ],
        width: 2.5,
        kind: "walk",
      },
    ],
    retainingWalls: [{ a: [-43, 6], b: [36, 6], height: 2.8 }],
    fences: [
      {
        points: [
          [-46, 9],
          [-46, 44],
          [38, 44],
        ],
        height: 1.6,
      },
    ],
  };
}
