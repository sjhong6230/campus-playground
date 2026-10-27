import { synthesizeSound } from "./synthesis.js";

export function createImpactAudio(
  isEnabled,
  createContext = () =>
    new (window.AudioContext || window.webkitAudioContext)(),
) {
  let context, master;
  const buffers = new Map(),
    voices = new Set(),
    playedAt = new Map();
  function init() {
    if (context) return;
    context = createContext();
    master = context.createGain();
    master.gain.value = 0.62;
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -16;
    limiter.knee.value = 16;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.25;
    master.connect(limiter);
    limiter.connect(context.destination);
  }
  function release(voice) {
    voices.delete(voice);
    voice.source.disconnect();
    voice.gain.disconnect();
  }
  function stopVoice(voice) {
    try {
      voice.source.stop();
    } catch {}
    release(voice);
  }
  function audio(kind = "bombing", strength = 1) {
    if (!isEnabled()) return;
    try {
      init();
      context.resume().catch(() => {});
      const now = context.currentTime;
      // Continuous lava impacts must not pile up voices each frame.
      if (
        now - (playedAt.get(kind) ?? -Infinity) <
        (kind === "lava" ? 0.5 : 0.07)
      )
        return;
      playedAt.set(kind, now);
      if (!buffers.has(kind)) {
        // Foley is band-limited; 24 kHz avoids generating/storing inaudible highs.
        const sampleRate = Math.min(24000, context.sampleRate);
        const data = synthesizeSound(kind, sampleRate);
        const buffer = context.createBuffer(1, data.length, sampleRate);
        buffer.copyToChannel(data, 0);
        buffers.set(kind, buffer);
      }
      if (voices.size >= 6) stopVoice(voices.values().next().value);
      const source = context.createBufferSource(),
        gain = context.createGain();
      source.buffer = buffers.get(kind);
      gain.gain.value = Math.min(1.1, 0.65 + Math.sqrt(strength) * 0.15);
      const voice = { source, gain };
      source.connect(gain);
      gain.connect(master);
      source.onended = () => release(voice);
      voices.add(voice);
      source.start();
    } catch {
      /* Audio is optional when Web Audio is unavailable. */
    }
  }
  audio.unlock = () => {
    if (!isEnabled()) return;
    try {
      init();
      context.resume().catch(() => {});
    } catch {}
  };
  audio.stop = () => {
    for (const voice of [...voices]) stopVoice(voice);
    playedAt.clear();
  };
  audio.dispose = () => {
    audio.stop();
    context?.close().catch(() => {});
    buffers.clear();
  };
  return audio;
}
