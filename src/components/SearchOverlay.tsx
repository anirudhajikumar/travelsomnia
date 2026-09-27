import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { useAppState } from '../hooks/useAppState';
import { searchPlaces } from '../services/geocoding';
import type { GeocodingResult } from '../types';

export default function SearchOverlay() {
  const { dispatch, selectDestination } = useAppState();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const requestVersionRef = useRef(0);

  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      requestVersionRef.current++;
    };
  }, []);

  const search = useCallback(async (q: string, requestVersion: number) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setSearchError(null);
    try {
      const res = await searchPlaces(q);
      if (requestVersion === requestVersionRef.current) setResults(res);
    } catch {
      if (requestVersion === requestVersionRef.current) {
        setResults([]);
        setSearchError('Destination search is temporarily unavailable. Check your connection and try again.');
      }
    } finally {
      if (requestVersion === requestVersionRef.current) setLoading(false);
    }
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    setResults([]);
    setSearchError(null);
    const requestVersion = ++requestVersionRef.current;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(() => search(val, requestVersion), 500);
    } else {
      setLoading(false);
    }
  };

  const close = () => dispatch({ type: 'SET_PHASE', phase: 'idle' });

  const handleOverlayKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key !== 'Tab') return;

    const controls = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href]'
      )
    );
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && event.target === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && event.target === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleSelect = (result: GeocodingResult) => {
    selectDestination({
      name: result.name,
      displayName: result.displayName,
      coordinates: { lat: result.lat, lng: result.lng },
    });
  };

  return (
    <div
      className="search-overlay flex flex-col bg-[#F3EED9]/98 dark:bg-[#1C1F26]/98 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Search destinations"
      onKeyDown={handleOverlayKeyDown}
    >
      {/* Header */}
      <div className="px-4 pt-14 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={close}
            className="w-10 h-10 rounded-full bg-[#E8E1CB] dark:bg-[#252A38] border border-[#D5CEBA] dark:border-[#3D4658] flex items-center justify-center
                       shadow-xs active:scale-95 transition-transform text-[#713432] dark:text-[#D8DCE4]"
            aria-label="Close search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF6666] dark:text-[#FF8373]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="Where are you going?"
              aria-label="Search for a destination"
              maxLength={120}
              autoComplete="off"
              className="w-full h-12 pl-11 pr-4 bg-[#E8E1CB] dark:bg-[#1B1D24] rounded-2xl text-[#713432] dark:text-[#D8DCE4] placeholder:text-[#798897]/70 dark:placeholder:text-[#A6B1BF]/70
                         text-[15px] font-medium shadow-xs border border-[#D5CEBA] dark:border-[#3D4658]
                         focus:outline-none focus:ring-2 focus:ring-[#FF6666]/30 focus:border-[#FF6666]/60
                         transition-all"
            />
            {query && (
              <button
                aria-label="Clear search"
                onClick={() => handleInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full
                           bg-[#D5CEBA] dark:bg-[#3D4658] text-[#713432] dark:text-[#D8DCE4] flex items-center justify-center"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-8" aria-busy={loading}>
        {loading && (
          <div className="flex items-center justify-center py-12" role="status" aria-label="Searching destinations">
            <div className="w-6 h-6 border-2 border-[#FF6666]/30 border-t-[#FF6666] rounded-full animate-spin" />
          </div>
        )}

        {!loading && searchError && (
          <div className="text-center py-12 text-[#713432] dark:text-[#D8DCE4] text-sm" role="alert">
            {searchError}
          </div>
        )}

        {!loading && !searchError && results.length === 0 && query.trim().length >= 2 && (
          <div className="text-center py-16 text-[#798897] dark:text-[#A6B1BF] text-sm">
            No results found for "{query}"
          </div>
        )}

        {!loading && !searchError && results.length === 0 && query.trim().length < 2 && (
          <div className="text-center pt-20">
            <div className="text-5xl mb-4">📍</div>
            <p className="text-[#713432] dark:text-[#D8DCE4] font-bold text-[16px]">
              Search destination
            </p>
            <p className="text-[#798897] dark:text-[#A6B1BF] text-sm mt-1">
              Enter a station, street, or landmark
            </p>
          </div>
        )}

        <div className="space-y-2">
          {results.map((r) => (
            <button
              key={r.placeId}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-3.5 rounded-2xl bg-[#E8E1CB] dark:bg-[#252A38] hover:bg-[#DDD5BD] dark:hover:bg-[#2F364F]
                         active:scale-[0.98] transition-all duration-150 shadow-xs
                         border border-[#D5CEBA]/70 dark:border-[#3D4658] group"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F3EED9] dark:bg-[#202734] flex items-center justify-center
                                flex-shrink-0 mt-0.5 text-[#FF8373] group-hover:bg-white dark:group-hover:bg-[#2F364F] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#713432] dark:text-[#D8DCE4] text-[15px] truncate">{r.name}</p>
                  <p className="text-[12px] text-[#798897] dark:text-[#A6B1BF] mt-0.5 line-clamp-2 leading-relaxed">
                    {r.displayName}
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#798897"
                     strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-2.5 opacity-60">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-[#586371] dark:text-[#B6C0CC]">
          Search data ©{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            OpenStreetMap contributors
          </a>
        </p>
      </div>
    </div>
  );
}
