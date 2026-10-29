// Official exterior image resolves the newer panel-clad main block and canopy.
export function addDetails(layout) {
  const materials = [
    ["panel", "#d5d9d5", "#a7b4ae", "#e7e9e1"],
    ["brick", "#a77865", "#c5c8bc", "#d8d7c9"],
    ["brick", "#b49b80", "#beb9a8", "#ddd7c7"],
    ["render", "#cba78a", "#a2aaa3", "#e0dbcc"],
    ["panel", "#d4d4c6", "#aeb9b0", "#e1e1d6"],
  ];
  layout.buildings.forEach((b, i) => {
    const [style, color, trim, bandColor] = materials[i];
    b.color = color;
    b.facade = { style, color, trim, bandColor, window: "#577b7d" };
    b.segments.forEach((s) => {
      if (!s.roof || s.roof === "flat") s.roofDetails = { parapet: true };
    });
  });
  const main = layout.buildings[0].segments[0];
  main.roofColor = "#b5bdb7";
  main.roofDetails.canopy = {
    u: 0,
    v: 0,
    w: 10.8,
    d: 34,
    height: 1.8,
    color: "#e0e3dc",
  };
  layout.gate = {
    ...layout.gate,
    style: "piers",
    width: 8.5,
    height: 2.2,
    color: "#c3c5bc",
    sign: "대구과학고등학교",
  };
  layout.siteDetails = {
    retainingWalls: [
      { a: [-34, -47], b: [-34, -9], height: 2.8, color: "#9b9b8c" },
      { a: [-20, 17], b: [-20, 49], height: 1.6, color: "#aaa797" },
    ],
    fences: [
      {
        points: [
          [-41, -52],
          [-41, 53],
          [30, 53],
          [32, -45],
        ],
        height: 1.7,
        color: "#728078",
      },
      {
        points: [
          [-7, -47],
          [20, -47],
          [20, -11],
        ],
        height: 2.8,
        color: "#6c8074",
      },
    ],
    paths: [
      {
        points: [
          [-46, -57],
          [30, -57],
          [31, -47],
          [25, -45],
        ],
        width: 4.6,
        kind: "road",
        color: "#858b87",
      },
      {
        points: [
          [-38, -50],
          [-38, 52],
          [20, 52],
          [25, 31],
        ],
        width: 3.5,
        kind: "road",
        color: "#93988b",
      },
      {
        points: [
          [-11, -48],
          [-11, -8],
          [29, -8],
          [29, 26],
          [19, 47],
        ],
        width: 2.1,
        kind: "walk",
        color: "#c2bdab",
      },
    ],
  };
  layout.sources.checked = "2026-10-29";
  layout.sources.photos =
    "https://dshs.dge.hs.kr/upload/schl/dshsh/widg/M_visual.png";
  return layout;
}
