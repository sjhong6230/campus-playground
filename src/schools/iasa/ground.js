import { paintSite } from "../shared/ground.js";
import { sitePoint, siteSegment } from "./layout.js";

export function paintGround(args) {
  const { ctx, path, fieldPath, layout } = args;
  const surface = (u, v, w, d, color) => ({
    ...siteSegment(u, v, w, d),
    color,
  });
  paintSite(args, {
    surfaces: [
      surface(4, 0, 104, 61, "#c4c6b3"),
      surface(-23, 21, 24, 15, "#8eaa7c"),
      surface(5, 25.5, 34, 6, "#8da477"),
      surface(25, -20, 13, 19, "#91a77c"),
      surface(-5, 0.7, 17, 12, "#c2c6af"),
    ],
    paths: [],
    fieldColor: "#b6b19c",
    wornField: true,
  });
  function localPath(points, width, color) {
    path(
      points.map(([u, v]) => {
        const p = sitePoint(u, v);
        return [p.x, p.z];
      }),
      width,
      color,
    );
  }
  function ring(u, v, radius, width, color) {
    localPath(
      Array.from({ length: 49 }, (_, i) => {
        const a = (i * Math.PI) / 24;
        return [u + Math.cos(a) * radius, v + Math.sin(a) * radius];
      }),
      width,
      color,
    );
  }
  // The circular courtyard and curved garden walks are visible on the satellite image.
  ring(-2, 1, 2.8, 0.65, "#e0d9c7");
  ring(-2, 1, 1.8, 0.28, "#969f8a");
  localPath(
    [
      [-33, 15],
      [-31, 20],
      [-27, 23],
      [-24, 21],
      [-20, 23],
      [-15, 25],
    ],
    1.35,
    "#c9c2ac",
  );
  localPath(
    [
      [24, -27],
      [29, -24],
      [28, -19],
      [23, -17],
      [25, -13],
    ],
    1.2,
    "#c8c0aa",
  );
  // Satellite imagery shows an unmarked weathered surface inside a red rounded track.
  const f = layout.field;
  fieldPath(
    [
      [-f.w / 2, -f.d / 2],
      [f.w / 2, -f.d / 2],
      [f.w / 2, f.d / 2],
      [-f.w / 2, f.d / 2],
    ],
    true,
  );
  ctx.fillStyle = "#b6b19c";
  ctx.fill();
  function track(w, d, r) {
    return Array.from({ length: 4 }, (_, corner) => {
      const a0 = (corner * Math.PI) / 2;
      const cx = (corner === 0 || corner === 3 ? 1 : -1) * (w / 2 - r);
      const cz = (corner < 2 ? 1 : -1) * (d / 2 - r);
      return Array.from({ length: 9 }, (_, i) => {
        const a = a0 + (i * Math.PI) / 16;
        return [cx + r * Math.cos(a), cz + r * Math.sin(a)];
      });
    }).flat();
  }
  fieldPath(track(f.w + 2.2, f.d + 2.2, 2.5), true);
  ctx.lineWidth = 19;
  ctx.strokeStyle = "#a76d5d";
  ctx.stroke();
  for (const offset of [0.3, 1, 1.7]) {
    fieldPath(track(f.w + offset * 2, f.d + offset * 2, 1.4 + offset), true);
    ctx.strokeStyle = "#dcc7b1";
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }
  // Low spectator steps run along the classroom side, not a ceremonial platform.
  for (let i = 0; i < 3; i++)
    localPath(
      [
        [27.4 - i * 0.45, -10],
        [27.4 - i * 0.45, 22],
      ],
      0.2,
      i % 2 ? "#b4b8ab" : "#e2dfd1",
    );
}
