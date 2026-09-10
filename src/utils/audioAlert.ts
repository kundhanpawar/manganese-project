// Clean Web Audio synthesizer for excavation team priority alert
let audioCtx: AudioContext | null = null;

export function playExcavationAlertTone(count = 2) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx || audioCtx.state === 'suspended') {
      audioCtx = new AudioContextClass();
    }

    const now = audioCtx.currentTime;
    for (let i = 0; i < count; i++) {
      const startTime = now + i * 0.22;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, startTime); // B5 note
      osc.frequency.setValueAtTime(1318.51, startTime + 0.08); // E6 note

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    }
  } catch {
    // Gracefully handle any browser audio policies
  }
}
