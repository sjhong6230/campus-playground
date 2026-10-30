import { performanceSettings } from "../core/settings.js";
// Bound fill rate on desktop/4K displays without changing CSS/UI resolution.
export function resolutionRatio(width, height, deviceRatio, scale, mode) {
  const budget =
    mode === "high" ? 4_000_000 : mode === "low" ? 900_000 : 1_800_000;
  const base = mode === "high" ? 1.6 : mode === "low" ? 0.85 : 1.25;
  return (
    Math.min(
      deviceRatio,
      base,
      Math.sqrt(budget / Math.max(1, width * height)),
    ) * scale
  );
}
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
  let renderScale = 1,
    perfElapsed = 0,
    perfFrames = 0,
    lastQualityChange = 0;
  Object.assign(performanceSettings, {
    detail: qualityMode === "high" ? 1 : qualityMode === "low" ? 0.4 : 0.65,
  });
  function resize() {
    renderer.setPixelRatio(
      resolutionRatio(
        canvas.clientWidth || 1280,
        canvas.clientHeight || 720,
        devicePixelRatio,
        renderScale,
        qualityMode,
      ),
    );
    canvas.dataset.renderRatio = renderer.getPixelRatio().toFixed(2);
  }
  resize();
  renderer.shadowMap.enabled = qualityMode !== "low";
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;

  const qualitySelect = select;
  qualitySelect.value = qualityMode;
  qualitySelect.onchange = () => {
    qualityMode = qualitySelect.value;
    renderScale = 1;
    performanceSettings.detail =
      qualityMode === "high" ? 1 : qualityMode === "low" ? 0.4 : 0.65;
    resize();
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
    resize,
    get shadowInterval() {
      return qualityMode === "high" ? 0.08 : renderScale < 0.8 ? 0.3 : 0.2;
    },
    get minimumFrameMs() {
      return 1000 / (qualityMode === "low" ? 30 : 60);
    },
    resetSampling() {
      perfElapsed = perfFrames = 0;
    },
    record(realDelta, time) {
      perfElapsed += realDelta;
      perfFrames++;
      if (perfElapsed >= 1.2) {
        const fps = perfFrames / perfElapsed;
        canvas.dataset.fps = Math.round(fps);
        canvas.dataset.renderRatio = renderer.getPixelRatio().toFixed(2);
        canvas.dataset.drawCalls = renderer.info.render.calls;
        if (qualityMode === "auto" && time - lastQualityChange > 1.5) {
          const next =
            fps < 48
              ? Math.max(0.6, renderScale - 0.15)
              : fps > 57 && time - lastQualityChange > 8
                ? Math.min(1, renderScale + 0.05)
                : renderScale;
          if (Math.abs(next - renderScale) > 0.01) {
            renderScale = next;
            resize();
            performanceSettings.detail = renderScale < 0.8 ? 0.4 : 0.65;
            lastQualityChange = time;
          }
        }
        perfElapsed = perfFrames = 0;
      }
    },
  };
}
