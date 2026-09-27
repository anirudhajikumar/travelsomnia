import type { AlarmLevel, AlarmMode } from '../types';

const KEY = {
  MODE: 'ts_alarm_mode',
  SINGLE: 'ts_single_alarm',
  PROG: 'ts_progressive_alarms',
  AUDIO: 'ts_audio_enabled',
  AUDIO_MODE: 'ts_audio_mode',
  DARK_MODE: 'ts_dark_mode',
} as const;

const ALARM_INTENSITIES = new Set(['gentle', 'medium', 'strong', 'critical']);

function isAlarmLevel(value: unknown): value is AlarmLevel {
  if (!value || typeof value !== 'object') return false;
  const alarm = value as Record<string, unknown>;
  return (
    typeof alarm.id === 'string' &&
    alarm.id.length > 0 &&
    alarm.id.length <= 64 &&
    typeof alarm.distance === 'number' &&
    Number.isFinite(alarm.distance) &&
    alarm.distance > 0 &&
    alarm.distance <= 50_000 &&
    typeof alarm.intensity === 'string' &&
    ALARM_INTENSITIES.has(alarm.intensity)
  );
}

export const storage = {
  removeLegacyDestination() {
    localStorage.removeItem('ts_destination');
  },

  saveAlarmMode(m: AlarmMode) { localStorage.setItem(KEY.MODE, m); },
  loadAlarmMode(): AlarmMode {
    return localStorage.getItem(KEY.MODE) === 'progressive' ? 'progressive' : 'single';
  },

  saveSingleAlarm(a: AlarmLevel) { localStorage.setItem(KEY.SINGLE, JSON.stringify(a)); },
  loadSingleAlarm(): AlarmLevel | null {
    const v = localStorage.getItem(KEY.SINGLE);
    if (!v) return null;
    try {
      const parsed: unknown = JSON.parse(v);
      return isAlarmLevel(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },

  saveProgressiveAlarms(a: AlarmLevel[]) { localStorage.setItem(KEY.PROG, JSON.stringify(a)); },
  loadProgressiveAlarms(): AlarmLevel[] {
    const v = localStorage.getItem(KEY.PROG);
    if (v) {
      try {
        const parsed: unknown = JSON.parse(v);
        if (Array.isArray(parsed) && parsed.every(isAlarmLevel)) return parsed;
      } catch {
        // Use the built-in alarm levels when stored settings are invalid.
      }
    }
    return [
      { id: 'prog-1', distance: 1000, intensity: 'medium' },
      { id: 'prog-2', distance: 500, intensity: 'strong' },
      { id: 'prog-3', distance: 100, intensity: 'critical' },
    ];
  },

  saveAudioSettings(enabled: boolean, mode: string) {
    localStorage.setItem(KEY.AUDIO, String(enabled));
    localStorage.setItem(KEY.AUDIO_MODE, mode);
  },
  loadAudioSettings(): { enabled: boolean; mode: string } {
    const mode = localStorage.getItem(KEY.AUDIO_MODE);
    return {
      enabled: localStorage.getItem(KEY.AUDIO) === 'true',
      mode: mode === 'headphones-speaker' || mode === 'loud' ? mode : 'headphones',
    };
  },

  saveDarkMode(enabled: boolean) {
    localStorage.setItem(KEY.DARK_MODE, String(enabled));
  },
  loadDarkMode(): boolean {
    const saved = localStorage.getItem(KEY.DARK_MODE);
    if (saved === 'true' || saved === 'false') return saved === 'true';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  },

  async clearSavedData(): Promise<void> {
    Object.values(KEY).forEach((key) => localStorage.removeItem(key));
    this.removeLegacyDestination();

    if ('caches' in window) {
      await Promise.all([
        caches.delete('map-tiles'),
        caches.delete('geocoding-cache'),
      ]);
    }
  },
};
