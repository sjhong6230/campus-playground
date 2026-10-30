export function addDetails(layout) {
  const frame = { x: 0, z: 0, angle: 0.9 };
  const p = (u, v) => {
    const q = layout.point(frame, u, v);
    return [q.x, q.z];
  };
  const materials = [
    ["render", "#d7d9cc", "#a7b4a8", "#e8e8df"],
    ["render", "#dddccd", "#a2aaa0", "#efeee1"],
    ["panel", "#cdd0c2", "#9eafa4", "#e3e3d7"],
    ["render", "#c6c6b6", "#99a797", "#dbdcd0"],
    ["render", "#c5ceba", "#96a794", "#dde1d2"],
    ["panel", "#d4d7cb", "#a1b4aa", "#e6e8de"],
  ];
  layout.buildings.forEach((b, i) => {
    const [style, color, trim, bandColor] = materials[i];
    b.color = color;
    b.facade = { style, color, trim, bandColor, window: "#5f7d78" };
    b.segments.forEach((s) => {
      if (!s.roof || s.roof === "flat") s.roofDetails = { parapet: true };
    });
  });
  layout.gate = {
    ...layout.gate,
    style: "piers",
    width: 7.5,
    height: 2.2,
    color: "#b8b8ab",
    sign: "한성과학고등학교",
  };
  layout.siteDetails = {
    retainingWalls: [
      { a: p(-22.5, 25), b: p(8, 25), height: 6.8, color: "#a1a18f" },
      { a: p(10, 2), b: p(10, 23), height: 4.7, color: "#a5a492" },
      { a: p(-24, -1), b: p(-24, 23), height: 8.6, color: "#aaa795" },
    ],
    fences: [
      {
        points: [p(-22, 24), p(9, 24), p(9, -1)],
        height: 2.1,
        color: "#758171",
      },
      {
        points: [p(-53, -31), p(49, -31), p(53, -19), p(53, 32)],
        height: 1.6,
        color: "#768371",
      },
      {
        points: [p(13.5, 20.5), p(13.5, 30), p(32.5, 30)],
        height: 2.3,
        color: "#6c8070",
      },
    ],
    paths: [
      {
        points: [
          p(-53, 27),
          p(-53, -23),
          p(46, -23),
          p(51, -17),
          p(51, 32),
          p(-49, 32),
          p(-53, 27),
        ],
        width: 3.2,
        kind: "road",
        color: "#92998b",
      },
      {
        points: [p(-23, -8), p(10, -8), p(10, 26)],
        width: 2.7,
        kind: "walk",
        color: "#c9c0a9",
      },
      {
        points: [p(-37, 25), p(-37, -7)],
        width: 2,
        kind: "walk",
        color: "#c8c3ad",
      },
    ],
  };
  layout.sources.checked = "2026-10-29";
  layout.sources.photos =
    "https://commons.wikimedia.org/wiki/File:Hansung_Science_High_School.jpg";
  return layout;
}
