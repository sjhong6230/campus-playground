// Visual observations and confidence notes: docs/sources/gsa.txt.
export function addDetails(layout) {
  const materials = [
    ["brick", "#b78972", "#b6a083", "#e1dfd5"],
    ["brick", "#b3957c", "#a79a86", "#deded3"],
    ["panel", "#d9dcd7", "#b9ad8b", "#ebede7"],
    ["brick", "#bd9983", "#b4aa91", "#dfdfd6"],
    ["brick", "#bd9983", "#b4aa91", "#dfdfd6"],
    ["panel", "#d7d9d1", "#a1aca8", "#e8e8df"],
  ];
  layout.buildings.forEach((b, i) => {
    const [style, color, trim, bandColor] = materials[i];
    b.color = color;
    b.facade = { style, color, trim, bandColor, window: "#657c7d" };
    b.segments.forEach((s) => {
      if (s.roof === "flat") s.roofDetails = { parapet: true };
    });
  });
  const fp = (u, v) => {
    const p = layout.point(layout.field, u, v);
    return [p.x, p.z];
  };
  const cp = (u, v) => {
    const p = layout.point(layout.tennis, u, v);
    return [p.x, p.z];
  };
  layout.gate = {
    ...layout.gate,
    style: "piers",
    width: 9,
    height: 2.1,
    color: "#c2c2b5",
    sign: "광주과학고등학교",
  };
  layout.siteDetails = {
    // Place the face inside the field-side toe of the existing smooth embankment.
    retainingWalls: [
      { a: fp(-25, -16.6), b: fp(25, -16.6), height: 2.4, color: "#99998d" },
      { a: fp(-26.6, -15), b: fp(-26.6, 14), height: 2.1, color: "#a3a292" },
    ],
    fences: [
      {
        points: [
          [-55, -25],
          [-51, -35],
          [28, -55],
          [54, 23],
        ],
        height: 1.6,
        color: "#6d7c74",
      },
      { points: [fp(-26, 16.5), fp(24, 16.5)], height: 2.3, color: "#718177" },
    ],
    paths: [
      {
        points: [
          fp(-29.5, 16),
          fp(-29.5, -20),
          [-55, -25],
          [28, -56],
          [57, 25],
          [30, 36],
        ],
        width: 3.6,
        kind: "road",
        color: "#858c86",
      },
      {
        points: [[26, 38], cp(-13, -6), cp(13, -6), [1, -23], [-4, -39]],
        width: 2.5,
        kind: "walk",
        color: "#c1bda9",
      },
      {
        points: [fp(-24, -19.3), fp(24, -19.3)],
        width: 2,
        kind: "walk",
        color: "#c5c2af",
      },
    ],
  };
  layout.sources.checked = "2026-10-29";
  layout.sources.photos = "https://gsa.jge.hs.kr/main/main.php";
  return layout;
}
