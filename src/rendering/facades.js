// One repeatable window bay per texture; colors and cladding come from campus evidence.
// Each palette is cached for the lifetime of a scene, with no remote image assets.
export function createFacadeLibrary(T) {
  const cache = new Map();
  return function facade(spec = {}) {
    const style = spec.style || "render";
    const key = [style, spec.trim, spec.window, spec.bandColor].join("|");
    if (cache.has(key)) return cache.get(key);
    const maps = Array.from({ length: 3 }, () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      return { canvas, ctx: canvas.getContext("2d") };
    });
    const [a, b, c] = maps.map((m) => m.ctx);
    a.fillStyle = "#ecebe6";
    a.fillRect(0, 0, 256, 256);
    b.fillStyle = "#aaaaaa";
    b.fillRect(0, 0, 256, 256);
    c.fillStyle = "#e5e5e5";
    c.fillRect(0, 0, 256, 256);
    const course = style === "brick" ? 12 : style === "stone" ? 42 : 64;
    if (style !== "render") {
      for (let y = 0; y < 256; y += course) {
        const offset = style === "brick" && (y / course) % 2 ? 25 : 0;
        a.fillStyle = style === "brick" ? "#8a858144" : "#747d7f38";
        a.fillRect(0, y, 256, style === "panel" ? 2 : 1);
        b.fillStyle = "#757575";
        b.fillRect(0, y, 256, 1);
        for (let x = offset; x < 256; x += style === "brick" ? 50 : 128) {
          a.fillRect(x, y, 1, course);
          b.fillRect(x, y, 1, course);
        }
      }
    }
    const left = style === "panel" ? 15 : style === "stone" ? 43 : 29;
    const top = style === "panel" ? 42 : 49,
      width = 256 - left * 2;
    a.fillStyle = spec.trim || "#bec6c5";
    a.fillRect(left - 4, top - 4, width + 8, 137);
    b.fillStyle = "#444444";
    b.fillRect(left, top, width, 126);
    c.fillStyle = "#555555";
    c.fillRect(left, top, width, 126);
    const glass = a.createLinearGradient(0, top, 0, top + 126);
    glass.addColorStop(0, spec.window || "#3e5967");
    glass.addColorStop(0.5, "#6e8790");
    glass.addColorStop(1, "#a1aaa4");
    a.fillStyle = glass;
    a.fillRect(left, top, width, 126);
    a.fillStyle = "#dce3df45";
    a.beginPath();
    a.moveTo(left + width * 0.6, top);
    a.lineTo(left + width, top);
    a.lineTo(left + width * 0.4, top + 126);
    a.lineTo(left, top + 126);
    a.closePath();
    a.fill();
    a.fillStyle = spec.trim || "#c2c9c7";
    for (let i = 1; i < 3; i++)
      a.fillRect(left + (width * i) / 3 - 1, top, 3, 126);
    a.fillRect(left, top + 79, width, 3);
    a.fillStyle = "#26323855";
    a.fillRect(left - 3, top + 133, width + 6, 5);
    a.fillStyle = spec.bandColor || "#dedfd9";
    a.fillRect(0, 230, 256, style === "panel" ? 20 : 9);
    b.fillStyle = "#bbbbbb";
    b.fillRect(0, 230, 256, 8);
    // Deterministic weathering rather than a uniform glossy tile.
    let seed = 997;
    for (let i = 0; i < 1700; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const x = seed % 256;
      seed = (seed * 1664525 + 1013904223) >>> 0;
      a.fillStyle = i % 2 ? "#ffffff0b" : "#00000009";
      a.fillRect(x, seed % 256, 1, 1);
    }
    const textures = maps.map(({ canvas }, i) => {
      const texture = new T.CanvasTexture(canvas);
      texture.wrapS = texture.wrapT = T.RepeatWrapping;
      texture.colorSpace = i ? T.NoColorSpace : T.SRGBColorSpace;
      texture.anisotropy = 4;
      return texture;
    });
    const result = {
      key,
      map: textures[0],
      bumpMap: textures[1],
      roughnessMap: textures[2],
    };
    cache.set(key, result);
    return result;
  };
}

// Reuse the original geometry/face owners so picking and Undo remain unchanged.
export function applyFacadeGroups(
  T,
  fractured,
  blocks,
  library,
  fallback,
  interior,
) {
  if (!library) return;
  const materials = [interior],
    palettes = new Map();
  const geometry = fractured.mesh.geometry;
  geometry.clearGroups();
  let pending = null;
  function group(start, count, materialIndex) {
    if (!count) return;
    if (
      pending &&
      pending.materialIndex === materialIndex &&
      pending.start + pending.count === start
    )
      pending.count += count;
    else {
      if (pending)
        geometry.addGroup(pending.start, pending.count, pending.materialIndex);
      pending = { start, count, materialIndex };
    }
  }
  for (const part of blocks) {
    const surface = part.ranges[0];
    if (!surface.count) continue;
    const maps = library(part.facade);
    let index = palettes.get(maps.key);
    if (index === undefined) {
      index = materials.length;
      palettes.set(maps.key, index);
      materials.push(
        new T.MeshStandardMaterial({
          map: maps.map,
          bumpMap: maps.bumpMap,
          roughnessMap: maps.roughnessMap,
          bumpScale: 0.08,
          roughness: 0.86,
          vertexColors: true,
          side: T.DoubleSide,
        }),
      );
    }
    group(surface.start, surface.count, index);
  }
  for (const part of blocks) {
    const surface = part.ranges[1];
    group(surface.start, surface.count, 0);
  }
  if (pending)
    geometry.addGroup(pending.start, pending.count, pending.materialIndex);
  fractured.mesh.material = materials;
  fallback.dispose();
}
