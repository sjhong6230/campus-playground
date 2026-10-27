export function paintGround({ ctx, c, W, D, X, Z, path, fieldPath, layout }) {
  const angle = 0.35;
  function framedRect(f, u, v, w, d, color) {
    const corners = [
      [-w / 2, -d / 2],
      [w / 2, -d / 2],
      [w / 2, d / 2],
      [-w / 2, d / 2],
    ];
    ctx.beginPath();
    corners.forEach(([a, b], i) => {
      const p = layout.point(f, u + a, v + b);
      i ? ctx.lineTo(X(p.x), Z(p.z)) : ctx.moveTo(X(p.x), Z(p.z));
    });
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  const campus = { x: 0, z: 0, angle };
  framedRect(campus, 0, 0, 104, 100, "#b8baa7");
  // Cheomdangwagi-ro runs along the southern boundary; the service drive
  // follows the west, north and east edges of the actual campus.
  path(
    [
      [-70, 74],
      [-30, 59],
      [10, 44],
      [55, 28],
      [76, 20],
    ],
    7,
    "#737b7b",
  );
  path(
    [
      [-29, 53],
      [-55, -25],
      [28, -56],
      [57, 25],
      [30, 36],
    ],
    3.6,
    "#91998e",
  );
  path(
    [
      [26, 38],
      [19, 22],
      [11, 3],
      [1, -23],
      [-4, -39],
    ],
    4,
    "#cfb4a0",
  );
  path(
    [
      [-45, 10],
      [-8, -3],
      [2, -7],
    ],
    2.4,
    "#cabaa6",
  );
  path(
    [
      [-47, -8],
      [-18, -18],
      [-8, -22],
    ],
    1.6,
    "#c9b9a5",
  );
  framedRect({ x: -31, z: -10, angle }, 0, 0, 24, 11, "#8b9d7c");
  framedRect({ x: 20, z: -36, angle }, 0, 0, 16, 14, "#a69b86");
  framedRect({ x: 24, z: -19, angle }, 0, 0, 20, 5, "#b97e67");
  for (let i = 0; i < 4; i++)
    framedRect({ x: -21, z: 13, angle }, 0, i * 0.65, 36, 0.28, "#d8d4bd");
  framedRect(layout.parking, 0, 0, 26, 11, "#909b94");
  for (let i = -5; i <= 5; i++)
    for (const v of [-3.7, 3.7])
      framedRect(layout.parking, i * 2.2, v, 0.12, 3, "#ece9d9");
  // Northern parking strip, beneath the tree-lined boundary.
  const north = { x: -18, z: -38, angle };
  framedRect(north, 0, 0, 46, 5, "#909b94");
  for (let i = -9; i <= 9; i++)
    framedRect(north, i * 2.2, 0, 0.1, 4, "#e2e3d5");
  const court = layout.tennis;
  framedRect(court, 0, 0, court.w + 2, court.d + 2, "#c1a38a");
  framedRect(court, 0, 0, court.w, court.d, "#657e8a");
  for (const v of [-court.d / 2 + 0.4, court.d / 2 - 0.4])
    framedRect(court, 0, v, court.w - 0.8, 0.12, "#e8e3d2");
  for (const u of [-court.w / 2 + 0.4, 0, court.w / 2 - 0.4])
    framedRect(court, u, 0, 0.12, court.d - 0.8, "#e8e3d2");
  for (const sign of [-1, 1]) {
    framedRect(court, sign * (court.w / 2 - 2.1), -1.8, 3.4, 0.12, "#e8e3d2");
    framedRect(court, sign * (court.w / 2 - 2.1), 1.8, 3.4, 0.12, "#e8e3d2");
  }
  // Small green sports surface south of the gym, visible in the aerial view.
  const small = { x: 36, z: 26, angle };
  framedRect(small, 0, 0, 16, 9, "#597d69");
  for (const u of [-7, 0, 7]) framedRect(small, u, 0, 0.1, 7.5, "#d0d7bd");
  for (const v of [-3.75, 3.75]) framedRect(small, 0, v, 14, 0.1, "#d0d7bd");
  // The main playing field is pale dirt, not artificial turf.
  const f = layout.field,
    w = f.w / 2,
    d = f.d / 2;
  framedRect(f, 0, 0, f.w + 1.5, f.d + 1.5, "#c3b99b");
  framedRect(f, 0, 0, f.w, f.d, "#c9c0a5");
  ctx.strokeStyle = "#e5ddc3";
  ctx.lineWidth = 1.1;
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
      [u, -6],
      [u - sign * 6, -6],
      [u - sign * 6, 6],
      [u, 6],
    ]);
    ctx.stroke();
  }
  const road = { x: 26, z: 42, angle };
  for (let i = -3; i <= 3; i++)
    framedRect(road, i * 0.85, 0, 0.35, 5, "#eee9d7");
  for (let i = -18; i <= 10; i++)
    framedRect(road, i * 5, 0, 2, 0.14, "#d6ca93");
}
