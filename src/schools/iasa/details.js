import { sitePoint } from "./layout.js";

const p = (u, v) => {
  const q = sitePoint(u, v);
  return [q.x, q.z];
};
const route = (points, width, kind, color) => ({
  points: points.map(([u, v]) => p(u, v)),
  width,
  kind,
  color,
});

export function addDetails(layout) {
  for (const building of layout.buildings) {
    building.facade = {
      style: "panel",
      color: building.color,
      trim: "#e3e5dd",
      window: "#466774",
      bandColor: "#a3aaa2",
    };
    for (const segment of building.segments) {
      segment.roofDetails = { parapet: true, equipment: false };
      if (segment.roofColor === "#a7b9a6") segment.roofColor = "#c6ccc5";
    }
  }
  const main = layout.buildings[0];
  main.segments[0].facade = {
    ...main.facade,
    glazedBays: [{ u: -14, width: 2.5, projection: 0.25 }],
  };
  main.segments[1].facade = {
    ...main.facade,
    color: "#b59669",
    bandColor: "#b59669",
    glazedBays: [{ u: 2.6, width: 2.3, projection: 0.3 }],
  };
  // Dark rooftop arrays visible in the current satellite image, excluding the hall roof.
  for (const [b, s] of [
    [0, 0],
    [0, 1],
    [2, 0],
    [2, 1],
    [4, 0],
    [4, 1],
  ]) {
    const segment = layout.buildings[b].segments[s];
    segment.roofDetails.canopy = {
      u: 0,
      v: 0,
      w: segment.w - 1.2,
      d: segment.d - 1.2,
      height: 0.35,
      color: "#3d5969",
    };
  }
  layout.buildings[1].segments[0].roofDetails.canopy = {
    u: -2.2,
    v: 0,
    w: 11.5,
    d: 8,
    height: 0.35,
    color: "#3d5969",
  };
  const gym = layout.buildings[3];
  gym.facade = {
    ...gym.facade,
    color: "#c8ceca",
    bandColor: "#a4b3b0",
    window: "#6b7e81",
  };
  layout.buildings[4].segments[0].facade = {
    ...layout.buildings[4].facade,
    glazedBays: [{ u: 2.7, width: 2.2, projection: 0.2 }],
  };
  Object.assign(layout.gate, {
    style: "piers",
    width: 8,
    height: 1.8,
    color: "#ddd8c8",
    sign: "인천과학예술영재학교",
  });
  layout.siteDetails = {
    paths: [
      route(
        [
          [-48, -29],
          [-48, 33],
        ],
        5.8,
        "road",
        "#8e9693",
      ),
      route(
        [
          [-48, 33],
          [55, 33],
        ],
        5.8,
        "road",
        "#8e9693",
      ),
      route(
        [
          [-44, -33],
          [54, -33],
        ],
        4,
        "road",
        "#939c97",
      ),
      route(
        [
          [-43, 5],
          [-37, 5],
          [-37, -7],
          [-39, -26],
        ],
        3.2,
        "road",
        "#b7b9aa",
      ),
      route(
        [
          [-43, 5],
          [-35, 5],
          [-31, 1],
          [-23, 1],
        ],
        3.4,
        "walk",
        "#d0c9b7",
      ),
      route(
        [
          [-36, 15],
          [-35, 25],
          [-19, 27],
          [25, 27],
        ],
        1.8,
        "walk",
        "#c8bfaa",
      ),
      route(
        [
          [26, 26],
          [26, -12],
          [28, -25],
        ],
        1.8,
        "walk",
        "#cfc7b4",
      ),
      route(
        [
          [0, -31],
          [0, -21],
          [-3, -16],
        ],
        2.5,
        "walk",
        "#c9c1ac",
      ),
      route(
        [
          [-12, 3],
          [-5, 3],
          [-2, 1],
          [2, 1],
        ],
        1.3,
        "walk",
        "#d7d0bd",
      ),
    ],
    retainingWalls: [],
    fences: [
      {
        points: [
          [28, -13],
          [55, -13],
          [55, 25],
          [28, 25],
        ].map(([u, v]) => p(u, v)),
        height: 1.7,
        color: "#71857a",
      },
      {
        points: [
          [33, -31],
          [45, -31],
          [45, -15],
        ].map(([u, v]) => p(u, v)),
        height: 2.8,
        color: "#5d7e73",
      },
      {
        points: [
          [-44, 12],
          [-44, 30],
          [54, 30],
        ].map(([u, v]) => p(u, v)),
        height: 1,
        color: "#929b89",
      },
    ],
  };
}
