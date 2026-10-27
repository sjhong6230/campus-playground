// Original procedural Foley, cached as AudioBuffers. No external assets.
export const soundProfiles = {
  bombing: { duration: 1.65, bass: 76, decay: 3.4, grit: 0.75 },
  meteor: { duration: 2.5, bass: 54, decay: 2.1, grit: 0.9 },
  nuke: { duration: 4.8, bass: 39, decay: 1.2, grit: 0.65 },
  quake: { duration: 2.8, bass: 35, decay: 1.1, grit: 0.7 },
  volcanicBomb: { duration: 1.15, bass: 85, decay: 4.4, grit: 0.8 },
  volcano: { duration: 3, bass: 44, decay: 1.3, grit: 0.8 },
  lava: { duration: 0.7, bass: 62, decay: 5, grit: 0.2 },
  shockwave: { duration: 1.8, bass: 63, decay: 3, grit: 0.55 },
  blackhole: { duration: 3.2 },
  fall: { duration: 1.3 },
  enable: { duration: 0.16 },
};

export function synthesizeSound(kind, sampleRate) {
  const profile = soundProfiles[kind] || soundProfiles.bombing;
  const samples = new Float32Array(Math.ceil(profile.duration * sampleRate));
  let seed = 18371,
    low = 0,
    mid = 0,
    phase = 0;
  const lowBlend = 1 - Math.exp((-2 * Math.PI * 180) / sampleRate);
  const midBlend = 1 - Math.exp((-2 * Math.PI * 2100) / sampleRate);
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate,
      progress = t / profile.duration;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const white = seed / 2147483648 - 1;
    low += (white - low) * lowBlend;
    mid += (white - mid) * midBlend;
    const fade =
      Math.min(1, t / 0.008) * Math.min(1, (profile.duration - t) / 0.09);
    let value;
    if (kind === "fall") {
      phase += (2 * Math.PI * (780 - progress * 510)) / sampleRate;
      value =
        (Math.sin(phase) * 0.12 + mid * 0.32) * Math.sin(Math.PI * progress);
    } else if (kind === "blackhole") {
      phase += (2 * Math.PI * (45 + progress * 65)) / sampleRate;
      const swell = Math.sin(Math.PI * progress) ** 0.7;
      value =
        (low * 2 + Math.sin(phase) * 0.17 + Math.sin(phase * 1.013) * 0.1) *
        swell;
    } else if (kind === "enable") {
      value = mid * 0.24 * Math.exp(-t * 30);
    } else {
      phase +=
        (2 * Math.PI * (profile.bass * Math.exp(-t * 2.5) + 24)) / sampleRate;
      const rolling = kind === "quake" || kind === "volcano";
      const envelope = Math.exp(-t * profile.decay);
      const transient = rolling ? 0.05 : Math.exp(-t * 38) * 0.65;
      const rumble = low * 2.8 * (0.72 + 0.28 * Math.sin(t * 31));
      const ticks = Math.max(0, Math.sin(t * 57) * Math.sin(t * 91) - 0.72) * 2;
      value =
        white * transient +
        (rumble + Math.sin(phase) * 0.26 + mid * profile.grit) * envelope +
        mid * ticks * Math.exp(-t * 1.7) * Math.min(1, t * 4);
      if (rolling) value *= Math.min(1, t * 7);
    }
    samples[i] = Math.tanh(value * 1.1) * fade * 0.8;
  }
  return samples;
}
