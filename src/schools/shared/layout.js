// Small geometry helpers for data-driven campus adapters. X = east, -Z = north.
export function point(frame, u, v) {
  const c = Math.cos(frame.angle || 0),
    s = Math.sin(frame.angle || 0);
  return { x: frame.x + u * c + v * s, z: frame.z - u * s + v * c };
}
export function local(frame, x, z) {
  const c = Math.cos(frame.angle || 0),
    s = Math.sin(frame.angle || 0);
  const dx = x - frame.x,
    dz = z - frame.z;
  return { u: dx * c - dz * s, v: dx * s + dz * c };
}
export function segment(x, z, w, d, extra = {}) {
  return { x, z, w, d, angle: 0, roof: "flat", roofColor: "#a7b9a6", ...extra };
}
export function building(name, floors, baseY, color, segments) {
  return {
    name,
    x: segments[0].x,
    z: segments[0].z,
    floors,
    baseY,
    color,
    segments,
  };
}
export function bridge(name, a, b, baseY, floors = 1, width = 2.8) {
  return {
    name,
    x: (a.x + b.x) / 2,
    z: (a.z + b.z) / 2,
    w: Math.hypot(b.x - a.x, b.z - a.z),
    d: width,
    angle: Math.atan2(a.z - b.z, b.x - a.x),
    baseY,
    floors,
    bottomSlab: true,
  };
}
const smooth = (t) => {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
};
function outside(frame, x, z) {
  const { u, v } = local(frame, x, z);
  return Math.max(Math.abs(u) - frame.w / 2, Math.abs(v) - frame.d / 2, 0);
}
/** Keep complete building footprints and the field level, with blended approaches. */
export function finishLayout(layout, backgroundHeight = () => 1.5) {
  layout.point = point;
  const pads = [
    ...layout.buildings.flatMap((b) =>
      b.segments.map((s) => ({ ...s, height: b.baseY })),
    ),
    { ...layout.field, height: layout.field.height ?? 1.5 },
    ...(layout.tennis?.height != null ? [{ ...layout.tennis }] : []),
  ];
  for (const b of layout.buildings)
    for (const s of b.segments) {
      s.cos = Math.cos(s.angle);
      s.sin = Math.sin(s.angle);
    }
  layout.elevationAt = (x, z) => {
    for (const pad of pads) if (outside(pad, x, z) === 0) return pad.height;
    let height = backgroundHeight(x, z);
    for (const pad of pads) {
      const blend = 1 - smooth(outside(pad, x, z) / 4);
      height = height * (1 - blend) + pad.height * blend;
    }
    return height;
  };
  return layout;
}
