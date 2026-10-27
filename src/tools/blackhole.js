/* Stylized black hole: bounded capture field and disposable local geometry. */
export const CampusBlackHole = {
  pull(body, field, dt) {
    if (body.consumed) return true;
    const d = body.p.distanceTo(field.p);
    if (d > field.radius + 12) return false;
    body.sleep = false;
    body.delay = 0;
    if (d < field.core + 1.2) {
      (field.captured ??= new Set()).add(body);
      body.consumed = true;
      body.drawScale = 0;
      body.sleep = true;
      body.burn = 0;
      body.v.set(0, 0, 0);
      body.p.y = -1000;
      return true;
    }
    const dx = (field.p.x - body.p.x) / d,
      dy = (field.p.y - body.p.y) / d,
      dz = (field.p.z - body.p.z) / d;
    const speed = 40 + 140 / (1 + d * 0.04),
      blend = 1 - Math.exp(-dt * 7),
      swirl = Math.min(14, d * 0.3);
    body.v.x += (dx * speed - dz * swirl - body.v.x) * blend;
    body.v.y += (dy * speed - body.v.y) * blend;
    body.v.z += (dz * speed + dx * swirl - body.v.z) * blend;
    body.drawScale = Math.min(
      1,
      Math.max(0.06, (d - field.core) / (field.core * 1.8)),
    );
    body.stretch = 1 + (1 - body.drawScale) * 2.5;
    body.pullAxis = { x: dx, y: dy, z: dz };
    body.p.addScaledVector(body.v, dt);
    body.r.addScaledVector(body.spin, dt);
    return true;
  },
  eject(field) {
    let index = 0;
    const captured = field.captured || new Set();
    for (const body of captured) {
      const i = index++,
        angle = i * 2.3999632297,
        r = field.core + 3 + (i % 7) * 1.3,
        lift = 0.18 + (i % 11) / 14,
        speed =
          ((70 + (i % 9) * 5) * Math.sqrt(field.power)) /
          Math.pow(body.mass || 1, 0.25);
      body.consumed = false;
      body.drawScale = 1;
      body.stretch = 1;
      body.pullAxis = null;
      body.active = true;
      body.sleep = false;
      body.delay = 0;
      body.age = 0;
      body.burn = 0;
      body.p.set(
        field.p.x + Math.cos(angle) * r,
        field.p.y + ((i % 5) - 2) * 1.8,
        field.p.z + Math.sin(angle) * r,
      );
      body.v.set(
        Math.cos(angle) * speed,
        lift * speed,
        Math.sin(angle) * speed,
      );
      body.spin.set(
        Math.sin(angle) * 4,
        2 + Math.cos(angle) * 3,
        Math.cos(angle) * 4,
      );
    }
    captured.clear();
    return index;
  },
  create(T, root, onFinish) {
    let state = null;
    function clear() {
      if (!state) return;
      root.remove(state.group);
      const gs = new Set(),
        ms = new Set();
      state.group.traverse((o) => {
        if (o.geometry) gs.add(o.geometry);
        if (o.material) ms.add(o.material);
      });
      gs.forEach((g) => g.dispose());
      ms.forEach((m) => m.dispose());
      state = null;
    }
    function start(p, power) {
      clear();
      const group = new T.Group();
      group.position.copy(p);
      root.add(group);
      const core = 6.2 * Math.sqrt(power),
        sphere = new T.Mesh(
          new T.SphereGeometry(core, 48, 32),
          new T.MeshBasicMaterial({ color: 0x010103 }),
        );
      group.add(sphere);
      const material = new T.ShaderMaterial({
        uniforms: {
          clock: { value: 0 },
          inner: { value: core * 1.12 },
          outer: { value: core * 3.4 },
        },
        vertexShader:
          "varying vec3 local; void main(){local=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        fragmentShader: `varying vec3 local;uniform float clock;uniform float inner;uniform float outer;
    void main(){float r=length(local.xy);float a=atan(local.y,local.x);float t=(r-inner)/(outer-inner);float bands=pow(.5+.5*sin(r*3.8-a*3.0+clock*4.0),3.0);float streak=pow(.5+.5*sin(a*17.0+r*1.7-clock*3.0),7.0);float edge=smoothstep(0.,.06,t)*(1.-smoothstep(.65,1.,t));float brightness=(.5+bands*.7+streak*.8)*edge;vec3 color=mix(vec3(1.,.94,.7),vec3(1.,.21,.035),smoothstep(0.,.8,t));gl_FragColor=vec4(color*brightness,edge*(.7+bands*.25));}`,
        transparent: true,
        side: T.DoubleSide,
        depthWrite: false,
        blending: T.AdditiveBlending,
      });
      const disk = new T.Mesh(
        new T.RingGeometry(core * 1.12, core * 3.4, 128, 12),
        material,
      );
      disk.rotation.set(-Math.PI / 2 + 0.2, 0, 0.16);
      group.add(disk);
      const halo = new T.Mesh(
        new T.RingGeometry(core * 1.01, core * 1.12, 128),
        new T.MeshBasicMaterial({
          color: "#ffe7aa",
          side: T.DoubleSide,
          transparent: true,
          opacity: 0.95,
          blending: T.AdditiveBlending,
          depthWrite: false,
        }),
      );
      group.add(halo);
      const stars = new Float32Array(210 * 3);
      const geo = new T.BufferGeometry();
      geo.setAttribute("position", new T.BufferAttribute(stars, 3));
      const motes = new T.Points(
        geo,
        new T.PointsMaterial({
          color: "#ffcc8d",
          size: 0.65,
          transparent: true,
          opacity: 0.85,
          blending: T.AdditiveBlending,
          depthWrite: false,
        }),
      );
      group.add(motes);
      state = {
        p: p.clone(),
        power,
        core,
        radius: 8,
        age: 0,
        captured: new Set(),
        group,
        disk,
        halo,
        stars,
        geo,
        material,
      };
      return state;
    }
    function update(dt, camera) {
      if (!state) return;
      const s = state;
      s.age += dt;
      s.radius = (12 + 44 * Math.min(1, s.age / 2.6)) * Math.sqrt(s.power);
      s.material.uniforms.clock.value = s.age;
      s.halo.quaternion.copy(camera.quaternion);
      s.disk.rotation.z += dt * 0.14;
      const scale =
        Math.min(1, s.age / 0.65) *
        Math.max(0, Math.min(1, (8 - s.age) / 0.65));
      s.group.scale.setScalar(scale);
      for (let i = 0; i < s.stars.length; i += 3) {
        const n = i / 3,
          t = (n * 0.618 + s.age * 0.16) % 1,
          r = s.core + (1 - t) * s.core * 4.5,
          a = n * 2.4 + s.age * (1.2 + t * 2.5);
        s.stars[i] = Math.cos(a) * r;
        s.stars[i + 1] = Math.sin(n * 5.7) * (1 - t) * 9;
        s.stars[i + 2] = Math.sin(a) * r;
      }
      s.geo.attributes.position.needsUpdate = true;
      if (s.age >= 8) {
        const p = s.p.clone(),
          power = s.power,
          ejected = CampusBlackHole.eject(s);
        clear();
        onFinish(p, power, ejected);
      }
    }
    return { start, update, clear, field: () => state, active: () => !!state };
  },
};
