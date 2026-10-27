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
  // Suil-ro along the southwest edge, shared main entrance and uphill loop.
  path(
    [
      [-75, 16],
      [-60, 29],
      [-35, 45],
      [-12, 58],
    ],
    6,
    "#666d6e",
  );
  path(
    [
      [-8, 58],
      [-1, 42],
      [7, 22],
      [24, 15],
      [47, 6],
      [60, 13],
      [73, 13],
    ],
    4,
    "#a7aaa0",
  );
  path(
    [
      [-65, 23],
      [-53, 23],
      [-43, 26],
      [-34, 32],
      [-24, 38],
      [-8, 50],
    ],
    4,
    "#b5b6ad",
  );
  path(
    [
      [2, 36],
      [12, 30],
      [15, 25],
      [11, 24],
      [6, 28],
      [2, 36],
    ],
    3,
    "#bbbcb0",
  );
  path(
    [
      [-17, 10],
      [-14, -1],
      [-9, -13],
      [3, -31],
      [18, -35],
      [42, -30],
    ],
    2.5,
    "#c9c7b7",
  );
  path(
    [
      [-44, 11],
      [-32, 12],
      [-25, 8],
      [-18, 7],
      [0, 20],
      [22, 22],
    ],
    3,
    "#c5c4b5",
  );
  path(
    [
      [14, 7],
      [25, -18],
      [32, -21],
    ],
    2,
    "#c9c7b7",
  );
  // Parking bays, forecourt and the landscaped park between the two institutions.
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
  framedRect(layout.parking, 0, 0, 20, 12, "#90958a");
  for (let i = -4; i <= 4; i++)
    for (const v of [-4, 4])
      framedRect(layout.parking, i * 2, v, 0.12, 3, "#ece9dc");
  framedRect({ x: 1, z: 18, angle: -0.54 }, 0, 0, 31, 5, "#d5cdb8");
  framedRect({ x: -38, z: 15, angle: -0.6 }, 0, 0, 12, 8, "#b78779");
  path(
    [
      [-28, 15],
      [-30, 20],
      [-21, 24],
      [-9, 27],
      [2, 34],
    ],
    1.2,
    "#d6cfb7",
  );
  // Ecological pond beside SRC, simplified from the public campus illustration.
  path(
    [
      [-41, 8],
      [-38, 7],
      [-36, 9],
      [-38, 11],
    ],
    3.7,
    "#a9a58b",
  );
  path(
    [
      [-41, 8],
      [-38, 7],
      [-36, 9],
      [-38, 11],
    ],
    2.4,
    "#527b78",
  );
  // Green Club court. Net enclosure omitted: its repair status is uncertain.
  const court = layout.tennis;
  framedRect(court, 0, 0, court.w, court.d, "#758d74");
  for (const v of [-court.d / 2 + 0.5, court.d / 2 - 0.5])
    framedRect(court, 0, v, court.w - 1, 0.15, "#e3dfc9");
  for (const u of [-court.w / 2 + 0.5, 0, court.w / 2 - 0.5])
    framedRect(court, u, 0, 0.15, court.d - 1, "#e3dfc9");
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
  ctx.fillStyle = "#607d58";
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
    ctx.fillStyle = i % 2 ? "#647f5c" : "#5b7653";
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
  // Suil-ro center markings and crossing at the shared entrance.
  for (let i = 0; i < 12; i++) {
    const x = -73 + i * 5,
      z = 17 + i * 3.6;
    path(
      [
        [x, z],
        [x + 2, z + 1.4],
      ],
      0.14,
      "#e0d9bb",
    );
  }
  for (let i = 0; i < 7; i++)
    path(
      [
        [-13 + i * 0.6, 53],
        [-9 + i * 0.6, 56],
      ],
      0.22,
      "#eae4d4",
    );
}
