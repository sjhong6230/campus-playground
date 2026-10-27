/** Undo stores model state, never GPU objects. The oldest state is discarded. */
export function createHistory(limit = 16) {
  const entries = [];
  return {
    push(value) {
      entries.push(value);
      if (entries.length > limit) entries.shift();
    },
    pop: () => entries.pop(),
    clear: () => {
      entries.length = 0;
    },
    get length() {
      return entries.length;
    },
  };
}
export function captureBlocks(blocks) {
  return blocks.map((b) => ({
    p: b.p.clone(),
    v: b.v.clone(),
    r: b.r.clone(),
    spin: b.spin.clone(),
    active: b.active,
    sleep: b.sleep,
    delay: b.delay,
    age: b.age,
    charred: b.charred || false,
    consumed: !!b.consumed,
    drawScale: b.drawScale ?? 1,
    stretch: b.stretch ?? 1,
    pullAxis: b.pullAxis ? { ...b.pullAxis } : null,
  }));
}
export function restoreBlocks(blocks, saved) {
  if (blocks.length !== saved.length)
    throw new Error("Snapshot belongs to a different campus");
  saved.forEach((state, index) => {
    const b = blocks[index];
    for (const key of ["p", "v", "r", "spin"]) b[key].copy(state[key]);
    for (const key of [
      "active",
      "sleep",
      "delay",
      "age",
      "charred",
      "consumed",
      "drawScale",
      "stretch",
      "pullAxis",
    ])
      b[key] = state[key];
  });
}
