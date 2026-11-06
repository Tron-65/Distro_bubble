/**
 * Procedural Web Audio API sound generator for tactile feedback.
 * Zero external audio assets needed - creates pure synthesized audio nodes.
 */

let audioCtx: AudioContext | null = null;
let isSoundEnabled = false;

export function initAudio() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
}

export function toggleAudio(enabled?: boolean): boolean {
  if (enabled !== undefined) {
    isSoundEnabled = enabled;
  } else {
    isSoundEnabled = !isSoundEnabled;
  }

  if (isSoundEnabled) {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    playPopSound(520, 0.05);
  }
  return isSoundEnabled;
}

export function getAudioEnabled(): boolean {
  return isSoundEnabled;
}

/**
 * Bubble collision or hover blip
 */
export function playPopSound(freq = 440, volume = 0.04) {
  if (!isSoundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.04);

    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

/**
 * Bubble click / selection resonant glass chime
 */
export function playChimeSound(freq = 600, duration = 0.25) {
  if (!isSoundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.8, audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // ignore
  }
}

/**
 * Live hit pulse sound
 */
export function playPulseSound() {
  if (!isSoundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(480, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (e) {
    // ignore
  }
}
