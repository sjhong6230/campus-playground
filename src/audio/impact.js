export function createImpactAudio(isEnabled) {
  let audioContext;
  function audio(strength = 1) {
    if (!isEnabled()) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      audioContext.resume();
      const now = audioContext.currentTime,
        osc = audioContext.createOscillator(),
        gain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(120 * strength, now);
      osc.frequency.exponentialRampToValueAtTime(26, now + 0.5);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(now + 0.8);
      const buffer = audioContext.createBuffer(
          1,
          audioContext.sampleRate * 0.8,
          audioContext.sampleRate,
        ),
        data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
      const noise = audioContext.createBufferSource(),
        filter = audioContext.createBiquadFilter(),
        ng = audioContext.createGain();
      noise.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.value = 1400;
      ng.gain.value = 0.22;
      noise.connect(filter);
      filter.connect(ng);
      ng.connect(audioContext.destination);
      noise.start();
    } catch {}
  }
  return audio;
}
