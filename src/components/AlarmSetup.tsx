import { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { formatDistance } from '../services/distance';
import { generateAlarmId } from '../services/alarm';
import type { AlarmIntensity, AlarmLevel } from '../types';

/* ─── Presets matching Figma designs ──────────────────────────────── */
const SINGLE_DISTANCES = [200, 500, 1000, 1500, 2000, 2500];
const PROG_DISTANCES = [100, 200, 500, 1000, 1500, 2000, 2500, 3000];

function dLabel(m: number): string {
  return m < 1000 ? `${m} m` : `${m / 1000} km`;
}

function progPillLabel(m: number): string {
  return m < 1000 ? `${m}m` : `${m / 1000}k`;
}

function getSphereGradient(dist: number): string {
  if (dist >= 1000) {
    return 'linear-gradient(135deg, #FFE17D 0%, #D4981E 100%)'; // Gold
  } else if (dist >= 500) {
    return 'linear-gradient(135deg, #FFA26B 0%, #E85D04 100%)'; // Orange
  } else {
    return 'linear-gradient(135deg, #FF8A8A 0%, #E63946 100%)'; // Coral Red
  }
}

function getIntensityLabel(intensity: AlarmIntensity): string {
  switch (intensity) {
    case 'gentle': return 'Gentle buzz';
    case 'medium': return 'Medium pulse';
    case 'strong': return 'Strong shake';
    case 'critical': return 'Max intensity';
  }
}

/* ═══════════════════════════════════════════════════════════════════ */
/* Main Alarm Setup Bottom Sheet                                       */
/* ═══════════════════════════════════════════════════════════════════ */

export default function AlarmSetup() {
  const { state, dispatch, startJourney } = useAppState();
  const dest = state.destination;

  if (!dest) return null;

  const canStart =
    state.alarmMode === 'single' || state.progressiveAlarms.length > 0;

  return (
    <div className="bottom-sheet safe-bottom">
      <div className="sheet-handle" />

      <div className="px-5 pb-6 pt-1">
        {/* ── Destination Header ──────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#713432] dark:bg-[#D0807A] flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="#FF8080"
                />
                <circle cx="12" cy="9" r="2.5" fill="#F3EED9" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#798897] dark:text-[#A6B1BF] uppercase tracking-wider">
                Destination
              </p>
              <p className="text-[17px] font-bold text-[#713432] dark:text-[#D8DCE4] truncate leading-tight">
                {dest.name}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="text-[11px] font-semibold text-[#798897] dark:text-[#A6B1BF] uppercase tracking-wider">
              Distance
            </p>
            <p className="text-[17px] font-bold text-[#713432] dark:text-[#D8DCE4] distance-value leading-tight">
              {state.currentDistance != null ? formatDistance(state.currentDistance) : '—'}
            </p>
          </div>
        </div>

        {/* ── Mode Toggle Tabs ────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {/* Single Alarm Tab */}
          <button
            onClick={() => dispatch({ type: 'SET_ALARM_MODE', mode: 'single' })}
            aria-pressed={state.alarmMode === 'single'}
            className={`h-12 rounded-2xl flex items-center justify-center gap-2 text-[14px] font-bold
                         transition-all duration-200 active:scale-[0.98]
                         ${state.alarmMode === 'single'
                           ? 'bg-[#713432] text-white shadow-md shadow-[#713432]/25'
                           : 'bg-[#F3EED9] text-[#798897] border border-[#D5CEBA] hover:bg-[#EFE9D2] dark:bg-[#252A38] dark:text-[#A6B1BF] dark:border-[#3D4658] dark:hover:bg-[#2F364F]'}`}
          >
            <span className={state.alarmMode === 'single' ? 'text-white' : 'text-[#F5A623]'}>
              🔔
            </span>
            Single Alarm
          </button>

          {/* Progressive Tab */}
          <button
            onClick={() => dispatch({ type: 'SET_ALARM_MODE', mode: 'progressive' })}
            aria-pressed={state.alarmMode === 'progressive'}
            className={`h-12 rounded-2xl flex items-center justify-center gap-2 text-[14px] font-bold
                         transition-all duration-200 active:scale-[0.98]
                         ${state.alarmMode === 'progressive'
                           ? 'bg-[#713432] text-white shadow-md shadow-[#713432]/25'
                           : 'bg-[#F3EED9] text-[#798897] border border-[#D5CEBA] hover:bg-[#EFE9D2] dark:bg-[#252A38] dark:text-[#A6B1BF] dark:border-[#3D4658] dark:hover:bg-[#2F364F]'}`}
          >
            <span className={state.alarmMode === 'progressive' ? 'text-white' : 'text-[#4A90E2]'}>
              📊
            </span>
            Progressive
          </button>
        </div>

        {/* ── Tab Content ────────────────────────────────────── */}
        {state.alarmMode === 'single' ? <SingleAlarmMode /> : <ProgressiveAlarmMode />}

        {/* ── Start Journey Button ───────────────────────────── */}
        <p className="mt-4 text-center text-[12px] leading-relaxed text-[#798897] dark:text-[#A6B1BF]">
          Location is required to measure distance and trigger alarms. It is requested when you start and used only while your journey is active.
        </p>
        {state.locationError && (
          <p className="mt-2 text-center text-sm font-semibold text-[#713432] dark:text-[#D8DCE4]" role="alert">
            {state.locationError}
          </p>
        )}
        <button
          onClick={startJourney}
          disabled={!canStart}
          className={`w-full h-14 rounded-2xl text-[16px] font-bold flex items-center justify-center gap-2
                      transition-all duration-200 active:scale-[0.98] mt-6
                      ${canStart
                        ? 'bg-[#713432] dark:bg-[#D0807A] text-white shadow-lg shadow-[#713432]/25 hover:bg-[#5E2B2A] dark:hover:bg-[#DE8B83]'
                        : 'bg-[#DED6BE] dark:bg-[#252A38] text-[#798897]/50 dark:text-[#A6B1BF]/40 cursor-not-allowed'}`}
        >
          Start Journey →
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* Single Alarm Mode                                                   */
/* ═══════════════════════════════════════════════════════════════════ */

function SingleAlarmMode() {
  const { state, dispatch } = useAppState();
  const { singleAlarm } = state;

  const setDistance = (d: number) =>
    dispatch({
      type: 'SET_SINGLE_ALARM',
      alarm: { ...singleAlarm, distance: d },
    });

  const setIntensity = (i: AlarmIntensity) =>
    dispatch({
      type: 'SET_SINGLE_ALARM',
      alarm: { ...singleAlarm, intensity: i },
    });

  const intensities: {
    key: AlarmIntensity;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'gentle',
      label: 'Gentle buzz',
      icon: (
        <span className="text-[#6B5B95] text-lg font-bold">〰️</span>
      ),
    },
    {
      key: 'medium',
      label: 'Medium pulse',
      icon: (
        <span className="text-[#713432] dark:text-[#9AB3B5] text-lg font-bold tracking-tighter">〰️〰️</span>
      ),
    },
    {
      key: 'strong',
      label: 'Strong shake',
      icon: (
        <span className="text-[#F5A623] text-lg">⚡</span>
      ),
    },
    {
      key: 'critical',
      label: 'Max intensity',
      icon: (
        <span className="text-[#FF6666] text-lg flex items-center gap-0.5">⚡⚡</span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <p className="text-[11px] font-bold text-[#798897] dark:text-[#A6B1BF] uppercase tracking-wider mb-3">
        Wake me at
      </p>

      {/* Distance pills (3x2 grid) */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {SINGLE_DISTANCES.map((d) => {
          const isSelected = singleAlarm.distance === d;
          return (
            <button
              key={d}
              onClick={() => setDistance(d)}
              aria-pressed={isSelected}
              className={`h-11 rounded-2xl text-[14px] font-bold transition-all duration-150 active:scale-95
                           ${isSelected
                             ? 'bg-[#FF6666] text-white shadow-md shadow-[#FF6666]/30'
                             : 'bg-[#E8E1CB] text-[#713432] hover:bg-[#DDD5BD] dark:bg-[#252A38] dark:text-[#D8DCE4] dark:hover:bg-[#2F364F]'}`}
            >
              {dLabel(d)}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] font-bold text-[#798897] dark:text-[#A6B1BF] uppercase tracking-wider mb-3">
        Vibration intensity
      </p>

      {/* 4 intensity options */}
      <div className="space-y-2">
        {intensities.map(({ key, label, icon }) => {
          const isSelected = singleAlarm.intensity === key;
          return (
            <button
              key={key}
              onClick={() => setIntensity(key)}
              aria-pressed={isSelected}
              className={`w-full flex items-center justify-between px-4 h-12 rounded-2xl text-[14px] font-semibold
                           transition-all duration-150 active:scale-[0.99]
                           ${isSelected
                             ? 'bg-[#E8E1CB] dark:bg-[#252A38] text-[#713432] dark:text-[#D8DCE4] border-[1.5px] border-[#713432] dark:border-[#D0807A] shadow-sm'
                             : 'bg-[#E8E1CB] dark:bg-[#252A38] text-[#713432] dark:text-[#D8DCE4] border border-transparent hover:bg-[#DDD5BD] dark:hover:bg-[#2F364F]'}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 flex justify-center items-center">{icon}</span>
                <span>{label}</span>
              </div>
              {isSelected && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF6666"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* Progressive Alarm Mode                                              */
/* ═══════════════════════════════════════════════════════════════════ */

function ProgressiveAlarmMode() {
  const { state, dispatch } = useAppState();
  const { progressiveAlarms, editingLevelId } = state;

  const addLevel = () => {
    const newAlarm: AlarmLevel = {
      id: generateAlarmId(),
      distance: 1000,
      intensity: 'medium',
    };
    dispatch({ type: 'ADD_PROGRESSIVE_ALARM', alarm: newAlarm });
    dispatch({ type: 'SET_EDITING_LEVEL', id: newAlarm.id });
  };

  const sorted = [...progressiveAlarms].sort((a, b) => b.distance - a.distance);

  return (
    <div className="animate-fade-in">
      {/* Header with + Add Level button */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold text-[#798897] dark:text-[#A6B1BF] uppercase tracking-wider">
          Alarm Levels
        </p>
        <button
          onClick={addLevel}
          className="px-3 py-1 rounded-full bg-[#FCECE8] dark:bg-[#252A38] text-[#FF6666] text-[12px] font-bold
                     hover:bg-[#F8DED8] dark:hover:bg-[#2F364F] active:scale-95 transition-all"
        >
          + Add Level
        </button>
      </div>

      {/* Alarm level cards list */}
      <div className="space-y-2.5">
        {sorted.map((alarm) =>
          editingLevelId === alarm.id ? (
            <AlarmLevelEditor key={alarm.id} alarm={alarm} />
          ) : (
            <AlarmLevelCard key={alarm.id} alarm={alarm} />
          )
        )}
      </div>

      {progressiveAlarms.length === 0 && (
        <div className="text-center py-8 text-[#798897]/70 dark:text-[#A6B1BF]/70 text-sm">
          <p>No alarm levels configured.</p>
          <button
            onClick={addLevel}
            className="mt-2 text-[#FF6666] font-bold underline text-xs"
          >
            Create first level
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Collapsed Alarm Level Card ───────────────────────────────────── */

function AlarmLevelCard({ alarm }: { alarm: AlarmLevel }) {
  const { dispatch } = useAppState();

  return (
    <div className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-[#E8E1CB] dark:bg-[#252A38] border border-[#DDD5BD] dark:border-[#3D4658] animate-fade-in">
      {/* 3D Sphere */}
      <div
        className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm"
        style={{
          background: getSphereGradient(alarm.distance),
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.15)',
        }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-[#713432] dark:text-[#D8DCE4] leading-tight">
          {dLabel(alarm.distance)}
        </p>
        <p className="text-[12px] font-medium text-[#798897] dark:text-[#A6B1BF] capitalize leading-tight mt-0.5">
          {getIntensityLabel(alarm.intensity)}
        </p>
      </div>

      {/* Edit pencil button */}
      <button
        onClick={() => dispatch({ type: 'SET_EDITING_LEVEL', id: alarm.id })}
        className="w-8 h-8 rounded-full bg-[#F3EED9] dark:bg-[#252A38] text-[#FF6666] flex items-center justify-center
             hover:bg-white dark:hover:bg-[#2F364F] active:scale-90 transition-all shadow-2xs"
        aria-label="Edit level"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      </button>

      {/* Delete cross button */}
      <button
        onClick={() => dispatch({ type: 'REMOVE_PROGRESSIVE_ALARM', id: alarm.id })}
        className="w-8 h-8 rounded-full bg-[#F3EED9] dark:bg-[#252A38] text-[#FF6666] flex items-center justify-center
             hover:bg-white dark:hover:bg-[#2F364F] active:scale-90 transition-all shadow-2xs"
        aria-label="Delete level"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/* ── Expanded Alarm Level Editor (Amber Border) ───────────────────── */

function AlarmLevelEditor({ alarm }: { alarm: AlarmLevel }) {
  const { dispatch } = useAppState();
  const [dist, setDist] = useState(alarm.distance);
  const [intensity, setIntensity] = useState<AlarmIntensity>(alarm.intensity);

  const save = () => {
    dispatch({
      type: 'UPDATE_PROGRESSIVE_ALARM',
      alarm: { ...alarm, distance: dist, intensity },
    });
  };

  const intensityOptions: { key: AlarmIntensity; label: string }[] = [
    { key: 'gentle', label: 'Gentle' },
    { key: 'medium', label: 'Medium' },
    { key: 'strong', label: 'Strong' },
    { key: 'critical', label: 'Critical' },
  ];

  return (
    <div className="rounded-2xl border-2 border-[#F5A623] bg-[#E8E1CB] dark:bg-[#252A38] p-4 animate-scale-in shadow-sm">
      {/* Header inside editor */}
      <div className="flex items-center gap-3.5 mb-4">
        <div
          className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm"
          style={{
            background: getSphereGradient(dist),
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.15)',
          }}
        />
        <div className="flex-1">
          <p className="text-[15px] font-bold text-[#713432] dark:text-[#D8DCE4] leading-tight">
            {dLabel(dist)}
          </p>
          <p className="text-[12px] font-medium text-[#798897] dark:text-[#A6B1BF] capitalize leading-tight mt-0.5">
            {getIntensityLabel(intensity)}
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_EDITING_LEVEL', id: null })}
          aria-label="Close alarm level editor"
          className="w-8 h-8 rounded-full bg-[#F3EED9] dark:bg-[#252A38] text-[#FF6666] flex items-center justify-center
                     active:scale-90 transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </button>
        <button
          onClick={() => dispatch({ type: 'REMOVE_PROGRESSIVE_ALARM', id: alarm.id })}
          aria-label="Delete alarm level"
          className="w-8 h-8 rounded-full bg-[#F3EED9] dark:bg-[#252A38] text-[#FF6666] flex items-center justify-center
                     active:scale-90 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Distance Selector (8 options, 4x2 grid) */}
      <p className="text-[11px] font-bold text-[#798897] dark:text-[#A6B1BF] uppercase tracking-wider mb-2">
        Distance
      </p>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {PROG_DISTANCES.map((d) => {
          const isSelected = dist === d;
          return (
            <button
              key={d}
              onClick={() => setDist(d)}
              aria-pressed={isSelected}
              className={`h-9 rounded-xl text-[12px] font-bold transition-all duration-150 active:scale-95
                           ${isSelected
                             ? 'bg-[#FF6666] text-white shadow-sm shadow-[#FF6666]/30'
                             : 'bg-[#DDD5BE] dark:bg-[#252A38] text-[#713432] dark:text-[#D8DCE4] hover:bg-[#D5CCB3] dark:hover:bg-[#2F364F]'}`}
            >
              {progPillLabel(d)}
            </button>
          );
        })}
      </div>

      {/* Intensity Selector (4 options, 2x2 grid) */}
      <p className="text-[11px] font-bold text-[#798897] dark:text-[#A6B1BF] uppercase tracking-wider mb-2">
        Intensity
      </p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {intensityOptions.map(({ key, label }) => {
          const isSelected = intensity === key;
          return (
            <button
              key={key}
              onClick={() => setIntensity(key)}
              aria-pressed={isSelected}
              className={`h-10 rounded-xl text-[13px] font-bold transition-all duration-150 active:scale-95
                           ${isSelected
                             ? 'bg-[#713432] text-white shadow-sm shadow-[#713432]/30'
                             : 'bg-[#DDD5BE] dark:bg-[#252A38] text-[#713432] dark:text-[#D8DCE4] hover:bg-[#D5CCB3] dark:hover:bg-[#2F364F]'}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Save Button */}
      <button
        onClick={save}
        className="w-full h-11 rounded-xl bg-[#FF6666] text-white text-[14px] font-bold
                   shadow-md shadow-[#FF6666]/25 hover:bg-[#E54D4D] active:scale-[0.98] transition-all"
      >
        Save
      </button>
    </div>
  );
}
