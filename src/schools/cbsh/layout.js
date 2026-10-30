import { segment as s, building as b, finishLayout } from "../shared/layout.js";

// Post-modernization aerials (2024/2025); game distances and compass alignment are approximate.
export function createLayout() {
  const layout = {
    sources: {
      official: "https://school.cbe.go.kr/cbs-h/",
      history: "https://school.cbe.go.kr/cbs-h/M010202/",
      photos: "https://www.fnnews.com/news/202401010959422450",
      recentPhoto: "https://www.inews365.com/news/article.html?no=870985",
      checked: "2026-10-30",
    },
    buildings: [
      b("본관", 4, 6, "#d4d8d2", [
        s(6, -26, 18, 15),
        s(20, -26, 10, 17, { color: "#d88d47" }),
        s(34, -26, 18, 15),
      ]),
      b("실험동 · 천문대", 3, 6, "#cdd5d3", [
        s(-18, -29, 30, 14, { roofColor: "#acb9b6" }),
      ]),
      b("사름학사", 4, 6, "#d7dbd3", [
        s(-46, -26, 26, 15, { roofColor: "#a9b7b4" }),
      ]),
      b("청운학사", 3, 3, "#d5d5c9", [
        s(-51, 6, 21, 23, { roofColor: "#af8f77" }),
      ]),
      b("창의융합동", 3, 6, "#d8d4ca", [
        s(55, -26, 24, 17, { roofColor: "#9eaaa6" }),
      ]),
    ],
    links: [],
    observatory: {
      x: -23,
      z: -29,
      y: 15.25,
      building: 1,
      radius: 3,
      color: "#c5d1cd",
    },
    field: { ...s(7, 9, 65, 36), height: 3, surface: "turf", color: "#8fa36d" },
    tennis: { ...s(44, 45, 47, 16), height: 0 },
    courtKind: "tennis",
    gate: {
      x: -63,
      z: 45,
      angle: 0,
      style: "piers",
      width: 8,
      sign: "충북과학고등학교",
    },
    parking: { x: -11, z: 44, angle: 0 },
    benches: [
      [-29, 3],
      [-29, 18],
      [2, -13],
      [32, -13],
    ],
    trees: [
      ...Array.from({ length: 17 }, (_, i) => [-68 + i * 8.5, -52]),
      ...Array.from({ length: 10 }, (_, i) => [-69, -44 + i * 10]),
      ...Array.from({ length: 8 }, (_, i) => [-26 + i * 10, 29]),
      [-35, 30],
      [-47, 26],
      [-50, 38],
      [68, -33],
      [69, -17],
      [61, 3],
      [58, 19],
      [-55, -43],
      [-37, -44],
      [-6, -44],
      [17, -44],
      [40, -44],
    ],
    maxTrees: 47,
    hills: [
      [-49, -57],
      [-7, -59],
      [46, -58],
    ],
    siteDetails: {
      paths: [
        {
          points: [
            [-63, 51],
            [-63, 28],
            [-34, 28],
            [-34, -13],
            [54, -13],
            [56, 24],
          ],
          width: 3,
          kind: "road",
        },
        {
          points: [
            [-57, 45],
            [13, 45],
            [13, 33],
            [68, 33],
          ],
          width: 2.5,
          kind: "walk",
        },
      ],
      retainingWalls: [
        { a: [-26, 30], b: [24, 30], height: 3.2 },
        { a: [34, 30], b: [51, 30], height: 3.2 },
      ],
      fences: [
        {
          points: [
            [19, 35],
            [69, 35],
            [69, 55],
            [19, 55],
            [19, 35],
          ],
          height: 2.6,
          color: "#668e79",
        },
      ],
      stairs: [
        {
          x: 20,
          z: -13.25,
          angle: 0,
          width: 8,
          depth: 8.5,
          count: 8,
          upperY: 6,
          lowerY: 3,
          color: "#bcc2b9",
        },
        {
          x: 29,
          z: 32,
          angle: 0,
          width: 6,
          depth: 8,
          count: 8,
          upperY: 3,
          lowerY: 0,
          color: "#b7b9a9",
        },
      ],
    },
  };
  layout.buildings.forEach((building) => {
    building.facade = {
      style: "panel",
      color: building.color,
      trim: "#ebebe0",
      window: "#677f82",
      bandColor: "#b6c3c0",
    };
    building.segments.forEach((segment) => {
      segment.roofDetails = { parapet: true };
      if (segment.color)
        segment.facade = {
          ...building.facade,
          color: segment.color,
          glazedBays: [{ u: 0, width: 5 }],
        };
    });
  });
  layout.buildings[1].facade.bandColor = "#cc945e";
  layout.buildings[2].facade.bandColor = "#e2b767";
  layout.buildings[3].facade.trim = "#cc935d";
  layout.buildings[4].segments[0].roofDetails.canopy = {
    u: 0,
    v: 0,
    w: 21,
    d: 12,
    height: 1.1,
    color: "#596d7b",
  };
  finishLayout(layout, (x, z) => Math.max(0, Math.min(6, (35 - z) * 0.18)));
  const elevationAt = layout.elevationAt;
  layout.elevationAt = (x, z) => {
    for (const stair of layout.siteDetails.stairs)
      if (
        Math.abs(x - stair.x) < stair.width / 2 &&
        Math.abs(z - stair.z) < stair.depth / 2
      )
        return stair.lowerY;
    return elevationAt(x, z);
  };
  return layout;
}
