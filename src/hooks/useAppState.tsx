import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import type { AppState, AppAction, AlarmLevel, Coordinates, Destination } from '../types';
import { locationService } from '../services/location';
import { calculateDistance } from '../services/distance';
import { checkAlarms } from '../services/alarm';
import { alertsManager } from '../services/alerts';
import { storage } from '../services/storage';

/* ─── defaults ──────────────────────────────────────────────────────── */

const DEFAULT_SINGLE: AlarmLevel = {
  id: 'single-default',
  distance: 500,
  intensity: 'critical',
};

const init: AppState = {
  phase: 'idle',
  destination: null,
  alarmMode: 'single',
  singleAlarm: DEFAULT_SINGLE,
  progressiveAlarms: [
    { id: 'prog-1', distance: 1000, intensity: 'medium' },
    { id: 'prog-2', distance: 500, intensity: 'strong' },
    { id: 'prog-3', distance: 100, intensity: 'critical' },
  ],
  currentLocation: null,
  currentDistance: null,
  locationError: null,
  journey: null,
  editingLevelId: null,
  sleepMode: false,
  darkMode: false,
  audioEnabled: false,
  audioMode: 'headphones',
  vibrationPreset: 'gentle',
};

/* ─── reducer ───────────────────────────────────────────────────────── */

function reducer(s: AppState, a: AppAction): AppState {
  switch (a.type) {
    case 'SET_PHASE':
      return { ...s, phase: a.phase };
    case 'SET_DESTINATION':
      return { ...s, destination: a.destination, phase: 'setup', locationError: null };
    case 'CLEAR_DESTINATION':
      return { ...s, destination: null, phase: 'idle', journey: null, currentLocation: null, currentDistance: null, locationError: null };
    case 'SET_ALARM_MODE':
      return { ...s, alarmMode: a.mode };
    case 'SET_SINGLE_ALARM':
      return { ...s, singleAlarm: a.alarm };
    case 'ADD_PROGRESSIVE_ALARM':
      return { ...s, progressiveAlarms: [...s.progressiveAlarms, a.alarm] };
    case 'UPDATE_PROGRESSIVE_ALARM':
      return {
        ...s,
        progressiveAlarms: s.progressiveAlarms.map((x) =>
          x.id === a.alarm.id ? a.alarm : x
        ),
        editingLevelId: null,
      };
    case 'REMOVE_PROGRESSIVE_ALARM':
      return {
        ...s,
        progressiveAlarms: s.progressiveAlarms.filter((x) => x.id !== a.id),
      };
    case 'SET_EDITING_LEVEL':
      return { ...s, editingLevelId: a.id };
    case 'SET_CURRENT_LOCATION':
      return { ...s, currentLocation: a.location, locationError: null };
    case 'SET_LOCATION_ERROR':
      return { ...s, locationError: a.error };
    case 'SET_CURRENT_DISTANCE':
      return { ...s, currentDistance: a.distance };
    case 'START_JOURNEY': {
      const alarms =
        s.alarmMode === 'single' ? [s.singleAlarm] : s.progressiveAlarms;
      return {
        ...s,
        phase: 'journey',
        journey: {
          startTime: Date.now(),
          destination: s.destination!,
          alarmMode: s.alarmMode,
          alarms: [...alarms].sort((a, b) => b.distance - a.distance),
          triggeredAlarmIds: [],
          currentDistance: s.currentDistance,
          isActive: true,
        },
      };
    }
    case 'TRIGGER_ALARM':
      if (!s.journey) return s;
      return {
        ...s,
        journey: {
          ...s.journey,
          triggeredAlarmIds: [...s.journey.triggeredAlarmIds, a.alarmId],
        },
      };
    case 'ARRIVE':
      return { ...s, phase: 'arrived', currentLocation: null, currentDistance: null };
    case 'END_JOURNEY':
      return { ...s, phase: 'idle', journey: null, destination: null, currentLocation: null, currentDistance: null, locationError: null };
    case 'TOGGLE_SLEEP_MODE':
      return { ...s, sleepMode: !s.sleepMode };
    case 'TOGGLE_DARK_MODE':
      return { ...s, darkMode: !s.darkMode };
    case 'SET_DARK_MODE':
      return { ...s, darkMode: a.enabled };
    case 'SET_AUDIO_ENABLED':
      return { ...s, audioEnabled: a.enabled };
    case 'SET_AUDIO_MODE':
      return { ...s, audioMode: a.mode };
    case 'SET_VIBRATION_PRESET':
      return { ...s, vibrationPreset: a.preset };
    default:
      return s;
  }
}

/* ─── context ───────────────────────────────────────────────────────── */

interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  selectDestination: (d: Destination) => void;
  startJourney: () => Promise<void>;
  endJourney: () => void;
  testVibration: () => void;
  toggleDarkMode: () => void;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, init, (initial) => {
    storage.removeLegacyDestination();
    const mode = storage.loadAlarmMode();
    const single = storage.loadSingleAlarm();
    const prog = storage.loadProgressiveAlarms();
    const audio = storage.loadAudioSettings();
    const vibrationPreset = storage.loadVibrationPreset();
    const dark = storage.loadDarkMode();
    return {
      ...initial,
      alarmMode: mode,
      singleAlarm: single || initial.singleAlarm,
      progressiveAlarms: prog,
      audioEnabled: audio.enabled,
      audioMode: audio.mode as AppState['audioMode'],
      vibrationPreset,
      darkMode: dark,
    };
  });

  const watchRef = useRef(false);

  // persist
  useEffect(() => { storage.saveAlarmMode(state.alarmMode); }, [state.alarmMode]);
  useEffect(() => { storage.saveSingleAlarm(state.singleAlarm); }, [state.singleAlarm]);
  useEffect(() => { storage.saveProgressiveAlarms(state.progressiveAlarms); }, [state.progressiveAlarms]);
  useEffect(() => { storage.saveAudioSettings(state.audioEnabled, state.audioMode); }, [state.audioEnabled, state.audioMode]);
  useEffect(() => { storage.saveVibrationPreset(state.vibrationPreset); }, [state.vibrationPreset]);
  useEffect(() => {
    storage.saveDarkMode(state.darkMode);
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  // GPS watch during journey
  useEffect(() => {
    if (state.phase === 'journey' && state.journey?.isActive && !watchRef.current) {
      watchRef.current = true;
      locationService.startWatching(
        (coords) => {
          dispatch({ type: 'SET_CURRENT_LOCATION', location: coords });
        },
        () => dispatch({
          type: 'SET_LOCATION_ERROR',
          error: 'Live location updates are unavailable. Your alarm distance may be out of date. Check location permission or end this journey.',
        })
      );
    } else if (state.phase !== 'journey' && watchRef.current) {
      locationService.stopWatching();
      watchRef.current = false;
    }
    return () => {
      if (watchRef.current) {
        locationService.stopWatching();
        watchRef.current = false;
      }
    };
  }, [state.phase, state.journey?.isActive]);

  // Distance + alarm checking
  useEffect(() => {
    if (!state.currentLocation || !state.destination) return;
    const dist = calculateDistance(state.currentLocation, state.destination.coordinates);
    dispatch({ type: 'SET_CURRENT_DISTANCE', distance: dist });

    if (state.phase === 'journey' && state.journey) {
      const result = checkAlarms(
        state.currentLocation,
        state.destination.coordinates,
        state.journey.alarms,
        state.journey.triggeredAlarmIds
      );
      for (const alarm of result.crossedAlarms) {
        dispatch({ type: 'TRIGGER_ALARM', alarmId: alarm.id });
        alertsManager.triggerAlert(alarm.intensity, {
          vibration: true,
          audio: state.audioEnabled,
        });
      }
      if (result.currentDistance <= 50) {
        dispatch({ type: 'ARRIVE' });
        alertsManager.triggerArrival(
          state.destination.name,
          state.vibrationPreset,
          state.audioEnabled
        );
      }
    }
  }, [state.currentLocation, state.destination, state.phase, state.journey, state.audioEnabled, state.vibrationPreset]);

  const selectDestination = useCallback((dest: Destination) => {
    dispatch({ type: 'SET_DESTINATION', destination: dest });
  }, []);

  const startJourney = useCallback(async () => {
    dispatch({ type: 'SET_LOCATION_ERROR', error: null });
    if (!locationService.isSupported()) {
      dispatch({
        type: 'SET_LOCATION_ERROR',
        error: 'This browser does not support location access, which is required to start a journey alarm.',
      });
      return;
    }

    try {
      void alertsManager.requestNotificationPermission();
      const coords = await locationService.getCurrentPosition();
      dispatch({ type: 'SET_CURRENT_LOCATION', location: coords });
      dispatch({ type: 'START_JOURNEY' });
    } catch {
      dispatch({
        type: 'SET_LOCATION_ERROR',
        error: 'Location access is required for distance alarms. Allow location access in your browser and try again; your location is only used while a journey is active.',
      });
    }
  }, []);

  const endJourney = useCallback(() => {
    locationService.stopWatching();
    alertsManager.stopVibration();
    dispatch({ type: 'END_JOURNEY' });
  }, []);

  const testVibration = useCallback(() => {
    alertsManager.vibratePreset(state.vibrationPreset);
  }, [state.vibrationPreset]);

  const toggleDarkMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        selectDestination,
        startJourney,
        endJourney,
        testVibration,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
