// ─── Core Types ─────────────────────────────────────────────────────

export type AlarmIntensity = 'gentle' | 'medium' | 'strong' | 'critical';
export type VibrationPreset = 'gentle' | 'medium' | 'strong' | 'max';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Destination {
  name: string;
  displayName: string;
  coordinates: Coordinates;
}

export interface AlarmLevel {
  id: string;
  distance: number; // meters
  intensity: AlarmIntensity;
}

export type AlarmMode = 'single' | 'progressive';

export type AppPhase = 'idle' | 'search' | 'setup' | 'journey' | 'arrived';

// ─── Geocoding ──────────────────────────────────────────────────────

export interface GeocodingResult {
  placeId: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}

// ─── Journey ────────────────────────────────────────────────────────

export interface JourneyState {
  startTime: number;
  destination: Destination;
  alarmMode: AlarmMode;
  alarms: AlarmLevel[];
  triggeredAlarmIds: string[];
  currentDistance: number | null;
  isActive: boolean;
}

// ─── App State ──────────────────────────────────────────────────────

export interface AppState {
  phase: AppPhase;
  destination: Destination | null;
  alarmMode: AlarmMode;
  singleAlarm: AlarmLevel;
  progressiveAlarms: AlarmLevel[];
  currentLocation: Coordinates | null;
  currentDistance: number | null;
  locationError: string | null;
  journey: JourneyState | null;
  editingLevelId: string | null;
  sleepMode: boolean;
  darkMode: boolean;
  audioEnabled: boolean;
  audioMode: 'headphones' | 'headphones-speaker' | 'loud';
  vibrationPreset: VibrationPreset;
}

export type AppAction =
  | { type: 'SET_PHASE'; phase: AppPhase }
  | { type: 'SET_DESTINATION'; destination: Destination }
  | { type: 'CLEAR_DESTINATION' }
  | { type: 'SET_ALARM_MODE'; mode: AlarmMode }
  | { type: 'SET_SINGLE_ALARM'; alarm: AlarmLevel }
  | { type: 'ADD_PROGRESSIVE_ALARM'; alarm: AlarmLevel }
  | { type: 'UPDATE_PROGRESSIVE_ALARM'; alarm: AlarmLevel }
  | { type: 'REMOVE_PROGRESSIVE_ALARM'; id: string }
  | { type: 'SET_EDITING_LEVEL'; id: string | null }
  | { type: 'SET_CURRENT_LOCATION'; location: Coordinates }
  | { type: 'SET_LOCATION_ERROR'; error: string | null }
  | { type: 'SET_CURRENT_DISTANCE'; distance: number }
  | { type: 'START_JOURNEY' }
  | { type: 'TRIGGER_ALARM'; alarmId: string }
  | { type: 'ARRIVE' }
  | { type: 'END_JOURNEY' }
  | { type: 'TOGGLE_SLEEP_MODE' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_DARK_MODE'; enabled: boolean }
  | { type: 'SET_AUDIO_ENABLED'; enabled: boolean }
  | { type: 'SET_AUDIO_MODE'; mode: 'headphones' | 'headphones-speaker' | 'loud' }
  | { type: 'SET_VIBRATION_PRESET'; preset: VibrationPreset };

// ─── Alarm check result ─────────────────────────────────────────────

export interface AlarmCheckResult {
  currentDistance: number;
  crossedAlarms: AlarmLevel[];
  nextAlarm: AlarmLevel | null;
  progress: number;
}
