export function addDetails(layout) {
  for (const building of layout.buildings) {
    building.facade = {
      style: "brick",
      color: building.color,
      trim: "#e0d8cb",
      window: "#547e87",
      bandColor: "#d3bba6",
    };
    for (const segment of building.segments)
      if (segment.roof === "flat") segment.roofDetails = { parapet: true };
  }
  layout.buildings[0].segments[1].facade = {
    ...layout.buildings[0].facade,
    glazedBays: [{ u: -10, width: 3.5 }],
  };
  layout.buildings[1].facade.style = "stone";
  layout.buildings[3].facade.glazedBays = [{ u: 0, width: 3.5 }];
  layout.buildings[4].facade = {
    ...layout.buildings[4].facade,
    style: "panel",
    glazedBays: [{ u: 0, width: 14 }],
  };
  layout.buildings[5].facade = {
    ...layout.buildings[5].facade,
    style: "panel",
    trim: "#447ca3",
    bandColor: "#aab8bb",
  };
  layout.buildings[5].segments[0].roofDetails.canopy = {
    u: 0,
    v: 0,
    w: 11,
    d: 18,
    height: 1.1,
    color: "#6e8a9a",
  };
  Object.assign(layout.gate, {
    style: "open",
    width: 9,
    sign: "경남과학고등학교",
    barrier: true,
  });
  layout.siteDetails = {
    paths: [
      {
        points: [
          [-42, 54],
          [-42, 35],
          [-30, 4],
          [19, -2],
          [54, -2],
        ],
        width: 4,
        kind: "road",
        color: "#b59482",
      },
      {
        points: [
          [-64, 48],
          [-64, -51],
        ],
        width: 4,
        kind: "road",
      },
      {
        points: [
          [12, -20],
          [25, -20],
          [25, -3],
        ],
        width: 2.5,
        kind: "walk",
        color: "#c8b6a2",
      },
      {
        points: [
          [-29, 1],
          [-29, 43],
        ],
        width: 2.5,
        kind: "walk",
      },
    ],
    retainingWalls: [{ a: [-23, 3], b: [50, 3], height: 1.5 }],
    fences: [
      {
        points: [
          [-21, 46],
          [49, 46],
        ],
        height: 1.3,
      },
    ],
  };
}
