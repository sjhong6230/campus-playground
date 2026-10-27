import { performanceSettings } from "../core/settings.js";
/* Batched fire, ground glow, drifting smoke and embers. No per-flame draw calls. */
export const createCampusFire = function (T, root) {
  const sources = new Map(),
    smoke = [],
    sparks = [];
  let clock = 0;
  const noise = `float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}float fbm(vec2 p){return noise(p)*.55+noise(p*2.03)*.28+noise(p*4.1)*.17;}`;
  const vertex = `attribute vec3 center;attribute vec2 extent;attribute vec2 phase;varying vec2 vUv;varying vec2 vPhase;void main(){vUv=uv;vPhase=phase;vec4 p=modelViewMatrix*vec4(center,1.);p.xy+=position.xy*extent;gl_Position=projectionMatrix*p;}`;
  function batch(cap, fragment, ground = false, additive = false) {
    const geometry = new T.InstancedBufferGeometry(),
      plane = new T.PlaneGeometry(1, 1);
    geometry.index = plane.index;
    geometry.setAttribute("position", plane.attributes.position);
    geometry.setAttribute("uv", plane.attributes.uv);
    const a = new Float32Array(cap * 3),
      b = new Float32Array(cap * 2),
      c = new Float32Array(cap * 2);
    geometry.setAttribute("center", new T.InstancedBufferAttribute(a, 3));
    geometry.setAttribute("extent", new T.InstancedBufferAttribute(b, 2));
    geometry.setAttribute("phase", new T.InstancedBufferAttribute(c, 2));
    geometry.instanceCount = 0;
    const material = new T.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: ground
        ? vertex.replace(
            "p.xy+=position.xy*extent;",
            "p=modelViewMatrix*vec4(center+vec3(position.x*extent.x,0.,position.y*extent.y),1.);",
          )
        : vertex,
      fragmentShader:
        "uniform float time;varying vec2 vUv;varying vec2 vPhase;" +
        noise +
        fragment,
      transparent: true,
      depthWrite: false,
      side: T.DoubleSide,
      blending: additive ? T.AdditiveBlending : T.NormalBlending,
    });
    const mesh = new T.Mesh(geometry, material);
    mesh.frustumCulled = false;
    root.add(mesh);
    return { mesh, geometry, material, a, b, c, cap, count: 0 };
  }
  const flame = batch(
    384,
    `void main(){float y=vUv.y;float n=fbm(vec2(vUv.x*5.+vPhase.x,y*6.-time*2.8));float bend=.12*sin(y*7.-time*2.+vPhase.x)+y*.12;float width=.49*pow(1.-y,.72);float edge=width-abs(vUv.x-.5-bend)+(n-.5)*.24;float alpha=smoothstep(-.04,.1,edge)*smoothstep(0.,.12,y)*(1.-smoothstep(.72,1.,y))*vPhase.y;float heat=clamp((1.-y)*.8+n*.5,0.,1.);vec3 color=mix(vec3(.65,.055,.006),vec3(1.,.48,.035),heat);color=mix(color,vec3(1.,.91,.52),pow(heat,7.)*.8);gl_FragColor=vec4(color*1.3,alpha*.9);}`,
  );
  const glow = batch(
    128,
    `void main(){float d=length((vUv-.5)*2.);float n=fbm(vUv*13.+vPhase.x);float a=pow(max(0.,1.-d),1.4)*(.25+n*.5)*vPhase.y;gl_FragColor=vec4(vec3(1.,.19,.015)*( .75+.25*sin(time*3.+vPhase.x)),a);}`,
    true,
    true,
  );
  const cloud = batch(
    384,
    `void main(){float r=length((vUv-.5)*2.);float n=fbm(vUv*5.+vec2(vPhase.x,time*.1));float alpha=(1.-smoothstep(.1,1.,r+(n-.5)*.4))*vPhase.y;vec3 col=mix(vec3(.09,.085,.08),vec3(.29,.28,.265),n*.7+vUv.y*.25);gl_FragColor=vec4(col,alpha*.52);}`,
  );
  const ember = batch(
    192,
    `void main(){float r=length((vUv-.5)*2.);gl_FragColor=vec4(1.,.45,.05,max(0.,1.-r)*vPhase.y);}`,
    false,
    true,
  );
  const batches = [flame, glow, cloud, ember];
  function put(b, p, w, h, seed, alpha) {
    if (b.count >= b.cap) return;
    const i = b.count++;
    b.a[i * 3] = p.x;
    b.a[i * 3 + 1] = p.y;
    b.a[i * 3 + 2] = p.z;
    b.b[i * 2] = w;
    b.b[i * 2 + 1] = h;
    b.c[i * 2] = seed;
    b.c[i * 2 + 1] = alpha;
  }
  function touch(p, strength = 1, key = "default") {
    let f = sources.get(key);
    if (!f) {
      if (sources.size >= 128) return;
      f = {
        p: p.clone(),
        strength,
        seen: clock,
        seed: Math.random() * 100,
        smokeAt: clock + Math.random() * 0.5,
        emberAt: clock + Math.random(),
      };
      sources.set(key, f);
    }
    f.p.copy(p);
    f.strength = strength;
    f.seen = clock;
  }
  function update(dt) {
    clock += dt;
    if (!sources.size && !smoke.length && !sparks.length) return;
    for (const b of batches) b.count = 0;
    for (const [key, f] of sources) {
      const fade = Math.max(0, 1 - (clock - f.seen) / 0.75);
      if (!fade) {
        sources.delete(key);
        continue;
      }
      const s = f.strength;
      put(
        glow,
        { x: f.p.x, y: f.p.y + 0.08, z: f.p.z },
        7 * s,
        7 * s,
        f.seed,
        fade,
      );
      for (
        let i = 0;
        i <
        (performanceSettings.detail < 0.5
          ? 1
          : performanceSettings.detail === 1
            ? 3
            : 2);
        i++
      ) {
        const phase = clock * (2.8 + i * 0.45) + f.seed + i * 3.2,
          height = (3.8 + i * 0.9) * s * (0.78 + 0.22 * Math.sin(phase)),
          a = f.seed + i * 2.4;
        put(
          flame,
          {
            x: f.p.x + Math.cos(a) * s * 0.75,
            y: f.p.y + height * 0.48,
            z: f.p.z + Math.sin(a) * s * 0.75,
          },
          (2.5 + i * 0.2) * s,
          height,
          f.seed + i * 7,
          fade,
        );
      }
      if (clock > f.smokeAt) {
        f.smokeAt =
          clock +
          (performanceSettings.detail < 0.5 ? 1.1 : 0.6) +
          Math.random() * 0.35;
        smoke.push({
          p: f.p.clone().add(new T.Vector3(0, 2.8 * s, 0)),
          age: 0,
          life: 5 + Math.random() * 2,
          s: 3.8 * s,
          seed: f.seed,
        });
        if (
          smoke.length >
          (performanceSettings.detail < 0.5
            ? 96
            : performanceSettings.detail === 1
              ? 384
              : 192)
        )
          smoke.shift();
      }
      if (clock > f.emberAt) {
        f.emberAt = clock + 0.6;
        for (let i = 0; i < (performanceSettings.detail < 0.5 ? 1 : 2); i++)
          sparks.push({
            p: f.p.clone(),
            age: 0,
            life: 1.8 + Math.random() * 2,
            v: new T.Vector3(
              1 + Math.random() * 2,
              5 + Math.random() * 5,
              Math.random() * 2,
            ),
            seed: f.seed,
          });
        while (sparks.length > (performanceSettings?.detail === 1 ? 192 : 96))
          sparks.shift();
      }
    }
    for (let i = smoke.length - 1; i >= 0; i--) {
      const p = smoke[i];
      p.age += dt;
      if (p.age >= p.life) {
        smoke.splice(i, 1);
        continue;
      }
      p.p.x += dt * (1.1 + p.age * 0.25);
      p.p.z += dt * 0.35;
      p.p.y += dt * (2.8 + p.s * 0.2);
      const size = p.s * (1 + p.age * 0.55),
        alpha = Math.min(1, p.age * 2) * (1 - p.age / p.life);
      put(cloud, p.p, size, size, p.seed, alpha);
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.age += dt;
      if (p.age >= p.life) {
        sparks.splice(i, 1);
        continue;
      }
      p.p.addScaledVector(p.v, dt);
      p.v.y -= dt * 1.7;
      put(ember, p.p, 0.18, 0.42, p.seed, 1 - p.age / p.life);
    }
    for (const b of batches) {
      b.geometry.instanceCount = b.count;
      b.mesh.visible = b.count > 0;
      if (b.count)
        for (const k of ["center", "extent", "phase"]) {
          const attribute = b.geometry.attributes[k];
          attribute.setUsage(T.DynamicDrawUsage);
          attribute.addUpdateRange(0, b.count * attribute.itemSize);
          attribute.needsUpdate = true;
        }
      b.material.uniforms.time.value = clock;
    }
  }
  function clear() {
    sources.clear();
    smoke.length = sparks.length = 0;
    for (const b of batches) b.geometry.instanceCount = 0;
  }
  return {
    fire: touch,
    update,
    clear,
    active: () => sources.size > 0 || smoke.length > 0 || sparks.length > 0,
    stats: () => ({
      sources: sources.size,
      smoke: smoke.length,
      sparks: sparks.length,
      drawCalls: 4,
    }),
  };
};
