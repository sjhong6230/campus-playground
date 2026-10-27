/** Start actions. Persistent effects expose start/update/clear through their own modules.
 * A new tool needs a catalog entry plus a handler here; no school code changes. */
export function createToolActions({
  T,
  world,
  terrain,
  canvas,
  $,
  getPower,
  getAzimuth,
  volcano,
  blackHole,
  bombing,
  impact,
  audio,
  ring,
  meteors,
  updateStats,
  resetCapture,
  startNuclear,
}) {
  return {
    volcano(p) {
      const target = p.clone();
      target.x = Math.max(-51, Math.min(51, p.x));
      target.z = Math.max(-34, Math.min(34, p.z));
      target.y = terrain.heightAt(target.x, target.z);
      canvas.dataset.volcano = "erupting";
      volcano.start(target, getPower());
      $("hint-text").textContent = "분화 중 · 용암과 화산탄 확산";
      updateStats();
    },
    blackhole(p) {
      const target = p.clone();
      target.y = terrain.heightAt(p.x, p.z) + 24;
      resetCapture();
      canvas.dataset.absorbed = 0;
      canvas.dataset.ejected = 0;
      canvas.dataset.shockwaveDamage = 0;
      audio(0.65);
      blackHole.start(target, getPower());
      canvas.dataset.blackhole = "active";
      $("hint-text").textContent = "블랙홀이 주변 구조물을 흡수하는 중…";
      updateStats();
    },
    bombing(p) {
      bombing.start(p, getAzimuth(), getPower());
      updateStats();
    },
    nuke(p) {
      startNuclear(p);
      updateStats();
    },
    meteor(p) {
      const mesh = new T.Mesh(
        new T.IcosahedronGeometry(5.5 * Math.sqrt(getPower()), 1),
        new T.MeshStandardMaterial({
          color: "#6c3022",
          emissive: "#ff4f09",
          emissiveIntensity: 2,
          roughness: 1,
        }),
      );
      mesh.position.set(p.x - 45, 100, p.z - 25);
      mesh.castShadow = true;
      world.add(mesh);
      meteors.push({ mesh, target: p.clone(), age: 0 });
      ring(p, "#f09366", 18);
      updateStats();
    },
    quake(p) {
      impact(p, "quake");
    },
  };
}
