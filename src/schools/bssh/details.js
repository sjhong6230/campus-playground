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
  layout.buildings[4].facade.style = "panel";
  layout.buildings[4].facade.glazedBays = [{ u: 0, width: 9 }];
  for (const i of [1, 2, 3]) {
    const s = layout.buildings[i].segments[0];
    s.roofDetails.canopy = {
      u: 0,
      v: 0,
      w: 8,
      d: 27,
      height: 0.4,
      color: "#405b6a",
    };
  }
  Object.assign(layout.gate, {
    style: "piers",
    width: 8,
    height: 2,
    color: "#c7c4b5",
    sign: "부산과학고등학교",
    barrier: true,
  });
  layout.siteDetails = {
    paths: [
      {
        points: [
          [54, 51],
          [63, 38],
          [63, -29],
        ],
        width: 5,
        kind: "road",
      },
      {
        points: [
          [-58, 25],
          [44, 25],
          [51, 40],
        ],
        width: 3,
        kind: "walk",
      },
    ],
    retainingWalls: [{ a: [-58, 24], b: [50, 24], height: 2 }],
    fences: [
      {
        points: [
          [-63, -42],
          [-63, -23],
          [23, -23],
        ],
        height: 1.8,
      },
    ],
  };
}
