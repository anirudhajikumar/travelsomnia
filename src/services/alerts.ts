import type { AlarmIntensity } from '../types';

/**
 * Manages vibration (Web Vibration API) and audio (Web Audio API) alerts.
 * Designed to be the single point of control for all alert output.
 */
class AlertsManager {
  private audioCtx: AudioContext | null = null;
  private vibrating = false;

  private ctx(): AudioContext {
    if (!this.audioCtx) this.audioCtx = new AudioContext();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    return this.audioCtx;
  }

  /* ── vibration patterns (ms) ──────────────────────────────── */
  private readonly vibPatterns: Record<AlarmIntensity, number[]> = {
    gentle:   [200, 100, 200],
    medium:   [300, 100, 300, 100, 300],
    strong:   [500, 100, 500, 100, 500, 100, 500],
    critical: [1000, 100, 1000, 100, 1000, 100, 1000, 100, 1000],
  };

  /* ── audio configs ────────────────────────────────────────── */
  private readonly audioConfigs: Record<
    AlarmIntensity,
    { freq: number; dur: number; reps: number }
  > = {
    gentle:   { freq: 440, dur: 0.3, reps: 2 },
    medium:   { freq: 520, dur: 0.4, reps: 3 },
    strong:   { freq: 660, dur: 0.5, reps: 4 },
    critical: { freq: 880, dur: 0.8, reps: 6 },
  };

  canVibrate(): boolean {
    return 'vibrate' in navigator;
  }

  vibrate(intensity: AlarmIntensity): void {
    if (!this.canVibrate() || this.vibrating) return;
    this.vibrating = true;
    const pattern = this.vibPatterns[intensity];
    navigator.vibrate(pattern);
    const total = pattern.reduce((a, b) => a + b, 0);
    setTimeout(() => { this.vibrating = false; }, total);
  }

  stopVibration(): void {
    if (this.canVibrate()) {
      navigator.vibrate(0);
      this.vibrating = false;
    }
  }

  playAlarmSound(intensity: AlarmIntensity, volume = 0.5): void {
    try {
      const c = this.ctx();
      const cfg = this.audioConfigs[intensity];
      for (let i = 0; i < cfg.reps; i++) {
        const t = c.currentTime + i * (cfg.dur + 0.15);
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain);
        gain.connect(c.destination);
        osc.frequency.setValueAtTime(cfg.freq, t);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + cfg.dur);
        osc.start(t);
        osc.stop(t + cfg.dur);
      }
    } catch { /* ignore audio errors on unsupported devices */ }
  }

  triggerAlert(
    intensity: AlarmIntensity,
    opts: { vibration: boolean; audio: boolean; volume?: number }
  ): void {
    if (opts.vibration) this.vibrate(intensity);
    if (opts.audio) this.playAlarmSound(intensity, opts.volume ?? 0.5);
  }

  /** Strong multi-modal arrival alert. */
  triggerArrival(): void {
    if (this.canVibrate()) {
      navigator.vibrate([500, 200, 500, 200, 500, 200, 1000, 300, 1000, 300, 1000]);
    }
    try {
      const c = this.ctx();
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const t = c.currentTime + i * 0.2;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain);
        gain.connect(c.destination);
        osc.frequency.setValueAtTime(freq, t);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
      });
    } catch { /* ignore */ }
  }

  dispose(): void {
    this.stopVibration();
    this.audioCtx?.close();
    this.audioCtx = null;
  }
}

export const alertsManager = new AlertsManager();
