import { createScoreStore } from "./scores.js";
import { createControls } from "../ui/controls.js";
import { createNuclearProp } from "../tools/nuclear.js";
import { tools, toolById } from "../tools/catalog.js";
import { createToolActions } from "../tools/actions.js";
import { createHistory, captureBlocks, restoreBlocks } from "./history.js";
import { createDebrisSimulation } from "../physics/debris.js";
import { createImpactAudio } from "../audio/impact.js";
import { createBuildings } from "../world/buildings.js";
import { createDamageSystem } from "../physics/damage.js";
import { createCampusTerrain } from "../world/terrain.js";
import { createCampusFX } from "../effects/fx.js";
import { createCampusScenery } from "../world/scenery.js";
import { CampusBombing } from "../tools/bombing.js";
import { CampusBlackHole } from "../tools/blackhole.js";
import { createCampusShockwave } from "../effects/shockwave.js";
import { CampusVisuals } from "../rendering/materials.js";
import { createCampusVolcano } from "../tools/volcano.js";
import { createQualityController } from "../rendering/quality.js";
import { createFrameGate } from "../rendering/frame-gate.js";
/* Independent campus sandbox. Rendering: Three.js (MIT). */
export function createGame(school) {
  "use strict";
  const $ = (id) => document.getElementById(id),
    canvas = $("scene");
  if (!window.THREE) {
    $("loading").textContent =
      "3D 라이브러리를 찾지 못했습니다. ZIP을 전부 압축 해제한 뒤 index.html을 열어주세요.";
    return;
  }
  const T = window.THREE,
    reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch (e) {
    $("loading").textContent =
      "WebGL을 사용할 수 없습니다. 브라우저의 하드웨어 가속을 켜고 다시 열어주세요.";
    return;
  }
  let shadowDirty = true,
    lastShadow = 0;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  const scene = new T.Scene();
  scene.background = new T.Color("#c6cfd2");
  scene.fog = new T.Fog("#c6cfd2", 850, 1300);
  const camera = new T.PerspectiveCamera(36, 1, 0.1, 1600);
  const ambient = new T.HemisphereLight(0xdde8f0, 0x554e43, 1.25);
  scene.add(ambient);
  const sun = new T.DirectionalLight(0xfff2df, 3.1);
  sun.position.set(-70, 110, 70);
  sun.castShadow = true;
  sun.shadow.autoUpdate = false;
  sun.shadow.needsUpdate = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -100,
    right: 100,
    top: 100,
    bottom: -100,
    near: 1,
    far: 350,
  });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.2;
  scene.add(sun);
  const world = new T.Group();
  scene.add(world);
  const quality = createQualityController({
    T,
    renderer,
    scene,
    sun,
    canvas,
    select: $("quality"),
    toast,
    onShadowDirty: () => {
      shadowDirty = true;
    },
    getTime: () => time,
  });
  const visuals = CampusVisuals.create(T);
  const fx = createCampusFX(T, world);
  let power = 2,
    flashLevel = 0,
    captionLife = 0;
  $("power").oninput = () => {
    power = Number($("power").value);
    $("power-value").textContent = power + "×";
  };
  const mat = (c) => new T.MeshStandardMaterial({ color: c, roughness: 0.9 });
  const materials = {
    edge: mat("#79796d"),
    hill: mat("#6d7958"),
  };
  const boxGeometry = new T.BoxGeometry(1, 1, 1);
  function box(x, y, z, w, h, d, m, parent = world) {
    const o = new T.Mesh(boxGeometry, m);
    o.position.set(x, y, z);
    o.scale.set(w, h, d);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  }
  const layout = school.createLayout(),
    terrain = createCampusTerrain(T, world, layout, school.paintGround);
  // Skirt and bottom leave room for true depressions in the top surface.
  box(0, -10, 0, 151, 1, 118, materials.edge);

  // Seeded scenery keeps the scene identical after reload.
  let seed = 731;
  function rng() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const scenery = createCampusScenery(
    T,
    world,
    terrain,
    fx,
    rng,
    visuals,
    layout,
  );
  for (const [x, z] of layout.hills) {
    const hill = new T.Mesh(
      new T.IcosahedronGeometry(17 + rng() * 8, 3),
      materials.hill,
    );
    hill.position.set(x, 0, z);
    hill.scale.set(1, 0.55, 0.7);
    world.add(hill);
  }
  function groundDecor() {
    scenery.ground();
    shadowDirty = true;
  }
  const { blocks, buildings, fractured, blockMesh, architecture } =
    createBuildings({ T, world, layout, visuals, rng, $ });
  function syncBlocks() {
    fractured.sync();
    architecture?.sync();
    shadowDirty = true;
  }
  syncBlocks();
  const dome = layout.observatory
    ? new T.Mesh(
        new T.SphereGeometry(
          layout.observatory.radius ?? 3.3,
          20,
          12,
          0,
          Math.PI * 2,
          0,
          Math.PI / 2,
        ),
        mat(layout.observatory.color ?? "#668783"),
      )
    : null;
  if (dome) {
    dome.position.set(
      layout.observatory.x,
      layout.observatory.y,
      layout.observatory.z,
    );
    dome.castShadow = true;
    world.add(dome);
  }
  const domeSupport = dome
    ? buildings[layout.observatory.building ?? 0].ids
        .map((i) => blocks[i])
        .filter((b) => b.kind === "slab")
        .sort(
          (a, b) =>
            a.origin.distanceToSquared(dome.position) -
            b.origin.distanceToSquared(dome.position),
        )[0]
    : null;
  const domeOffset = domeSupport
    ? dome.position.clone().sub(domeSupport.origin)
    : null;
  const domeEuler = new T.Euler(),
    domeRotation = new T.Quaternion();
  let tool = tools[0].id,
    score = 0,
    hits = 0,
    best = 0;
  let shake = 0,
    time = 0,
    last = performance.now(),
    toastTimer;
  const history = createHistory(),
    effects = [],
    meteors = [],
    fires = [];
  let lastFireEmission = 0,
    nukeSequence = null,
    fireSerial = 0;
  const scoreStore = createScoreStore(school.id);
  best = scoreStore.read();
  $("best").textContent = best.toLocaleString();
  function toast(message) {
    $("toast").textContent = message;
    $("toast").classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2300);
  }
  function selectTool(t) {
    if (!toolById[t]) return;
    tool = t;
    document.querySelectorAll("[data-tool]").forEach((b) => {
      const on = b.dataset.tool === t;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on);
    });
    $("tool-description").textContent = toolById[t].description;
    $("hint-text").textContent =
      toolById[t].hint || "건물·나무·운동장을 눌러보세요";
  }
  document
    .querySelectorAll("[data-tool]")
    .forEach((b) => (b.onclick = () => selectTool(b.dataset.tool)));
  function updateStats() {
    const env = scenery.stats(),
      count = blocks.filter((b) => b.active).length + env.destroyed,
      total = blocks.length + env.total,
      pct =
        count === total
          ? 100
          : count
            ? Math.max(1, Math.min(99, Math.round((count / total) * 100)))
            : 0;
    $("scenery-count").textContent =
      "환경 요소 " + env.destroyed + " / " + env.total;
    $("scene").dataset.sceneryDestroyed = env.destroyed;
    $("score").textContent = String(score).padStart(5, "0");
    $("percent").textContent = pct + "%";
    $("progress").style.width = pct + "%";
    $("hit-count").textContent = hits + " HITS";
    $("rank").textContent =
      pct === 100
        ? "ALL CLEAR"
        : pct > 65
          ? "CHAOS"
          : pct > 25
            ? "NICE!"
            : pct > 0
              ? "KEEP GOING"
              : "READY";
    $("undo").disabled = !history.length;
    if (score > best) {
      best = score;
      $("best").textContent = best.toLocaleString();
      scoreStore.write(best);
    }
    buildings.forEach((b) =>
      b.label.classList.toggle(
        "fallen",
        b.ids.every((i) => blocks[i].active),
      ),
    );
    if (count === total)
      $("hint-text").textContent = "완전히 부쉈어요! 전부 복구해서 다시 시작";
  }
  function snapshot() {
    history.push({
      score,
      hits,
      terrain: terrain.snapshot(),
      volcano: volcano.snapshot(),
      scenery: scenery.snapshot(),
      fires: fires.map((f) => ({ ...f, p: f.p.clone() })),
      blocks: captureBlocks(blocks),
    });
  }
  function clearEffects() {
    audio.stop();
    volcano.clear();
    canvas.dataset.volcano = "idle";
    shockwave.clear();
    shockwaveHit.clear();
    blackHole.clear();
    canvas.dataset.blackhole = "idle";
    canvas.dataset.absorbed = 0;
    canvas.dataset.ejected = 0;
    canvas.dataset.shockwaveDamage = 0;
    bombing.clear();
    canvas.dataset.bombing = "idle";
    removeNuclearProp();
    nukeSequence = null;
    canvas.dataset.nuclear = "idle";
    $("screen-flash").classList.remove("whiteout");
    fx.clear();
    fires.length = 0;
    flashLevel = 0;
    captionLife = 0;
    $("screen-flash").style.opacity = 0;
    $("impact-caption").style.opacity = 0;
    for (const e of effects) {
      world.remove(e.mesh);
      e.mesh.geometry.dispose();
      e.mesh.material.dispose();
    }
    effects.length = 0;
    for (const m of meteors) {
      world.remove(m.mesh);
      m.mesh.geometry.dispose();
      m.mesh.material.dispose();
    }
    meteors.length = 0;
    shake = 0;
    world.position.set(0, 0, 0);
  }
  function restore() {
    clearEffects();
    terrain.restore();
    scenery.restore();
    blocks.forEach((b) => {
      b.p.copy(b.origin);
      b.v.set(0, 0, 0);
      b.r.set(0, 0, 0);
      b.spin.set(0, 0, 0);
      b.active = false;
      b.sleep = false;
      b.delay = 0;
      b.age = 0;
      b.charred = false;
      b.consumed = false;
      b.drawScale = 1;
      b.stretch = 1;
      b.pullAxis = null;
      b.collapse = false;
      b.contactTime = 0;
    });
    score = 0;
    hits = 0;
    history.clear();
    syncBlocks();
    updateStats();
    $("hint-text").textContent = "다시 말끔해졌어요. 한 번 더?";
    toast("캠퍼스를 모두 복구했어요");
  }
  function undo() {
    const previous = history.pop();
    if (!previous) return;
    clearEffects();
    terrain.restore(previous.terrain);
    volcano.restore(previous.volcano);
    scenery.restore(previous.scenery);
    fires.push(...previous.fires);
    restoreBlocks(blocks, previous.blocks);
    score = previous.score;
    hits = previous.hits;
    syncBlocks();
    updateStats();
    $("hint-text").textContent = "건물·나무·운동장을 눌러보세요";
    toast("직전 동작을 되돌렸어요");
  }
  $("reset").onclick = restore;
  $("undo").onclick = undo;
  const audio = createImpactAudio(() => controls.soundEnabled);
  window.addEventListener("pagehide", () => audio.dispose());
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.stop();
  });
  function ring(p, color, radius) {
    const mesh = new T.Mesh(
      new T.RingGeometry(0.87, 1, 64),
      new T.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85,
        side: T.DoubleSide,
        depthWrite: false,
      }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(p.x, p.y + 0.6, p.z);
    world.add(mesh);
    effects.push({ mesh, life: 0, duration: 0.65, radius });
  }
  const { activate, impact, propagate } = createDamageSystem({
    T,
    layout,
    terrain,
    scenery,
    blocks,
    buildings,
    fx,
    fires,
    groundDecor,
    audio,
    reduce,
    getPower: () => power,
    onScore: (n) => {
      score += n;
    },
    onShake: (n) => {
      shake = n;
    },
    nextFireKey: () => ++fireSerial,
    onFeedback: (flash, caption) => {
      flashLevel = flash;
      captionLife = 1.5;
      $("impact-caption").textContent = caption;
    },
    updateStats,
    toast,
  });
  function removeNuclearProp() {
    if (!nukeSequence?.prop) return;
    world.remove(nukeSequence.prop);
    nukeSequence.prop.traverse((o) => {
      if (o.isMesh) {
        o.geometry.dispose();
        o.material.dispose();
      }
    });
    nukeSequence.prop = null;
  }
  function fire(p) {
    audio.unlock();
    if (volcano.active()) {
      toast("화산이 분화 중이에요");
      return;
    }
    if (shockwave.active()) {
      toast("Shockwave가 퍼지고 있어요");
      return;
    }
    if (blackHole.active()) {
      toast("블랙홀이 주변을 흡수하고 있어요");
      return;
    }
    if (bombing.active()) {
      toast("폭탄이 떨어지고 있어요");
      return;
    }
    if (nukeSequence) {
      return;
    }
    if (meteors.length) {
      toast("Meteor가 떨어지고 있어요");
      return;
    }
    snapshot();
    hits++;
    toolActions[tool](p);
  }
  const volcano = createCampusVolcano(
    T,
    world,
    terrain,
    fx,
    (p, mode, strength) => impact(p, mode, strength),
    () => {
      canvas.dataset.volcano = "cooling";
      $("hint-text").textContent = "분화 종료 · 용암이 식고 있어요";
    },
  );
  const bombing = CampusBombing.create(
    T,
    world,
    terrain,
    (p, strength) => impact(p, "bombing", strength),
    (done, total) => {
      canvas.dataset.bombing = done === total ? "idle" : "active";
      canvas.dataset.bombsDropped = done;
      $("hint-text").textContent =
        done === total
          ? "폭탄 impact · 다른 곳을 선택해 보세요"
          : "폭탄 한 발이 떨어지는 중…";
    },
    (x, z) => {
      world.updateMatrixWorld(true);
      const ray = new T.Raycaster(
        new T.Vector3(x + world.position.x, 100, z + world.position.z),
        new T.Vector3(0, -1, 0),
      );
      const hit = ray
        .intersectObject(blockMesh)
        .find((h) => !blocks[fractured.owners[h.faceIndex]].active);
      return Math.max(
        terrain.heightAt(x, z),
        hit ? hit.point.y - world.position.y : -Infinity,
      );
    },
  );
  canvas.dataset.bombing = "idle";
  let nextCapture = 0;
  const shockwaveHit = new Set();
  let waveScore = 0;
  const shockwave = createCampusShockwave(
    T,
    world,
    terrain,
    (p, strength, radius) => {
      let count = 0;
      for (const b of blocks) {
        if (
          b.consumed ||
          shockwaveHit.has(b) ||
          Math.hypot(b.p.x - p.x, b.p.z - p.z) > radius
        )
          continue;
        shockwaveHit.add(b);
        if (!b.active) {
          activate(b, p, "shockwave", strength);
          count++;
        } else if (b.v.length() < 70) {
          activate(b, p, "shockwave", strength);
        }
        b.drawScale = 1;
        b.stretch = 1;
        b.pullAxis = null;
      }
      count += propagate();
      count += scenery.damage(p, "shockwave", strength, radius);
      score += count * 10;
      waveScore += count * 10;
      canvas.dataset.shockwaveDamage = waveScore;
      $("impact-caption").textContent = "EJECTION SHOCKWAVE +" + waveScore;
      captionLife = 1.5;
      updateStats();
    },
    () => {
      canvas.dataset.blackhole = "idle";
      $("hint-text").textContent = "잔해 방출 완료 · 다른 곳을 선택해 보세요";
    },
  );
  const blackHole = CampusBlackHole.create(T, world, (p, strength, ejected) => {
    shockwaveHit.clear();
    waveScore = 0;
    canvas.dataset.ejected = ejected;
    canvas.dataset.blackhole = "shockwave";
    canvas.dataset.shockwaveDamage = 0;
    scenery.beginShockwave();
    shockwave.start(p, strength);
    audio("shockwave", strength);
    flashLevel = reduce ? 0 : 0.22;
    shake = reduce ? 0 : 3;
    captionLife = 1.5;
    $("impact-caption").textContent = "EJECTION SHOCKWAVE";
    $("hint-text").textContent = ejected + "개 잔해 방출 · Shockwave 확산 중";
  });
  const stepDebris = createDebrisSimulation({ blocks, terrain, fx });
  const toolActions = createToolActions({
    T,
    world,
    terrain,
    canvas,
    $,
    getPower: () => power,
    getAzimuth: () => controls.azimuth,
    volcano,
    blackHole,
    bombing,
    impact,
    audio,
    ring,
    meteors,
    updateStats,
    resetCapture: () => {
      nextCapture = 0;
    },
    startNuclear: (p) => {
      audio("fall", 1.5);
      const target = p.clone();
      target.y = terrain.heightAt(p.x, p.z) + 0.2;
      nukeSequence = {
        p: target,
        age: 0,
        phase: "fall",
        prop: createNuclearProp(T, world, target),
      };
      canvas.dataset.nuclear = "falling";
      $("hint-text").textContent = "낙하 중…";
      ring(target, "#e7ae47", 9);
    },
  });
  for (const tool of tools)
    if (typeof toolActions[tool.id] !== "function")
      throw new Error("Missing tool action: " + tool.id);
  const controls = createControls({
    T,
    canvas,
    camera,
    renderer,
    scene,
    world,
    ambient,
    sun,
    blocks,
    buildings,
    blockMesh,
    fractured,
    scenery,
    terrain,
    $,
    fire,
    selectTool,
    undo,
    restore,
    toast,
    audio,
    onShadowDirty: () => {
      shadowDirty = true;
    },
  });
  const shouldRender = createFrameGate();
  function frame(now) {
    if (document.hidden) {
      last = now;
      quality.resetSampling();
      requestAnimationFrame(frame);
      return;
    }
    if (now - last < quality.minimumFrameMs) {
      requestAnimationFrame(frame);
      return;
    }
    const realDelta = Math.min((now - last) / 1000, 0.25),
      dt = Math.min(realDelta, 0.05);
    last = now;
    time += dt;
    bombing.update(dt);
    volcano.update(dt);
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.age += dt;
      const t = Math.min((m.age / 1.1) ** 1.7, 1);
      m.mesh.position.set(
        m.target.x - 45 * (1 - t),
        100 * (1 - t) + m.target.y * t,
        m.target.z - 25 * (1 - t),
      );
      m.mesh.rotation.x += dt * 3;
      fx.trail(m.mesh.position, dt);
      if (t >= 1) {
        impact(m.target, "meteor");
        world.remove(m.mesh);
        m.mesh.geometry.dispose();
        m.mesh.material.dispose();
        meteors.splice(i, 1);
      }
    }
    if (nukeSequence) {
      const n = nukeSequence;
      n.age += realDelta;
      if (n.phase === "fall") {
        const t = Math.min(1, n.age / 1.5);
        n.prop.position.y = n.p.y + 6 + (105 - n.p.y - 6) * (1 - t * t);
        n.prop.rotation.y += dt * 0.8;
        if (t >= 1) {
          removeNuclearProp();
          n.phase = "blast";
          n.age = 0;
          canvas.dataset.nuclear = "flash";
          $("screen-flash").classList.add("whiteout");
          impact(n.p, "nuke");
        }
      } else {
        // Debris keeps falling through the flash and reveal; never snap it flat.
        if (n.age >= 0.24 && n.age < 1.6) canvas.dataset.nuclear = "white";
        if (n.age >= 1.6) canvas.dataset.nuclear = "reveal";
        if (n.age >= 2.7) {
          nukeSequence = null;
          canvas.dataset.nuclear = "idle";
          $("screen-flash").classList.remove("whiteout");
          flashLevel = 0;
        }
      }
    }

    blackHole.update(dt, camera);
    shockwave.update(dt);
    const field = blackHole.field();
    if (field) {
      let count = 0;
      for (const b of blocks) {
        if (b.consumed || b.p.distanceTo(field.p) > field.radius) continue;
        if (!b.active) {
          activate(b, field.p, "quake", field.power);
          count++;
        }
        b.sleep = false;
        b.delay = 0;
      }
      if (field.age > nextCapture) {
        nextCapture = field.age + 0.22;
        count += scenery.damage(
          field.p,
          "blackhole",
          field.power,
          field.radius,
        );
      }
      count += propagate();
      if (count) {
        score += count * 10;
        updateStats();
      }
      canvas.dataset.absorbed = blocks.filter((b) => b.consumed).length;
    }
    const detached = propagate();
    if (detached) {
      score += detached * 10;
      updateStats();
    }
    const moving = stepDebris(dt, field, time);
    if (moving) syncBlocks();
    const sceneryMoving = scenery.update(dt, field);
    if (sceneryMoving) shadowDirty = true;
    for (let i = effects.length - 1; i >= 0; i--) {
      const e = effects[i];
      e.life += dt;
      const p = e.life / e.duration;
      e.mesh.scale.setScalar(1 + p * e.radius);
      e.mesh.material.opacity = (1 - p) * 0.65;
      if (p >= 1) {
        world.remove(e.mesh);
        e.mesh.geometry.dispose();
        e.mesh.material.dispose();
        effects.splice(i, 1);
      }
    }
    shake = Math.max(0, shake - dt * 2);
    world.position.x = shake * Math.sin(time * 70) * 0.4;
    world.position.z = shake * Math.cos(time * 63) * 0.3;
    for (let i = fires.length - 1; i >= 0; i--) {
      const f = fires[i];
      f.life -= dt;
      if (f.life <= 0) {
        fires.splice(i, 1);
        continue;
      }
      if (f.id >= 0) f.p.copy(blocks[f.id].p);
      else
        f.p.y = Math.max(terrain.heightAt(f.p.x, f.p.z) + 0.3, f.p.y - dt * 9);
      if (time - lastFireEmission > 0.2)
        fx.fire(
          f.p,
          (f.strength || 1) *
            Math.min(1, f.life / 5) *
            (0.45 + 0.55 * Math.min(1, f.life / 25)),
          f.key,
        );
    }
    if (time - lastFireEmission > 0.2) lastFireEmission = time;
    fx.update(dt);
    canvas.dataset.settled =
      !moving &&
      !sceneryMoving &&
      !volcano.active() &&
      !blackHole.active() &&
      !shockwave.active() &&
      !bombing.active() &&
      !meteors.length &&
      !nukeSequence &&
      blocks.every((b) => b.delay <= 0)
        ? "true"
        : "false";
    flashLevel = nukeSequence
      ? nukeSequence.phase === "fall"
        ? 0
        : nukeSequence.age < 0.24
          ? nukeSequence.age / 0.24
          : nukeSequence.age < 1.6
            ? 1
            : Math.max(0, 1 - (nukeSequence.age - 1.6) / 1.1)
      : Math.max(0, flashLevel - dt * 1.3);
    $("screen-flash").style.opacity = flashLevel;
    captionLife = Math.max(0, captionLife - dt);
    $("impact-caption").style.opacity = Math.min(1, captionLife * 2);
    $("impact-caption").style.transform =
      "translate(-50%," + -12 * (1.5 - captionLife) + "px)";
    const cameraChanged = controls.update(time, shake, field);
    if (dome && domeSupport) {
      domeEuler.set(domeSupport.r.x, domeSupport.r.y, domeSupport.r.z);
      domeRotation.setFromEuler(domeEuler);
      dome.position
        .copy(domeOffset)
        .multiplyScalar(domeSupport.drawScale ?? 1)
        .applyQuaternion(domeRotation)
        .add(domeSupport.p);
      dome.quaternion.copy(domeRotation);
      dome.scale.setScalar(domeSupport.drawScale ?? 1);
      dome.visible = !domeSupport.consumed;
    }
    if (terrain.flush()) shadowDirty = true;
    const animating =
      canvas.dataset.settled !== "true" ||
      fx.active() ||
      volcano.animating() ||
      fires.length > 0 ||
      effects.length > 0 ||
      shake > 0;
    const renderFrame = shouldRender(animating, cameraChanged || shadowDirty);
    if (
      renderer.shadowMap.enabled &&
      shadowDirty &&
      time - lastShadow > quality.shadowInterval
    ) {
      renderer.shadowMap.needsUpdate = true;
      sun.shadow.needsUpdate = true;
      shadowDirty = false;
      lastShadow = time;
    }
    if (renderFrame) {
      renderer.render(scene, camera);
      if (!renderer.shadowMap.enabled) shadowDirty = false;
    }
    canvas.dataset.renderState = renderFrame ? "rendering" : "idle";
    if (animating || cameraChanged) quality.record(realDelta, time);
    else quality.resetSampling();
    requestAnimationFrame(frame);
  }
  selectTool(tool);
  updateStats();
  controls.update(time, shake);
  renderer.render(scene, camera);
  $("loading").remove();
  requestAnimationFrame(frame);
}
