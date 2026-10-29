export function addDetails(layout) {
  const frame = { x: 0, z: 0, angle: 0.32 };
  const p = (u, v) => {
    const q = layout.point(frame, u, v);
    return [q.x, q.z];
  };
  layout.buildings.forEach((b, i) => {
    const color =
      i === 0
        ? "#a99580"
        : i === 1
          ? "#c4c2ae"
          : i === 2
            ? "#b9b6a2"
            : "#d4d5ca";
    b.color = color;
    b.facade = {
      style: "panel",
      color,
      trim: "#afb8b1",
      bandColor: "#dddcd0",
      window: "#668783",
    };
    b.segments.forEach((s) => {
      if (!s.roof || s.roof === "flat") s.roofDetails = { parapet: true };
    });
  });
  // The main west-facing classroom wing has a visible white roof sunshade.
  layout.buildings[0].segments[0].roofDetails.canopy = {
    u: 0,
    v: 0,
    w: 8.5,
    d: 25,
    height: 1.3,
    color: "#d8ddd3",
  };
  layout.gate = {
    ...layout.gate,
    style: "piers",
    width: 7.5,
    height: 2,
    color: "#b9b5a8",
    sign: "세종과학고등학교",
  };
  layout.siteDetails = {
    retainingWalls: [
      { a: p(-40.5, -37), b: p(-7, -37), height: 0.8, color: "#b0ad9c" },
      { a: p(-5.5, -35), b: p(-5.5, -9), height: 0.8, color: "#b0ad9c" },
      { a: p(-39, -7), b: p(-8, -7), height: 0.9, color: "#aca994" },
    ],
    fences: [
      {
        points: [p(-53, -47), p(-53, -10), p(-46, 4)],
        height: 1.7,
        color: "#718473",
      },
      { points: [p(-42, -36), p(-42, -8)], height: 2.2, color: "#71847b" },
      {
        points: [p(43, -43), p(43, 9), [57, 47], [45, 56]],
        height: 1.6,
        color: "#748376",
      },
    ],
    paths: [
      {
        points: [p(-56, -57), p(-58, -10), p(-47, 8), p(-41, 15)],
        width: 5,
        kind: "road",
        color: "#818c85",
      },
      {
        points: [p(-44, 6), p(-37, 0), p(5, 0), p(9, -10)],
        width: 3.6,
        kind: "walk",
        color: "#bcb5a5",
      },
      {
        points: [p(-43, -39), p(1, -39)],
        width: 3,
        kind: "walk",
        color: "#bdb6a5",
      },
      {
        points: [p(-5, -37), p(-5, -7)],
        width: 2.3,
        kind: "walk",
        color: "#c4c2b1",
      },
    ],
  };
  layout.sources.photos =
    "https://sjsh.sen.hs.kr/dggb/module/image/selectDesignImageView.do?sitemapId=268892&usrimgId=43425";
  return layout;
}
