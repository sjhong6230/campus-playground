import { tools } from "../tools/catalog.js";
/** Picking, pointer/touch controls, camera, view toggles and labels. */
export function createControls({
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
  onShadowDirty,
  onResize = () => {},
}) {
  let width = 1,
    height = 1,
    azimuth = 0.57,
    elevation = 0.71,
    distance = 230,
    labelsVisible = true,
    isNight = false,
    soundEnabled = false,
    pointer = null,
    pinch = null;
  const touches = new Map();
  const raycaster = new T.Raycaster(),
    mouse = new T.Vector2(),
    groundPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);
  function pick(x, y) {
    mouse.set((x / width) * 2 - 1, (-y / height) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    const buildingHit = raycaster
        .intersectObject(blockMesh)
        .find((h) => !blocks[fractured.owners[h.faceIndex]].active),
      sceneryHit = scenery.pick(raycaster),
      ground = raycaster.intersectObject(terrain.mesh)[0];
    const hit = [buildingHit, sceneryHit, ground]
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)[0];
    return hit
      ? hit.point.clone().sub(world.position)
      : raycaster.ray.intersectPlane(groundPlane, new T.Vector3());
  }
  function home() {
    azimuth = 0.4;
    elevation = 0.78;
    distance = Math.max(290, 310 / (width / height));
  }
  $("home").onclick = () => {
    home();
    toast("처음 시점으로 돌아왔어요");
  };
  $("top").onclick = () => {
    home();
    elevation = 1.47;
    azimuth = 0;
  };
  $("labels").onclick = () => {
    labelsVisible = !labelsVisible;
    $("labels-layer").style.display = labelsVisible ? "" : "none";
    $("labels").setAttribute("aria-pressed", labelsVisible);
  };
  $("night").onclick = () => {
    isNight = !isNight;
    document.body.classList.toggle("night", isNight);
    $("night").setAttribute("aria-pressed", isNight);
    const c = isNight ? "#172f34" : "#c6cfd2";
    scene.background.set(c);
    scene.fog.color.set(c);
    ambient.intensity = isNight ? 0.65 : 1.25;
    sun.intensity = isNight ? 0.7 : 3.1;
    sun.color.set(isNight ? "#a8cde2" : "#fff2df");
    onShadowDirty();
    renderer.toneMappingExposure = isNight ? 1 : 0.95;
  };
  $("sound").onclick = () => {
    soundEnabled = !soundEnabled;
    $("sound").setAttribute("aria-pressed", soundEnabled);
    $("sound").title = soundEnabled ? "소리 끄기" : "소리 켜기";
    $("sound").setAttribute("aria-label", $("sound").title);
    if (soundEnabled) audio("enable");
    else audio.stop();
    toast(soundEnabled ? "소리를 켰어요" : "소리를 껐어요");
  };
  const dialog = $("help-dialog");
  $("help").onclick = () => dialog.showModal();
  dialog.querySelector(".close").onclick = () => dialog.close();
  dialog.querySelector(".start").onclick = () => dialog.close();
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 1) {
      pointer = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        moved: false,
        button: e.button,
      };
    } else {
      pointer = null;
      const [a, b] = [...touches.values()];
      pinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!touches.has(e.pointerId)) return;
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size > 1) {
      const [a, b] = [...touches.values()],
        d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch && d > 0)
        distance = Math.max(100, Math.min(900, (distance * pinch) / d));
      pinch = d;
      return;
    }
    if (!pointer) return;
    const dx = e.clientX - pointer.lastX,
      dy = e.clientY - pointer.lastY;
    if (Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) > 5)
      pointer.moved = true;
    if (pointer.moved) {
      azimuth -= dx * 0.006;
      elevation = Math.max(0.25, Math.min(1.48, elevation + dy * 0.004));
    }
    pointer.lastX = e.clientX;
    pointer.lastY = e.clientY;
  });
  canvas.addEventListener("pointerup", (e) => {
    touches.delete(e.pointerId);
    if (
      pointer &&
      pointer.id === e.pointerId &&
      !pointer.moved &&
      pointer.button === 0
    ) {
      const p = pick(e.clientX, e.clientY);
      if (p && Math.abs(p.x) < 78 && Math.abs(p.z) < 60) fire(p);
    }
    pointer = null;
    if (touches.size < 2) pinch = null;
  });
  canvas.addEventListener("pointercancel", (e) => {
    touches.delete(e.pointerId);
    pointer = null;
    pinch = null;
  });
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      distance = Math.max(
        100,
        Math.min(900, distance * Math.exp(e.deltaY * 0.001)),
      );
    },
    { passive: false },
  );
  document.addEventListener("keydown", (e) => {
    if (dialog.open || e.target.matches("input,textarea,select")) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      undo();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const shortcut = tools.find((tool) => tool.key === e.key);
    if (shortcut) selectTool(shortcut.id);
    if (e.key.toLowerCase() === "r") restore();
  });
  function resize() {
    onResize();
    const mobile = width < 650;
    width = innerWidth;
    height = innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (mobile !== width < 650) home();
  }
  window.addEventListener("resize", resize);
  resize();
  home();
  const labelVector = new T.Vector3();
  const cameraTarget = new T.Vector3(),
    centerVector = new T.Vector3(),
    northVector = new T.Vector3();
  let lastCamera = {},
    lastField,
    lastLabels;
  function updateCamera(time, shake) {
    if (
      !shake &&
      !lastCamera.shake &&
      lastCamera.width === width &&
      lastCamera.height === height &&
      lastCamera.azimuth === azimuth &&
      lastCamera.elevation === elevation &&
      lastCamera.distance === distance
    )
      return false;
    lastCamera = { width, height, azimuth, elevation, distance, shake };
    camera.position.set(
      Math.sin(azimuth) * Math.cos(elevation) * distance,
      Math.sin(elevation) * distance,
      Math.cos(azimuth) * Math.cos(elevation) * distance,
    );
    camera.lookAt(cameraTarget);
    camera.setViewOffset(
      width,
      height,
      (width < 1000 ? 0 : -width * 0.045) + shake * Math.sin(time * 75) * 5,
      height * 0.08 + shake * Math.cos(time * 69) * 4,
      width,
      height,
    );
    camera.updateMatrixWorld();
    const center = centerVector.set(0, 0, 0).project(camera),
      north = northVector.set(0, 0, -15).project(camera);
    $("north-arrow").style.transform =
      "rotate(" +
      Math.atan2((north.x - center.x) * width, (north.y - center.y) * height) +
      "rad)";
    return true;
  }

  return {
    get azimuth() {
      return azimuth;
    },
    get soundEnabled() {
      return soundEnabled;
    },
    update(time, shake, field = null) {
      const moved = updateCamera(time, shake);
      if (!moved && field === lastField && labelsVisible === lastLabels)
        return false;
      lastField = field;
      lastLabels = labelsVisible;
      if (labelsVisible)
        for (const b of buildings) {
          labelVector.set(b.x, b.baseY + b.floors * 3 + 5, b.z).project(camera);
          b.label.style.left = (labelVector.x * 0.5 + 0.5) * width + "px";
          b.label.style.top = (-labelVector.y * 0.5 + 0.5) * height + "px";
          b.label.style.display =
            labelVector.z > 1 ||
            (field &&
              Math.hypot(b.x - field.p.x, b.z - field.p.z) < field.core * 3.5)
              ? "none"
              : "";
        }
      return moved;
    },
  };
}
