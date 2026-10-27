// Keep one final frame when animation ends so expired effects disappear.
export function createFrameGate() {
  let wasActive = true;
  return (active, changed) => {
    const render = active || wasActive || changed;
    wasActive = active;
    return render;
  };
}
