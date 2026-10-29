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
  // Hyehwa-ro follows the eastern boundary; the entrance bends onto the upper terrace.
  path(
    [
      [67, -58],
      [72, -30],
      [72, 0],
      [69, 26],
      [68, 58],
    ],
    5,
    "#666e70",
  );
  path(
    [
      [69, 17],
      [56, 16],
      [45, 10],
      [-13, 16],
      [-21, 24],
    ],
    5,
    "#bab9ad",
  );
  path(
    [
      [-22, 24],
      [-23, 44],
      [-9, 53],
      [39, 53],
      [57, 49],
      [60, 27],
      [55, 17],
    ],
    3,
    "#a4a69c",
  );
  path(
    [
      [-18, -7],
      [-30, -13],
      [-43, -26],
    ],
    3,
    "#d5c9b0",
  );
  rect(18, -20, 53, 9, "#b6b8ae");
  rect(25, -20, 17, 6, "#77845f");
  for (const x of [-4, 13, 30]) rect(x, 13 - x * 0.1, 12, 2, "#66794f");
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
  // Weathered paving and road markings, painted into the deformable surface.
  for (let step = 0; step < 10; step++)
    path(
      [
        [-10.5, 18 + step * 0.65],
        [-6.5, 18 + step * 0.65],
      ],
      0.3,
      step % 2 ? "#c8c4ae" : "#e0d7be",
    );
  for (let z = -53; z < 57; z += 8)
    path(
      [
        [71, z],
        [71, z + 3],
      ],
      0.15,
      "#dad6ba",
    );
  for (let i = 0; i < 8; i++)
    path(
      [
        [64 + i * 0.43, 14],
        [64 + i * 0.43, 20],
      ],
      0.22,
      "#e6e0ca",
    );
  for (let x = -6; x < 42; x += 3.4)
    path(
      [
        [x, -24],
        [x, -20.8],
      ],
      0.12,
      "#ece6d8",
    );
  for (let z = -23; z < -17; z += 1.2)
    path(
      [
        [-7, z],
        [43, z],
      ],
      0.035,
      "#8a8f8455",
    );
  for (let x = -7; x < 43; x += 1.5)
    path(
      [
        [x, -23],
        [x, -17],
      ],
      0.035,
      "#8a8f8455",
    );
}
