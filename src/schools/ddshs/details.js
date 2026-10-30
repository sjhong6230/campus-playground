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
  const main = layout.buildings[0];
  main.facade.style = "panel";
  main.facade.trim = "#e5e1cf";
  main.segments[0].facade = {
    ...main.facade,
    glazedBays: [
      { u: -16, width: 3 },
      { u: 15, width: 3 },
    ],
  };
  layout.buildings[1].facade.style = "panel";
  Object.assign(layout.gate, {
    style: "piers",
    width: 8,
    height: 2,
    color: "#c7c4b5",
    sign: "대전동신과학고등학교",
    barrier: true,
  });
  layout.siteDetails = {
    paths: [
      {
        points: [
          [54, 49],
          [65, 37],
          [65, -32],
        ],
        width: 5,
        kind: "road",
      },
      {
        points: [
          [-54, -8],
          [18, -8],
        ],
        width: 3,
        kind: "walk",
      },
    ],
    retainingWalls: [{ a: [-51, -5], b: [17, -5], height: 1 }],
    fences: [
      {
        points: [
          [-54, 0],
          [-54, 39],
          [20, 39],
        ],
        height: 2,
      },
    ],
  };
}
