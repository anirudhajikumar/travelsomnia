import type { AlarmIntensity, VibrationPreset } from '../types';

/**
 * Manages vibration (Web Vibration API) and audio (Web Audio API) alerts.
 * Designed to be the single point of control for all alert output.
 */
class AlertsManager {
  private audioCtx: AudioContext | null = null;
  private vibrating = false;

  private readonly vibrationDurations: Record<VibrationPreset, number> = {
    gentle: 1000,
    medium: 2500,
    strong: 8000,
    max: 15000,
  };

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

  vibratePreset(preset: VibrationPreset): void {
    if (!this.canVibrate()) return;
    this.stopVibration();
    this.vibrating = true;
    const duration = this.vibrationDurations[preset];
    navigator.vibrate(duration);
    setTimeout(() => { this.vibrating = false; }, duration);
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

  /** Notify the user that the destination has been reached. */
  triggerArrival(destinationName: string, preset: VibrationPreset, soundEnabled: boolean): void {
    this.vibratePreset(preset);
    if (soundEnabled) this.playAlarmSound('critical');

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Destination reached', {
        body: `You have arrived at ${destinationName}.`,
        tag: 'travelsomnia-destination',
      });
    }
  }

  async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch { /* ignore notification permission errors */ }
    }
  }

  dispose(): void {
    this.stopVibration();
    this.audioCtx?.close();
    this.audioCtx = null;
  }
}

export const alertsManager = new AlertsManager();
