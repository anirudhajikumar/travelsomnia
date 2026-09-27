import { useAppState } from '../hooks/useAppState';

export default function ArrivalOverlay() {
  const { endJourney, state } = useAppState();
  const dest = state.destination;

  return (
    <div className="arrival-overlay">
      {/* Ripple rings */}
      <div className="arrival-ripple" />
      <div className="arrival-ripple" />
      <div className="arrival-ripple" />

      {/* Pin icon */}
      <div className="relative z-10 animate-bounce-in mb-6">
        <div className="w-24 h-24 rounded-full bg-white/15 flex items-center justify-center
                        backdrop-blur-sm border border-white/20">
          <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#713432">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" fill="#F3EED9" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Text */}
      <h1 className="text-[36px] font-extrabold text-white tracking-tight animate-fade-in mb-2" aria-live="assertive" aria-atomic="true"
          style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        YOU'RE HERE
      </h1>
      {dest && (
        <p className="text-white/70 text-[15px] font-medium animate-fade-in mb-10"
           style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          {dest.name}
        </p>
      )}

      {/* End button */}
      <button
        onClick={endJourney}
        className="px-10 h-14 rounded-2xl bg-white text-maroon text-[15px] font-bold
                   shadow-2xl shadow-black/30 active:scale-[0.95] transition-transform
                   animate-fade-in"
        style={{ animationDelay: '0.7s', animationFillMode: 'both' }}
      >
        End Journey ✓
      </button>
    </div>
  );
}
