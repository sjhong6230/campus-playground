import { createMushroomCloud } from "./mushroom.js";
import { createCampusFire } from "./fire.js";
/* Bounded, disposable particle effects. All textures are generated locally. */
export const createCampusFX = function (T, root) {
  const clouds = [],
    groups = [],
    ornaments = [],
    fireSystem = createCampusFire(T, root);
  let trailClock = 0,
    clock = 0;
  function texture(smoke) {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d"),
      g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(smoke ? 0.35 : 0.1, "rgba(255,255,255,.85)");
    g.addColorStop(smoke ? 0.75 : 0.4, "rgba(255,255,255,.22)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    return new T.CanvasTexture(c);
  }
  const smokeMap = texture(true),
    glowMap = texture(false);

  function dispose(item) {
    root.remove(item.mesh);
    item.mesh.geometry.dispose();
    item.mesh.material.dispose();
  }
  function particles(
    p,
    {
      count = 80,
      color = "#ffb33b",
      size = 2,
      speed = 26,
      duration = 1.4,
      smoke = false,
      up = 0,
      spread = 1,
    } = {},
  ) {
    const positions = new Float32Array(count * 3),
      velocity = new Float32Array(count * 3),
      colors = new Float32Array(count * 3),
      base = new T.Color(color);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2,
        r = Math.random() * speed;
      positions.set(
        [
          p.x + (Math.random() - 0.5) * spread,
          p.y + Math.random() * spread,
          p.z + (Math.random() - 0.5) * spread,
        ],
        i * 3,
      );
      velocity.set(
        [
          Math.cos(a) * r,
          up + Math.random() * speed * (smoke ? 0.25 : 1.2),
          Math.sin(a) * r,
        ],
        i * 3,
      );
      const tint = base.clone().multiplyScalar(0.6 + Math.random() * 0.6);
      colors.set([tint.r, tint.g, tint.b], i * 3);
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute("position", new T.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new T.BufferAttribute(colors, 3));
    const material = new T.PointsMaterial({
      size,
      map: smoke ? smokeMap : glowMap,
      transparent: true,
      opacity: smoke ? 0.55 : 1,
      depthWrite: false,
      blending: smoke ? T.NormalBlending : T.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true,
    });
    const mesh = new T.Points(geometry, material);
    mesh.frustumCulled = false;
    root.add(mesh);
    groups.push({ mesh, positions, velocity, age: 0, duration, size, smoke });
    while (groups.length > 80) dispose(groups.shift());
  }
  function ornament(mesh, duration, kind, scale = 1) {
    root.add(mesh);
    ornaments.push({ mesh, age: 0, duration, kind, scale });
    while (ornaments.length > 28) dispose(ornaments.shift());
    return mesh;
  }
  function burst(p, mode, power = 2) {
    const small = mode === "volcanicBomb",
      large = mode === "meteor" || mode === "quake",
      size = small ? 0.55 * Math.sqrt(power) : (large ? 1.8 : 1) * power;
    const color = "#ff9b32";
    particles(p, {
      count: Math.round((small ? 18 : large ? 150 : 85) * power),
      color,
      size: 1.8 * power,
      speed: 24 * size,
      duration: 1.8,
      spread: 4,
    });
    particles(p, {
      count: small ? 10 : large ? 65 : 35,
      color: "#9c8b78",
      size: (small ? 3 : 9) * power,
      speed: 8 * size,
      duration: 3.8,
      smoke: true,
      up: 6,
      spread: 10,
    });
    const flash = new T.Mesh(
      new T.SphereGeometry(1, 20, 12),
      new T.MeshBasicMaterial({
        color: "#ffcb62",
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: T.AdditiveBlending,
      }),
    );
    flash.position.copy(p);
    ornament(flash, 0.55, "flash", 8 * size);
    for (let i = 0; i < (small ? 0 : 3); i++) {
      const ring = new T.Mesh(
        new T.RingGeometry(0.88, 1, 80),
        new T.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 1,
          side: T.DoubleSide,
          depthWrite: false,
          blending: T.AdditiveBlending,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(p.x, 0.7 + i * 0.2, p.z);
      ornament(ring, 0.8 + i * 0.2, "ring", (25 + i * 13) * size);
    }
    if (mode === "quake") {
      for (let i = 0; i < 10; i++) {
        const vertices = [],
          angle = (i * Math.PI) / 5;
        for (let j = 0; j < 10; j++) {
          const d = j * 8;
          vertices.push(
            new T.Vector3(
              p.x + Math.cos(angle) * d + (Math.random() - 0.5) * 6,
              0.7,
              p.z + Math.sin(angle) * d + (Math.random() - 0.5) * 6,
            ),
          );
        }
        const line = new T.Line(
          new T.BufferGeometry().setFromPoints(vertices),
          new T.LineBasicMaterial({
            color: "#f9b35f",
            transparent: true,
            opacity: 1,
          }),
        );
        ornament(line, 3.5, "crack");
      }
    }
  }
  function trail(p, dt) {
    trailClock += dt;
    if (trailClock > 0.045) {
      trailClock = 0;
      particles(p, {
        count: 12,
        color: "#ff7c20",
        size: 7,
        speed: 3,
        duration: 0.55,
        up: 3,
        spread: 3,
      });
    }
  }
  function fire(p, strength = 1, key = "default") {
    fireSystem.fire(p, strength, key);
  }
  function ash(p) {
    particles(p, {
      count: 12,
      color: "#343330",
      size: 13,
      speed: 3,
      duration: 6,
      smoke: true,
      up: 13,
      spread: 8,
    });
  }
  function dust(p) {
    particles(p, {
      count: 24,
      color: "#8d7c64",
      size: 9,
      speed: 5,
      duration: 2.4,
      smoke: true,
      up: 3,
      spread: 6,
    });
  }
  function nuclear(p, power) {
    burst(p, "meteor", Math.min(power * 1.6, 4));
    clouds.push(createMushroomCloud(T, root, p));
    while (clouds.length > 3) clouds.shift().dispose();
  }
  function update(dt) {
    clock += dt;
    for (let i = clouds.length - 1; i >= 0; i--)
      if (!clouds[i].update(dt)) clouds.splice(i, 1);
    fireSystem.update(dt);
    for (let i = groups.length - 1; i >= 0; i--) {
      const g = groups[i];
      g.age += dt;
      const t = g.age / g.duration;
      if (t >= 1) {
        dispose(g);
        groups.splice(i, 1);
        continue;
      }
      for (let j = 0; j < g.positions.length; j += 3) {
        g.velocity[j + 1] += (g.smoke ? 1 : -26) * dt;
        for (let k = 0; k < 3; k++)
          g.positions[j + k] += g.velocity[j + k] * dt;
        if (!g.smoke && g.positions[j + 1] < 0.6) {
          g.positions[j + 1] = 0.6;
          g.velocity[j + 1] *= -0.25;
          g.velocity[j] *= 0.8;
          g.velocity[j + 2] *= 0.8;
        }
      }
      g.mesh.geometry.attributes.position.needsUpdate = true;
      g.mesh.material.opacity = (g.smoke ? 0.5 : 1) * (1 - t);
      g.mesh.material.size = g.size * (g.smoke ? 1 + t * 2 : 1 - t * 0.6);
    }
    for (let i = ornaments.length - 1; i >= 0; i--) {
      const o = ornaments[i];
      o.age += dt;
      const t = o.age / o.duration;
      if (t >= 1) {
        dispose(o);
        ornaments.splice(i, 1);
        continue;
      }
      o.mesh.material.opacity = (1 - t) * (o.kind === "flash" ? 0.7 : 1);
      if (o.kind === "flash")
        o.mesh.scale.setScalar((0.3 + Math.sin((t * Math.PI) / 2)) * o.scale);
      if (o.kind === "ring") o.mesh.scale.setScalar((0.05 + t) * o.scale);
      if (o.kind === "beam") {
        o.mesh.scale.x = o.mesh.scale.z = 1 + Math.sin(t * 23) * 0.2;
      }
      if (o.kind === "cloud") {
        o.mesh.position.y += dt * 2;
        o.mesh.scale.multiplyScalar(1 + dt * 0.035);
        o.mesh.material.opacity = Math.min(t * 8, 1) * (1 - t) * 0.9;
      }
    }
  }
  function clear() {
    for (const c of clouds) c.dispose();
    clouds.length = 0;
    for (const g of groups) dispose(g);
    for (const o of ornaments) dispose(o);
    fireSystem.clear();
    groups.length = ornaments.length = 0;
  }
  return { burst, ash, trail, fire, dust, nuclear, update, clear };
};
