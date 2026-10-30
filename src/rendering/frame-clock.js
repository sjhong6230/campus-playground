// Carry fractional refresh intervals forward: 75/144 Hz must not fall to 37/48 FPS.
// Never run a burst of catch-up frames after a slow frame or a hidden tab.
export function createFrameClock(start = 0) {
  let previous = start,
    rendered = start,
    credit = 0;
  return {
    reset(now) {
      previous = rendered = now;
      credit = 0;
    },
    tick(now, interval) {
      credit += Math.max(0, now - previous);
      previous = now;
      if (credit + 0.1 < interval) return 0;
      credit = Math.max(
        0,
        credit - interval * Math.max(1, Math.floor((credit + 0.1) / interval)),
      );
      const delta = Math.min((now - rendered) / 1000, 0.25);
      rendered = now;
      return delta;
    },
  };
}
