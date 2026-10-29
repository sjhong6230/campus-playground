// Local load paths for a game-scale collapse, not a structural engineering solver.
// The immutable graph is built once; every query reads live state so Undo needs no cache reset.
export function createSupportGraph(blocks, detach) {
  const bounds = new Map(),
    columns = [],
    slabs = [];
  for (const b of blocks) {
    const corners = b.corners || [];
    bounds.set(b, {
      low: b.origin.y + Math.min(0, ...corners.map((p) => p.y)),
      high: b.origin.y + Math.max(0, ...corners.map((p) => p.y)),
    });
    if (b.kind === "column") columns.push(b);
    if (b.kind === "slab") slabs.push(b);
  }
  function footprintDistance(b, x, z) {
    const poly = b.corners,
      length = poly ? poly.length / 2 : 0;
    if (!length) return Math.hypot(b.origin.x - x, b.origin.z - z);
    let inside = false,
      distance = Infinity;
    for (let i = 0, j = length - 1; i < length; j = i++) {
      const ax = b.origin.x + poly[i].x,
        az = b.origin.z + poly[i].z,
        bx = b.origin.x + poly[j].x,
        bz = b.origin.z + poly[j].z;
      if (az > z !== bz > z && x < ((bx - ax) * (z - az)) / (bz - az) + ax)
        inside = !inside;
      const dx = bx - ax,
        dz = bz - az,
        t = Math.max(
          0,
          Math.min(
            1,
            ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1),
          ),
        );
      distance = Math.min(
        distance,
        Math.hypot(x - ax - t * dx, z - az - t * dz),
      );
    }
    return inside ? 0 : distance;
  }
  const distance = (a, b) =>
    Math.hypot(a.origin.x - b.origin.x, a.origin.z - b.origin.z);
  const graph = [];
  for (const b of blocks) {
    let supports = [],
      threshold = 0.6;
    const base = b.building?.baseY ?? bounds.get(b).low;
    if (b.kind === "slab") {
      const bridgeDeck =
        b.building?.link && Math.abs(bounds.get(b).low - base) < 0.5;
      supports = columns.filter((c) =>
        bridgeDeck
          ? c.segment === b.segment && c.story === 0
          : Math.abs(bounds.get(c).high - bounds.get(b).low) < 0.8 &&
            footprintDistance(b, c.origin.x, c.origin.z) < 3,
      );
      // Sparse column geometry still carries edge panels through the intervening beams.
      if (!supports.length)
        supports = columns.filter(
          (c) =>
            c.segment === b.segment &&
            Math.abs(bounds.get(c).high - bounds.get(b).low) < 0.8,
        );
      supports.sort((a, c) => distance(a, b) - distance(c, b));
      supports = supports.slice(0, 4);
      // A panel between columns can span a local gap; it does not take down a whole wing.
      threshold = 0.58;
    } else if (b.kind === "column" && b.story === 0 && b.building?.link) {
      const s = b.segment,
        angle = s.angle || 0;
      for (const sign of [-1, 1]) {
        const x = s.x + (sign * Math.cos(angle) * s.w) / 2,
          z = s.z - (sign * Math.sin(angle) * s.w) / 2;
        const candidates = slabs.filter(
          (q) =>
            q.building !== b.building &&
            Math.abs(bounds.get(q).high - base) < 1 &&
            footprintDistance(q, x, z) < 3,
        );
        candidates.sort(
          (a, c) =>
            Math.hypot(a.origin.x - x, a.origin.z - z) -
            Math.hypot(c.origin.x - x, c.origin.z - z),
        );
        if (candidates[0] && !supports.includes(candidates[0]))
          supports.push(candidates[0]);
      }
      threshold = 0.45;
    } else if (b.kind === "column" || b.kind === "wall") {
      const supportLevel = base + b.story * 3;
      if (b.story > 0) {
        supports = slabs.filter(
          (q) =>
            q !== b &&
            Math.abs(bounds.get(q).high - supportLevel) < 0.7 &&
            footprintDistance(q, b.origin.x, b.origin.z) < 1.7,
        );
        supports.sort((a, c) => distance(a, b) - distance(c, b));
        supports = supports.slice(0, 3);
      } else if (b.kind === "wall") {
        supports = columns.filter(
          (c) => c.segment === b.segment && c.story === 0,
        );
        supports.sort((a, c) => distance(a, b) - distance(c, b));
        supports = supports.slice(0, 2);
        threshold = 0.7;
      }
    }
    if (supports.length) graph.push({ b, supports, threshold });
  }
  // Each pass moves loss of support one edge up the load path; delay preserves the sequence.
  const previous = new Uint8Array(blocks.length);
  return function propagate() {
    let dirty = false;
    blocks.forEach((b, i) => {
      const state = b.active ? 1 : 0;
      if (state !== previous[i]) dirty = true;
      previous[i] = state;
    });
    if (!dirty) return 0;
    let count = 0,
      changed = true;
    for (let pass = 0; changed && pass < 24; pass++) {
      changed = false;
      for (const { b, supports, threshold } of graph) {
        if (b.active) continue;
        const failed = supports.filter((s) => s.active);
        if (failed.length / supports.length < threshold) continue;
        const x = failed.reduce((v, s) => v + s.origin.x, 0) / failed.length,
          z = failed.reduce((v, s) => v + s.origin.z, 0) / failed.length,
          delay =
            Math.max(...failed.map((s) => Math.max(0, s.delay || 0))) + 0.12;
        detach(b, x, z, delay);
        count++;
        changed = true;
      }
    }
    if (count)
      blocks.forEach((b, i) => {
        previous[i] = b.active ? 1 : 0;
      });
    return count;
  };
}
