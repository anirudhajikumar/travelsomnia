import { useAppState } from '../hooks/useAppState';
import { formatDistance } from '../services/distance';
import { getAlarmColor } from '../services/alarm';

export default function JourneyView() {
  const { state, dispatch, endJourney, toggleDarkMode } = useAppState();
  const { journey, currentDistance, sleepMode, darkMode } = state;

  if (!journey) return null;

  const sortedAlarms = [...journey.alarms].sort((a, b) => b.distance - a.distance);
  const triggeredCount = journey.triggeredAlarmIds.length;
  const totalAlarms = journey.alarms.length;
  const progress = totalAlarms > 0 ? triggeredCount / totalAlarms : 0;

  // Next untriggered alarm
  const nextAlarm = sortedAlarms.find(
    (a) => !journey.triggeredAlarmIds.includes(a.id)
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col transition-colors duration-700
                   ${sleepMode ? 'journey-dimmed' : ''}`}
      style={{ pointerEvents: 'none' }}
    >
      {/* Top info bar */}
      <div
        className="mx-4 mt-14 rounded-2xl bg-[#F3EED9]/95 dark:bg-[#1C1F26]/95 backdrop-blur-md shadow-lg border border-[#D5CEBA] dark:border-[#3D4658] p-4
                   animate-slide-down"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-bold text-[#798897] dark:text-[#A6B1BF] uppercase tracking-wider">
              Distance remaining
            </p>
            <p className="text-[28px] font-extrabold text-[#713432] dark:text-[#D8DCE4] leading-tight distance-value">
              {currentDistance != null ? formatDistance(currentDistance) : '—'}
            </p>
          </div>
          <div className="text-right" aria-live="polite" aria-atomic="true">
            <p className="text-[11px] font-bold text-[#798897] dark:text-[#A6B1BF] uppercase tracking-wider">
              Next alarm
            </p>
            {nextAlarm ? (
              <div className="flex items-center justify-end gap-2 mt-1">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: getAlarmColor(nextAlarm.intensity) }}
                />
                <p className="text-[16px] font-bold text-[#713432] dark:text-[#D8DCE4]">
                  {formatDistance(nextAlarm.distance)}
                </p>
              </div>
            ) : (
              <p className="text-[13px] font-bold text-[#FF6666] mt-1">All passed</p>
            )}
          </div>
        </div>
        {state.locationError && (
          <p className="mb-3 text-sm font-semibold text-[#713432] dark:text-[#D8DCE4]" role="alert">
            {state.locationError}
          </p>
        )}

        {/* Progress bar */}
        <div
          className="h-2 bg-[#E8E1CB] dark:bg-[#252A38] rounded-full overflow-hidden"
          role="progressbar"
          aria-label="Journey alarm progress"
          aria-valuemin={0}
          aria-valuemax={totalAlarms}
          aria-valuenow={triggeredCount}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.max(3, progress * 100)}%`,
              background: `linear-gradient(90deg, #4CAF50, #FFC107, #FF9800, #FF6666)`,
            }}
          />
        </div>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {triggeredCount} of {totalAlarms} alarms passed.
        </p>

        {/* Alarm milestone badges */}
        <div className="flex gap-1.5 mt-3 flex-wrap" role="list" aria-label="Alarm milestones">
          {sortedAlarms.map((alarm) => {
            const triggered = journey.triggeredAlarmIds.includes(alarm.id);
            return (
              <div
                key={alarm.id}
                role="listitem"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-300
                             ${triggered
                               ? 'bg-[#E8E1CB] dark:bg-[#252A38] text-[#798897]/50 dark:text-[#A6B1BF]/40 line-through'
                               : 'text-white shadow-xs'}`}
                style={!triggered ? { background: getAlarmColor(alarm.intensity) } : undefined}
              >
                {formatDistance(alarm.distance)}
                <span className="sr-only">
                  {alarm.intensity} alarm, {triggered ? 'triggered' : 'upcoming'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="mt-auto mx-4 mb-8 animate-slide-up" style={{ pointerEvents: 'auto' }}>
        <div className="flex gap-2.5">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SLEEP_MODE' })}
            aria-pressed={sleepMode}
            className={`flex-1 h-12 rounded-2xl text-[14px] font-bold transition-all duration-200
                         active:scale-[0.98]
                         ${sleepMode
                           ? 'bg-[#713432] dark:bg-[#D0807A] text-white shadow-lg shadow-[#713432]/30'
                           : 'bg-[#F3EED9]/95 text-[#713432] dark:bg-[#1C1F26]/95 dark:text-[#D8DCE4] border border-[#D5CEBA] dark:border-[#3D4658] shadow-md backdrop-blur-sm'}`}
          >
            {sleepMode ? '☀️ Wake Screen' : '💤 Sleep Screen'}
          </button>

          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-12 h-12 rounded-2xl bg-[#F3EED9]/95 dark:bg-[#1C1F26]/95 border border-[#D5CEBA] dark:border-[#3D4658]
                       text-[#713432] dark:text-[#D8DCE4] flex items-center justify-center text-lg shadow-md active:scale-95 transition-transform"
            aria-label="Toggle Dark Mode"
            aria-pressed={darkMode}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <button
            onClick={endJourney}
            className="flex-1 h-12 rounded-2xl bg-[#FF6666] text-white text-[14px] font-bold
                       shadow-lg shadow-[#FF6666]/30 active:scale-[0.98] transition-all duration-200 hover:bg-[#E54D4D]"
          >
            End Journey
          </button>
        </div>
      </div>
    </div>
  );
}
