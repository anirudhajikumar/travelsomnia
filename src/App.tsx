import { useEffect, useState, useRef } from 'react';
import { AppProvider, useAppState } from './hooks/useAppState';
import MapView from './components/MapView';
import SearchOverlay from './components/SearchOverlay';
import AlarmSetup from './components/AlarmSetup';
import JourneyView from './components/JourneyView';
import ArrivalOverlay from './components/ArrivalOverlay';
import AlarmBorder from './components/AlarmBorder';
import PrivacyPolicy from './components/PrivacyPolicy';
import { alertsManager } from './services/alerts';
import type { Destination } from './types';

// Presets matching the Figma design (Downtown Plaza 2.5 km)
const QUICK_PRESETS: Destination[] = [
  {
    name: 'Downtown Plaza',
    displayName: 'Downtown Plaza, Oak Street District',
    coordinates: { lat: 12.9719, lng: 77.6012 },
  },
  {
    name: "St. Mark's Road",
    displayName: "St. Mark's Road, Central District",
    coordinates: { lat: 12.9750, lng: 77.6046 },
  },
  {
    name: 'Oak Street Metro',
    displayName: 'Oak Street Station, Line 1',
    coordinates: { lat: 12.9784, lng: 77.6408 },
  },
];

function MainContent() {
  const { state, dispatch, selectDestination, toggleDarkMode } = useAppState();
  const { phase, destination, darkMode } = state;
  const [isSimulating, setIsSimulating] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const simIntervalRef = useRef<number | null>(null);

  // Clean up simulation on phase exit
  useEffect(() => {
    if (phase !== 'journey') {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      setIsSimulating(false);
    }
  }, [phase]);

  // Movement simulation towards destination
  const toggleSimulation = () => {
    if (isSimulating) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
      setIsSimulating(false);
      return;
    }

    if (!destination || !state.currentLocation) return;
    setIsSimulating(true);

    simIntervalRef.current = window.setInterval(() => {
      if (!state.destination) return;
      const cur = state.currentLocation;
      if (!cur) return;
      const target = state.destination.coordinates;

      // Step 12% closer each tick
      const newLat = cur.lat + (target.lat - cur.lat) * 0.12;
      const newLng = cur.lng + (target.lng - cur.lng) * 0.12;

      dispatch({
        type: 'SET_CURRENT_LOCATION',
        location: { lat: newLat, lng: newLng },
      });
    }, 1200);
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#F3EED9] dark:bg-[#2B2E3B] transition-colors duration-300">
      {/* ── Background Map ──────────────────────────────────── */}
      <MapView />

      {/* ── Screen edge alarm glow during journey ──────────── */}
      <AlarmBorder />

      {/* ── Top Bar in Idle Mode (Faithful to Screenshot 4 + Dark Mode) ─── */}
      {phase === 'idle' && (
        <div className="absolute top-0 left-0 right-0 z-40 p-4 pt-12 flex flex-col gap-3 pointer-events-none">
          {/* Top Row: Brand, Sound Test, Dark Mode Toggle & Location Notice */}
          <div className="flex items-center justify-between w-full pointer-events-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-[16px] font-black text-[#713432] dark:text-[#D8DCE4] tracking-tight">
                Travelsomnia
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Sound Test Button */}
              <button
                onClick={() => {
                  alertsManager.triggerAlert('medium', { vibration: true, audio: true });
                }}
                title="Test Vibration & Sound Alert"
                className="w-8 h-8 rounded-full bg-[#F3EED9] dark:bg-[#1B1D24] border border-[#D5CEBA] dark:border-[#3D4658] text-[#713432] dark:text-[#D8DCE4]
                           flex items-center justify-center text-xs shadow-xs active:scale-95 transition-all"
                aria-label="Test Alert"
              >
                🔔
              </button>

              {/* Dark Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                title={darkMode ? 'Switch to Warm Light Theme' : 'Switch to Dark Theme'}
                className="w-8 h-8 rounded-full bg-[#F3EED9] dark:bg-[#1B1D24] border border-[#D5CEBA] dark:border-[#3D4658] text-[#713432] dark:text-[#D8DCE4]
                           flex items-center justify-center text-xs shadow-xs active:scale-95 transition-all"
                aria-label="Toggle Dark Mode"
                aria-pressed={darkMode}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              {/* Location is requested only after starting a journey. */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3EED9] dark:bg-[#1B1D24] border border-[#D5CEBA] dark:border-[#3D4658] shadow-xs transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#798897]" />
                <span className="text-[12px] font-bold text-[#713432] dark:text-[#D8DCE4]">GPS on trip</span>
              </div>
            </div>
          </div>

          {/* Floating Search Bar (Exact Screenshot 4) */}
          <div className="pointer-events-auto flex flex-col gap-2">
            <button
              onClick={() => dispatch({ type: 'SET_PHASE', phase: 'search' })}
              className="w-full h-12 bg-[#F3EED9] dark:bg-[#1B1D24] border border-[#D5CEBA] dark:border-[#3D4658] rounded-2xl shadow-xs px-4
                         flex items-center gap-3 text-left active:scale-[0.99] transition-all group"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FF6666"
                className="dark-accent-stroke"
                strokeWidth="2.6"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span className="text-[15px] font-medium text-[#798897] dark:text-[#A6B1BF]">
                Where are you going?
              </span>
            </button>

            {/* Quick preset chips including Figma Downtown Plaza */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => selectDestination(p)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[#F3EED9] dark:bg-[#252A38] text-[#713432] dark:text-[#D8DCE4] text-[12px] font-bold
                             shadow-xs border border-[#D5CEBA] dark:border-[#3D4658] hover:bg-[#EAE3CB] dark:hover:bg-[#2F364F] active:scale-95 transition-all"
                >
                  📍 {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Idle Floating Bottom Card (Exact Screenshot 4) ─── */}
      {phase === 'idle' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
          <div className="bg-[#F3EED9] dark:bg-[#1B1D24] border border-[#D5CEBA] dark:border-[#3D4658] rounded-2xl shadow-md px-6 py-4 text-center max-w-[280px] transition-colors">
            <h2 className="text-[16px] font-bold text-[#713432] dark:text-[#D8DCE4] leading-tight">
              Travelsomnia
            </h2>
            <p className="text-[13px] font-medium text-[#798897] dark:text-[#A6B1BF] leading-snug mt-1">
              Search a destination to set your alarm
            </p>
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="mt-2 text-[12px] font-semibold text-[#713432] dark:text-[#D8DCE4] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      )}

      {/* ── Setup Header Bar (Change Destination + Dark Mode) ──────────── */}
      {phase === 'setup' && (
        <div className="absolute top-0 left-0 right-0 z-40 p-4 pt-12 flex items-center justify-between pointer-events-none">
          <button
            onClick={() => dispatch({ type: 'CLEAR_DESTINATION' })}
            className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-[#F3EED9] dark:bg-[#1B1D24] border border-[#D5CEBA] dark:border-[#3D4658] text-[#713432] dark:text-[#D8DCE4]
                       text-[13px] font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>←</span> Back to Map
          </button>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to Warm Light Theme' : 'Switch to Dark Theme'}
              className="w-8 h-8 rounded-full bg-[#F3EED9] dark:bg-[#1B1D24] border border-[#D5CEBA] dark:border-[#3D4658] text-[#713432] dark:text-[#D8DCE4]
                         flex items-center justify-center text-xs shadow-xs active:scale-95 transition-all"
              aria-label="Toggle Dark Mode"
              aria-pressed={darkMode}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3EED9] dark:bg-[#1B1D24] border border-[#D5CEBA] dark:border-[#3D4658] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#798897]" />
              <span className="text-[12px] font-bold text-[#713432] dark:text-[#D8DCE4]">GPS on trip</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Search Overlay ─────────────────────────────────── */}
      {phase === 'search' && <SearchOverlay />}

      {/* ── Alarm Setup Bottom Sheet (Screenshots 1, 2, 3) ─── */}
      {phase === 'setup' && <AlarmSetup />}

      {/* ── Journey Active Overlay ─────────────────────────── */}
      {phase === 'journey' && (
        <>
          <JourneyView />
          {/* Simulation Tool for Desktop Testing */}
          {import.meta.env.DEV && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
              <button
                onClick={toggleSimulation}
                className={`px-4 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 ${
                  isSimulating
                    ? 'bg-[#FF6666] text-white animate-pulse'
                    : 'bg-[#F3EED9] dark:bg-[#1B1D24] text-[#713432] dark:text-[#D8DCE4] border border-[#D5CEBA] dark:border-[#3D4658] hover:bg-white dark:hover:bg-[#252A38]'
                }`}
              >
                <span>{isSimulating ? '⏸ Pause Sim' : '▶ Simulate Ride Closer'}</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Arrival Celebration Overlay ────────────────────── */}
      {phase === 'arrived' && <ArrivalOverlay />}
      {privacyOpen && <PrivacyPolicy onClose={() => setPrivacyOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
