export function addDetails(layout) {
  for (const b of layout.buildings) {
    b.facade = {
      style: "render",
      color: b.color,
      trim: "#e6e2d6",
      bandColor: "#dbd5c9",
      window: "#426977",
    };
    for (const s of b.segments) {
      if (s.color) s.facade = { ...b.facade, color: s.color };
      if (s.roof === "flat") s.roofDetails = { parapet: true };
    }
  }
  layout.buildings[0].segments[0].facade = {
    ...layout.buildings[0].facade,
    glazedBays: [{ u: 0, width: 8 }],
  };
  layout.buildings[1].facade.style = "panel";
  layout.buildings[2].facade.style = "panel";
  Object.assign(layout.gate, {
    style: "piers",
    width: 8,
    height: 2,
    color: "#7d837b",
    sign: "제주과학고등학교",
    barrier: true,
  });
  layout.siteDetails = {
    paths: [
      {
        points: [
          [53, 52],
          [63, 34],
          [63, -29],
        ],
        width: 5,
        kind: "road",
      },
      {
        points: [
          [-62, 17],
          [42, 17],
        ],
        width: 3,
        kind: "walk",
      },
      {
        points: [
          [17, 14],
          [17, -11],
        ],
        width: 3,
        kind: "walk",
      },
    ],
    retainingWalls: [
      { a: [-37, 19], b: [39, 19], height: 0.8, color: "#83877b" },
    ],
    fences: [
      {
        points: [
          [-38, 22],
          [-38, 47],
          [40, 47],
        ],
        height: 1.5,
      },
    ],
  };
}
