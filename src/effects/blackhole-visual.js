import { performanceSettings } from "../core/settings.js";

// Stylized lensing: analytic light arcs, not a full-screen ray-marching pass.
// Four draws in every quality mode; no textures, bloom targets or dynamic lights.
export function createBlackHoleVisual(T, core) {
  const group = new T.Group();
  const uniforms = { clock: { value: 0 }, collapse: { value: 0 } };
  const vertex = `varying vec2 local;
    void main(){local=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
  const sphere = new T.Mesh(
    new T.SphereGeometry(core, 32, 20),
    new T.MeshBasicMaterial({ color: 0x000002 }),
  );
  group.add(sphere);

  const diskMaterial = new T.ShaderMaterial({
    uniforms,
    vertexShader: vertex,
    fragmentShader: `varying vec2 local;uniform float clock;uniform float collapse;
      void main(){
        float r=length(local),a=atan(local.y,local.x);
        float t=clamp((r-1.06)/2.55,0.,1.);
        float winding=a+log(max(r,1.))*3.8-clock*(1.9/pow(r,.85));
        float wisps=.5+.5*sin(winding*9.+sin(a*3.-clock)*.9);
        float grains=.5+.5*sin(r*65.+sin(winding*15.)*1.5-clock*2.);
        float lanes=.5+.5*sin(r*24.-winding*4.);
        float edge=smoothstep(1.06,1.18,r)*(1.-smoothstep(.5,1.,t));
        float hot=exp(-(r-1.16)*3.4);
        float doppler=.48+.7*pow(.5+.5*cos(a-.6),2.);
        float light=(.24+wisps*.5+grains*.19+lanes*.18+hot*.9)*doppler;
        vec3 color=mix(vec3(1.,.12,.018),vec3(1.,.62,.16),1.-t);
        color=mix(color,vec3(1.,.94,.74),hot*.88);
        color=mix(color,vec3(1.,.9,.7),collapse*.65);
        gl_FragColor=vec4(color*light*(1.05+collapse*1.4),edge*.8);
      }`,
    transparent: true,
    side: T.DoubleSide,
    depthWrite: false,
    blending: T.AdditiveBlending,
    toneMapped: false,
  });
  // Geometry uses core-relative units so all powers share the same shader.
  const disk = new T.Mesh(new T.RingGeometry(1.06, 3.61, 80, 3), diskMaterial);
  disk.scale.setScalar(core);
  disk.rotation.set(-Math.PI / 2 - 0.35, 0, 0.18);
  group.add(disk);

  const lens = new T.Mesh(
    new T.PlaneGeometry(8, 8),
    new T.ShaderMaterial({
      uniforms,
      vertexShader: vertex,
      fragmentShader: `varying vec2 local;uniform float clock;uniform float collapse;
        float band(float x,float center,float width){float d=(x-center)/width;return exp(-d*d);}
        void main(){
          vec2 p=local;float r=length(p);
          if(r<1.005 || r>3.5) discard;
          float a=atan(p.y,p.x);
          float photon=band(r,1.045,.022)+band(r,1.075,.065)*.24;
          float corona=exp(-max(0.,r-1.07)*7.)*.16;
          // The rear disk appears above and below the silhouette as narrow arcs.
          float upper=length(vec2(p.x,p.y/.92));
          float lower=length(vec2(p.x,p.y/.68));
          float arc=band(upper,1.55,.075)*smoothstep(-.08,.32,p.y);
          float echo=band(lower,1.55,.035)*(1.-smoothstep(-.28,.04,p.y))*.45;
          float structure=.65+.23*sin(a*35.-clock*3.)+.12*sin(a*83.+clock*2.);
          float beaming=.55+.55*smoothstep(-1.6,1.6,p.x);
          float light=photon*(1.2+collapse*2.)+corona+(arc+echo)*structure*beaming;
          vec3 color=mix(vec3(1.,.43,.07),vec3(1.,.95,.77),clamp(photon+collapse*.6,0.,1.));
          gl_FragColor=vec4(color*light*1.6,clamp(light,0.,1.));
        }`,
      transparent: true,
      depthWrite: false,
      blending: T.AdditiveBlending,
      toneMapped: false,
    }),
  );
  lens.scale.setScalar(core);
  group.add(lens);

  const count =
    performanceSettings.detail < 0.5
      ? 24
      : performanceSettings.detail === 1
        ? 64
        : 42;
  const segments = 3,
    positions = new Float32Array(count * segments * 6);
  const colors = new Float32Array(positions.length);
  for (let i = 0; i < count * segments * 2; i++) {
    const tail = (i % (segments * 2)) / (segments * 2);
    colors[i * 3] = (1 - tail) * 0.75;
    colors[i * 3 + 1] = (1 - tail) * 0.38;
    colors[i * 3 + 2] = (1 - tail) * 0.12;
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute(
    "position",
    new T.BufferAttribute(positions, 3).setUsage(T.DynamicDrawUsage),
  );
  geometry.setAttribute("color", new T.BufferAttribute(colors, 3));
  const trails = new T.LineSegments(
    geometry,
    new T.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: T.AdditiveBlending,
      toneMapped: false,
    }),
  );
  trails.frustumCulled = false;
  group.add(trails);

  function update(age, camera, duration = 4.6) {
    const collapse = Math.max(0, Math.min(1, (age - duration + 0.65) / 0.65));
    uniforms.clock.value = age;
    uniforms.collapse.value = collapse;
    lens.quaternion.copy(camera.quaternion);
    const growth = Math.min(1, age / 0.35);
    // Fast final pinch, with a hot rim just before debris ejection.
    group.scale.setScalar((1 - (1 - growth) ** 3) * (1 - collapse ** 3 * 0.96));
    disk.rotation.z = 0.18 + age * 0.7;
    disk.rotation.x = -Math.PI / 2 - 0.35 + Math.sin(age * 3.1) * 0.14;
    disk.scale.setScalar(
      core * (1 + Math.sin(age * 12) * 0.045) * (1 - collapse * 0.28),
    );
    trails.material.opacity = 0.65 * (1 - collapse * 0.7);
    for (let n = 0; n < count; n++) {
      const head = (n * 0.61803398875 + age * 0.58) % 1;
      for (let j = 0; j < segments; j++)
        for (let end = 0; end < 2; end++) {
          const t = Math.max(0, head - (j + end) * 0.04);
          const r = core * (1.08 + (1 - t) ** 1.25 * 5.5);
          const angle = n * 2.39996 + age * 1.9 + t * 6.8;
          const index = (n * segments * 2 + j * 2 + end) * 3;
          positions[index] = Math.cos(angle) * r;
          positions[index + 1] =
            Math.sin(n * 7.13 + t * 3.5) * core * (1 - t) * 1.4;
          positions[index + 2] = Math.sin(angle) * r;
        }
    }
    geometry.attributes.position.needsUpdate = true;
  }
  function dispose() {
    for (const mesh of [sphere, disk, lens, trails]) {
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    group.removeFromParent();
  }
  return { group, update, dispose };
}
