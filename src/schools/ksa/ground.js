export function paintGround({
  ctx,
  c,
  W,
  D,
  X,
  Z,
  rect,
  path,
  fieldPath,
  layout,
}) {
  // Photo-aligned terraces, entrance loop, Acropolis and running track.
  function framedRect(f, u, v, w, d, color) {
    const p = [
      [-w / 2, -d / 2],
      [w / 2, -d / 2],
      [w / 2, d / 2],
      [-w / 2, d / 2],
    ].map(([a, b]) => layout.point(f, u + a, v + b));
    ctx.beginPath();
    p.forEach((q, i) =>
      i ? ctx.lineTo(X(q.x), Z(q.z)) : ctx.moveTo(X(q.x), Z(q.z)),
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  // Separate paved terraces leave the wooded boundary visible; the whole hill
  // is not an asphalt rectangle.
  rect(-9, -37, 69, 34, "#a5a493");
  rect(-15, -3, 51, 22, "#b1af9c");
  rect(43, -6, 51, 38, "#aaa997");
  rect(-56, 5, 21, 26, "#b0ae9b");
  path(
    [
      [-74, 58],
      [4, 58],
      [38, 52],
      [66, 44],
      [75, 35],
    ],
    7,
    "#666c6c",
  );
  path(
    [
      [37, 54],
      [32, 41],
      [21, 27],
      [14, 18],
      [14, 10],
      [22, 6],
      [39, 14],
      [58, 31],
      [67, 41],
    ],
    5,
    "#bfc2b6",
  );
  path(
    [
      [14, 10],
      [4, 10],
      [-18, 10],
      [-42, 10],
      [-44, -16],
      [-37, -39],
      [14, -39],
      [41, -25],
    ],
    3,
    "#c9c8b8",
  );
  rect(-13, -16, 28, 11, "#c6b9a0");
  rect(-13, -17, 23, 6, "#5e8a6e");
  for (let i = 0; i < 5; i++)
    rect(-18, 9 + i * 0.9, 33, 0.5, i % 2 ? "#e7dbbd" : "#b5a78f");
  // Blue, amber and pale seating blocks along the north edge of the field.
  for (let row = 0; row < 3; row++)
    for (let block = 0; block < 8; block++)
      rect(
        -40 + block * 4.5,
        13.2 + row * 0.45,
        4.1,
        0.32,
        ["#547c92", "#d6c9a4", "#c2914e"][block % 3],
      );
  framedRect(layout.parking, 0, 0, 24, 13, "#8b9390");
  for (let i = -5; i <= 5; i++)
    for (const v of [-4, 4])
      framedRect(layout.parking, i * 2, v, 0.12, 3.5, "#e8e5d9");
  ctx.beginPath();
  ctx.ellipse(
    X(14),
    Z(14),
    (5 / W) * c.width,
    (5 / D) * c.height,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = "#e7e2ce";
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    X(14),
    Z(14),
    (3.7 / W) * c.width,
    (3.7 / D) * c.height,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = "#6e985b";
  ctx.fill();
  const court = layout.tennis;
  framedRect(court, 0, 0, court.w, court.d, "#668d7c");
  for (const v of [-court.d / 2 + 0.5, court.d / 2 - 0.5])
    framedRect(court, 0, v, court.w - 1, 0.13, "#e7e7d7");
  for (const u of [-court.w / 2 + 0.5, 0, court.w / 2 - 0.5])
    framedRect(court, u, 0, 0.13, court.d - 1, "#e7e7d7");
  framedRect(
    layout.field,
    0,
    0,
    layout.field.w + 5,
    layout.field.d + 5,
    "#9c6559",
  );
  for (let i = 0; i < 3; i++) {
    const f = layout.field;
    ctx.strokeStyle = "#e4c4a5";
    ctx.lineWidth = 0.65;
    fieldPath(
      [
        [-f.w / 2 - 1 - i * 0.65, -f.d / 2 - 1 - i * 0.65],
        [f.w / 2 + 1 + i * 0.65, -f.d / 2 - 1 - i * 0.65],
        [f.w / 2 + 1 + i * 0.65, f.d / 2 + 1 + i * 0.65],
        [-f.w / 2 - 1 - i * 0.65, f.d / 2 + 1 + i * 0.65],
      ],
      true,
    );
    ctx.stroke();
  }
  const f = layout.field,
    w = f.w / 2,
    d = f.d / 2;
  fieldPath(
    [
      [-w, -d],
      [w, -d],
      [w, d],
      [-w, d],
    ],
    true,
  );
  ctx.fillStyle = layout.field.color;
  ctx.fill();
  for (let i = 0; i < 10; i++) {
    const a = -w + (i * f.w) / 10;
    fieldPath(
      [
        [a, -d],
        [a + f.w / 10, -d],
        [a + f.w / 10, d],
        [a, d],
      ],
      true,
    );
    ctx.fillStyle = i % 2 ? "#56875d" : "#497b52";
    ctx.fill();
  }
  ctx.strokeStyle = "#ded7c5";
  ctx.lineWidth = 1.6;
  fieldPath(
    [
      [-w + 2, -d + 2],
      [w - 2, -d + 2],
      [w - 2, d - 2],
      [-w + 2, d - 2],
    ],
    true,
  );
  ctx.stroke();
  fieldPath([
    [0, -d + 2],
    [0, d - 2],
  ]);
  ctx.stroke();
  fieldPath(
    Array.from({ length: 65 }, (_, i) => [
      Math.cos((i / 64) * Math.PI * 2) * 4,
      Math.sin((i / 64) * Math.PI * 2) * 4,
    ]),
  );
  ctx.stroke();
  for (const sign of [-1, 1]) {
    const u = sign * (w - 2);
    fieldPath([
      [u, -5],
      [u - sign * 5, -5],
      [u - sign * 5, 5],
      [u, 5],
    ]);
    ctx.stroke();
  }
  for (let i = 0; i < 7; i++)
    path(
      [
        [34 + i * 0.7, 50],
        [34 + i * 0.7, 55],
      ],
      0.3,
      "#eee8d7",
    );
  for (let i = 0; i < 15; i++)
    path(
      [
        [-72 + i * 5, 58],
        [-70 + i * 5, 58],
      ],
      0.14,
      "#e2d4a0",
    );
}
