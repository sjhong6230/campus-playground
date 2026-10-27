import { performanceSettings } from "../core/settings.js";
/** Adaptive resolution and shadow settings, shared by every school. */
export function createQualityController({
  T,
  renderer,
  scene,
  sun,
  canvas,
  select,
  toast,
  onShadowDirty,
  getTime,
}) {
  let qualityMode = "auto";
  try {
    const saved = localStorage.getItem("campus-quality");
    if (["auto", "low", "high"].includes(saved)) qualityMode = saved;
  } catch {}
  let renderRatio =
      qualityMode === "low" ? 0.85 : qualityMode === "high" ? 1.6 : 1.25,
    perfElapsed = 0,
    perfFrames = 0,
    lastQualityChange = 0;
  Object.assign(performanceSettings, {
    detail: qualityMode === "high" ? 1 : 0.65,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, renderRatio));
  renderer.shadowMap.enabled = qualityMode !== "low";
  renderer.shadowMap.autoUpdate = true;
  renderer.shadowMap.needsUpdate = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;

  const qualitySelect = select;
  qualitySelect.value = qualityMode;
  qualitySelect.onchange = () => {
    qualityMode = qualitySelect.value;
    renderRatio =
      qualityMode === "low" ? 0.85 : qualityMode === "high" ? 1.6 : 1.25;
    performanceSettings.detail = qualityMode === "high" ? 1 : 0.65;
    renderer.setPixelRatio(Math.min(devicePixelRatio, renderRatio));
    const enabled = qualityMode !== "low";
    if (renderer.shadowMap.enabled !== enabled) {
      renderer.shadowMap.enabled = enabled;
      scene.traverse((o) => {
        if (o.material)
          for (const m of Array.isArray(o.material) ? o.material : [o.material])
            m.needsUpdate = true;
      });
    }
    renderer.shadowMap.needsUpdate = true;
    sun.shadow.needsUpdate = true;
    onShadowDirty();
    lastQualityChange = getTime();
    perfElapsed = perfFrames = 0;
    try {
      localStorage.setItem("campus-quality", qualityMode);
    } catch {}
    toast(
      qualityMode === "low"
        ? "가벼움 · 해상도와 그림자를 줄였어요"
        : qualityMode === "high"
          ? "고화질 모드"
          : "성능에 맞춰 해상도를 자동 조절합니다",
    );
  };

  return {
    get minimumFrameMs() {
      return qualityMode === "low" ? 29 : 14;
    },
    resetSampling() {
      perfElapsed = perfFrames = 0;
    },
    record(realDelta, time) {
      perfElapsed += realDelta;
      perfFrames++;
      if (perfElapsed >= 2) {
        const fps = perfFrames / perfElapsed;
        canvas.dataset.fps = Math.round(fps);
        canvas.dataset.renderRatio = renderer.getPixelRatio().toFixed(2);
        canvas.dataset.drawCalls = renderer.info.render.calls;
        if (qualityMode === "auto" && time - lastQualityChange > 4) {
          const next =
            fps < 38
              ? Math.max(0.7, renderRatio - 0.15)
              : fps > 55
                ? Math.min(1.25, renderRatio + 0.1)
                : renderRatio;
          if (Math.abs(next - renderRatio) > 0.01) {
            renderRatio = next;
            renderer.setPixelRatio(Math.min(devicePixelRatio, renderRatio));
            lastQualityChange = time;
          }
        }
        perfElapsed = perfFrames = 0;
      }
    },
  };
}
