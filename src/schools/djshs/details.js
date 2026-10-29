// Facade/entrance observations: docs/sources/djshs.txt.
export function addDetails(layout) {
  const materials = [
    ["brick", "#c1a786", "#a4a99f", "#deded3"],
    ["brick", "#baa087", "#abb7aa", "#ddd7c8"],
    ["brick", "#ae7f6c", "#a4aaa1", "#dfdfd4"],
    ["panel", "#d6d7cc", "#a7b4a8", "#e1e4d9"],
    ["brick", "#aa7969", "#b0b4aa", "#e1ded3"],
    ["brick", "#a87869", "#aeb7ab", "#e2e0d7"],
  ];
  layout.buildings.forEach((b, i) => {
    const [style, color, trim, bandColor] = materials[i];
    b.color = color;
    b.facade = { style, color, trim, bandColor, window: "#687e7b" };
    b.segments.forEach((s) => {
      if (!s.roof || s.roof === "flat") s.roofDetails = { parapet: true };
    });
  });
  layout.buildings[0].segments[0].roofDetails.canopy = {
    u: -12,
    v: 0,
    w: 33,
    d: 7.5,
    height: 1.7,
    color: "#cbd4ce",
  };
  layout.gate = {
    ...layout.gate,
    style: "piers",
    width: 8.4,
    height: 2.5,
    color: "#b7b6aa",
    sign: "대전과학고등학교",
  };
  layout.siteDetails = {
    retainingWalls: [
      { a: [53, -37], b: [53, 44], height: 1.3, color: "#a5a697" },
    ],
    fences: [
      {
        points: [
          [-58, -43],
          [55, -43],
          [55, 49],
          [-48, 49],
        ],
        height: 1.8,
        color: "#687b6c",
      },
      {
        points: [
          [-59, 38],
          [-59, -39],
        ],
        height: 1.6,
        color: "#718175",
      },
    ],
    paths: [
      {
        points: [
          [-55, -44],
          [-55, 43],
          [-33, 43],
        ],
        width: 3.8,
        kind: "road",
        color: "#92988e",
      },
      {
        points: [
          [-32, 10],
          [16, 10],
          [17, 48],
          [-32, 48],
        ],
        width: 2.4,
        kind: "walk",
        color: "#bcb9a4",
      },
      {
        points: [
          [-31, -14],
          [33, -14],
        ],
        width: 3,
        kind: "walk",
        color: "#c5c2b1",
      },
      {
        points: [
          [-30, 43],
          [-30, 12],
        ],
        width: 2.2,
        kind: "walk",
        color: "#c1bea8",
      },
    ],
  };
  layout.sources.checked = "2026-10-29";
  layout.sources.photos =
    "https://commons.wikimedia.org/wiki/File:대전과학고등학교_탐의관_전경_(Daejeon_Science_Highschool_Tamui_building).jpg";
  return layout;
}
