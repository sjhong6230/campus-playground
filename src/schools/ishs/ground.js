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
  // Southern access road, western uphill drive and northern service loop.
  path(
    [
      [-75, 47],
      [-45, 45],
      [0, 43],
      [35, 41],
      [74, 38],
    ],
    5,
    "#777c78",
  );
  path(
    [
      [-52, 44],
      [-53, 15],
      [-53, -6],
      [-47, -17],
      [-24, -21],
      [0, -24],
      [20, -41],
      [47, -44],
      [65, -39],
      [69, 12],
      [65, 36],
    ],
    4,
    "#92968b",
  );
  path(
    [
      [13, 44],
      [12, 20],
      [13, 16],
    ],
    3,
    "#b1b2a6",
  );
  path(
    [
      [-14, 40],
      [-15, 11],
      [-17, -18],
    ],
    2.4,
    "#c7c7b5",
  );
  path(
    [
      [-7, -7],
      [14, -7],
      [28, -7],
      [40, -15],
      [53, -21],
    ],
    1.4,
    "#d1c8af",
  );
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
  framedRect(layout.parking, 0, 0, 20, 12, "#92968c");
  for (let i = -4; i <= 4; i++)
    for (const v of [-4, 4])
      framedRect(layout.parking, i * 2, v, 0.12, 3, "#ece9dc");
  // Southeast parking apron and its central aisle sit under the solar roofs.
  const solarParking = { x: 53, z: 26.5, angle: 0.07 };
  framedRect(solarParking, 0, 0, 30, 19, "#939b91");
  framedRect(solarParking, 0, 0, 30, 3.1, "#7e8981");
  for (let bay = -6; bay <= 6; bay++)
    for (const row of [-5.3, 5.3])
      framedRect(solarParking, bay * 2.2, row, 0.11, 5, "#deded0");
  framedRect({ x: 12, z: 7, angle: 0.07 }, 0, 0, 21, 8, "#9aab8b");
  const courtyard = { x: 12, z: 7, angle: 0.07 };
  framedRect(courtyard, 0, 0, 18.5, 1.1, "#c9c4ad");
  framedRect(courtyard, 0, 0, 1.1, 8, "#c9c4ad");
  framedRect({ x: -34, z: 7, angle: 0.08 }, 0, 0, 25, 3, "#d2c7b3");
  // Ecological garden occupies the narrow strip between Deokseong and Changui.
  path(
    [
      [0, -7],
      [6, -6],
      [11, -7],
      [17, -6],
      [23, -7],
    ],
    1.2,
    "#b9a98b",
  );
  path(
    [
      [4, -7],
      [6, -7],
      [7, -6],
    ],
    1.1,
    "#617d71",
  );
  // The visible western court is a basketball court, with breakable hoops.
  const court = layout.tennis;
  framedRect(court, 0, 0, court.w + 2, court.d + 2, "#a16e56");
  framedRect(court, 0, 0, court.w, court.d, "#668b79");
  for (const v of [-court.d / 2 + 0.4, court.d / 2 - 0.4])
    framedRect(court, 0, v, court.w - 0.8, 0.12, "#e3dfc9");
  for (const u of [-court.w / 2 + 0.4, 0, court.w / 2 - 0.4])
    framedRect(court, u, 0, 0.12, court.d - 0.8, "#e3dfc9");
  for (const sign of [-1, 1]) {
    framedRect(court, sign * (court.w / 2 - 2), -1.5, 3, 0.12, "#e3dfc9");
    framedRect(court, sign * (court.w / 2 - 2), 1.5, 3, 0.12, "#e3dfc9");
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
    ctx.fillStyle = i % 2 ? "#b8a681" : "#b7a580";
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
  // Narrow concrete spectator steps on the east side of the lower dirt field.
  for (let row = 0; row < 4; row++) {
    const a = layout.point(f, f.w / 2 + 0.45 + row * 0.48, -f.d / 2 + 2);
    const b = layout.point(f, f.w / 2 + 0.45 + row * 0.48, f.d / 2 - 2);
    path(
      [
        [a.x, a.z],
        [b.x, b.z],
      ],
      0.27,
      row % 2 ? "#c0bda8" : "#d0cbb5",
    );
  }
  // Road edge and pedestrian crossing at the southern gate.
  for (let i = 0; i < 23; i++) {
    const x = -70 + i * 6;
    path(
      [
        [x, 44.8 - x * 0.04],
        [x + 2.5, 44.7 - x * 0.04],
      ],
      0.13,
      "#d8d3b6",
    );
  }
  for (let i = 0; i < 7; i++)
    path(
      [
        [9 + i * 0.9, 41],
        [9 + i * 0.9, 46],
      ],
      0.32,
      "#e9e2d1",
    );
}
