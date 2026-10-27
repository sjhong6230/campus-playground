/* Continuous billowing surface, procedural smoke shading, and rising wisps. */
export const createMushroomCloud = function (T, root, origin) {
  const group = new T.Group();
  group.position.copy(origin);
  root.add(group);
  const smooth = (t) => t * t * (3 - 2 * t),
    mix = (a, b, t) => a + (b - a) * t;
  function hash(x, y, z) {
    const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
    return n - Math.floor(n);
  }
  function noise(x, y, z) {
    const ix = Math.floor(x),
      iy = Math.floor(y),
      iz = Math.floor(z),
      u = smooth(x - ix),
      v = smooth(y - iy),
      w = smooth(z - iz);
    return mix(
      mix(
        mix(hash(ix, iy, iz), hash(ix + 1, iy, iz), u),
        mix(hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), u),
        v,
      ),
      mix(
        mix(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), u),
        mix(hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), u),
        v,
      ),
      w,
    );
  }
  // A single closed profile joins the stem, rolled lip and domed crown.
  const profile = [
    [0, 0],
    [12, 0],
    [13, 2],
    [9, 7],
    [6, 14],
    [6.5, 23],
    [9, 31],
    [15, 36],
    [23, 36],
    [29, 39],
    [31, 44],
    [28, 49],
    [23, 53],
    [16, 56],
    [8, 58],
    [0, 59],
  ];
  const curve = new T.CatmullRomCurve3(
    profile.map(([r, y]) => new T.Vector3(r, y, 0)),
  );
  const geometry = new T.LatheGeometry(
    curve.getPoints(100).map((v) => new T.Vector2(Math.max(0, v.x), v.y)),
    144,
  );
  const pos = geometry.attributes.position,
    normal = geometry.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i),
      y = pos.getY(i),
      z = pos.getZ(i),
      a = Math.atan2(z, x);
    const envelope =
      Math.min(1, Math.max(0, y / 5)) * Math.min(1, Math.hypot(x, z) / 3);
    const broad = noise(x * 0.12 + 4, y * 0.12, z * 0.12) * 2 - 1,
      detail = noise(x * 0.33, y * 0.33 + 6, z * 0.33) * 2 - 1;
    const d =
      envelope * (broad * 6 + detail * 1.8 + Math.sin(a * 9 + y * 0.15) * 0.8);
    pos.setXYZ(
      i,
      x + normal.getX(i) * d,
      y + normal.getY(i) * d,
      z + normal.getZ(i) * d,
    );
  }
  geometry.computeVertexNormals();
  const uniforms = { age: { value: 0 }, fade: { value: 1 } };
  const material = new T.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: true,
    extensions: { derivatives: true },
    vertexShader: `varying vec3 vP;varying vec3 vN;uniform float age;
   void main(){vP=position;vN=normalize(mat3(modelMatrix)*normal);
    float stem=1.0-smoothstep(26.0,40.0,position.y);
    vec3 p=position+normal*(sin(position.y*.5-age*1.6+atan(position.z,position.x)*5.0)*.32*stem);
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader: `precision highp float;varying vec3 vP;varying vec3 vN;uniform float age;uniform float fade;
   float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
   float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
   float fbm(vec3 p){return .57*noise(p)+.28*noise(p*2.03+3.7)+.15*noise(p*4.09+7.1);}
   void main(){
    float radius=length(vP.xz),angle=atan(vP.z,vP.x);
    // The cap's toroidal flow rolls outwards and back over its shoulder.
    float roll=atan(vP.y-43.0,radius-22.0);
    vec3 flow=vP*.31+vec3(sin(angle)*age*.08,-age*.15,cos(angle)*age*.08);
    flow.y+=sin(roll-age*.35)*1.2*smoothstep(30.0,40.0,vP.y);
    float n=fbm(flow),fine=noise(flow*4.5);
    vec3 N=normalize(vN),q0=dFdx(vP),q1=dFdy(vP);
    vec3 S=cross(q1,N),U=cross(N,q0);float det=dot(q0,S);
    vec3 grad=sign(det)*(dFdx(n)*S+dFdy(n)*U);
    N=normalize(max(abs(det),.00001)*N-grad*1.5);
    float light=max(0.0,dot(N,normalize(vec3(-.5,.85,.4))));
    vec3 smoke=mix(vec3(.025,.026,.028),vec3(.29,.27,.24),light*.8+n*.2);
    smoke*=.5+n*.8;smoke+=(fine-.5)*.018;
    float heat=(1.0-smoothstep(35.0,49.0,vP.y))*smoothstep(0.0,12.0,vP.y);
    heat*=exp(-age*.13)*(.55+2.0*pow(n,3.0));
    heat*=.6+.4*(1.0-max(vN.y,0.0));
    vec3 glow=mix(vec3(.78,.12,.018),vec3(1.0,.48,.09),smoothstep(.42,.78,n));
    vec3 color=smoke+glow*heat*1.55;
    gl_FragColor=vec4(color,fade);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`,
  });
  const body = new T.Mesh(geometry, material);
  group.add(body);
  // Soft, noisy translucent fringes break up the edge without separate solid balls.
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 96;
  const ctx = canvas.getContext("2d"),
    pixels = ctx.createImageData(96, 96);
  for (let y = 0; y < 96; y++)
    for (let x = 0; x < 96; x++) {
      const r = Math.hypot((x - 48) / 48, (y - 48) / 48),
        n = noise(x * 0.09, y * 0.09, 5),
        i = (y * 96 + x) * 4;
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = 255;
      pixels.data[i + 3] = Math.round(
        Math.max(0, 1 - r * r) * Math.max(0, 1 - r) * (0.35 + n * 0.65) * 210,
      );
    }
  ctx.putImageData(pixels, 0, 0);
  const map = new T.CanvasTexture(canvas),
    wisps = [];
  for (let i = 0; i < 26; i++) {
    const a = i * 2.39996,
      cap = i < 18;
    const s = new T.Sprite(
      new T.SpriteMaterial({
        map,
        color: cap ? "#82766a" : "#66564a",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    group.add(s);
    wisps.push({ s, a, cap, phase: i * 0.71 });
  }
  let age = 0,
    disposed = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    root.remove(group);
    geometry.dispose();
    material.dispose();
    map.dispose();
    for (const w of wisps) w.s.material.dispose();
  }
  function update(dt) {
    if (disposed) return false;
    age += dt;
    if (age >= 18) {
      dispose();
      return false;
    }
    const growth = 1 - Math.exp(-age * 0.8),
      fade = 1 - smooth(Math.max(0, Math.min(1, (age - 13) / 5)));
    group.scale.set(
      0.45 + growth * 0.55 + age * 0.006,
      0.2 + growth * 0.8,
      0.45 + growth * 0.55 + age * 0.006,
    );
    uniforms.age.value = age;
    uniforms.fade.value = fade;
    // Keep opaque depth while dense; allow a clean dissolve near the end.
    material.depthWrite = fade > 0.85;
    for (const w of wisps) {
      const roll = age * 0.23 + w.phase,
        r = w.cap ? 27 + Math.sin(roll) * 3 : 7 + Math.sin(roll) * 1.5;
      w.s.position.set(
        Math.cos(w.a) * r,
        w.cap ? 43 + Math.cos(roll) * 6 : 8 + ((w.phase * 5 + age * 3) % 26),
        Math.sin(w.a) * r,
      );
      const size = w.cap ? 13 + Math.sin(roll) * 2 : 9;
      w.s.scale.set(size, size * 1.05, 1);
      w.s.material.rotation = w.a + age * 0.035;
      w.s.material.opacity = (w.cap ? 0.42 : 0.3) * growth * fade;
    }
    return true;
  }
  update(0);
  return { update, dispose };
};
