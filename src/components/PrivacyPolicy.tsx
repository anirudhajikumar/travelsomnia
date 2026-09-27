import { useEffect, useRef, useState } from 'react';
import { storage } from '../services/storage';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export default function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
  const [error, setError] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const clearSavedData = async () => {
    setError(null);
    setCleared(false);
    try {
      await storage.clearSavedData();
      setCleared(true);
    } catch {
      setError('Saved data could not be cleared. Check browser storage permissions and try again.');
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[100] m-0 h-full w-full max-h-none max-w-none overflow-y-auto border-0 bg-[#F3EED9] p-0 text-[#713432] backdrop:bg-black/50 dark:bg-[#1C1F26] dark:text-[#D8DCE4]"
      aria-labelledby="privacy-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="mx-auto max-w-2xl px-5 py-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-6 rounded-lg px-3 py-2 text-sm font-semibold underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Back to Travelsomnia
        </button>

        <h1 id="privacy-title" className="text-2xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[#586371] dark:text-[#B6C0CC]">
          Last updated: September 27, 2026
        </p>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-[#586371] dark:text-[#B6C0CC]">
          <section>
            <h2 className="font-bold text-[#713432] dark:text-[#D8DCE4]">Location access</h2>
            <p>
              Travelsomnia asks for browser location access only when you press Start Journey. Location is needed to calculate distance and trigger your alarms. A one-time position is read to initialize the journey, then live position updates are used while the journey is active. Tracking stops when the journey ends or arrives. Current location is kept in page memory only and is not saved as journey history.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-[#713432] dark:text-[#D8DCE4]">Data stored on this device</h2>
            <p>
              Alarm preferences, sound preferences, and theme preference are stored in browser local storage. The selected destination and current location are kept in memory for the active session and are not saved for later. The app does not use accounts, analytics, advertising trackers, or non-essential cookies.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-[#713432] dark:text-[#D8DCE4]">Map, search, and font providers</h2>
            <p>
              Map tiles are requested from OpenFreeMap. When you search, the search text is sent over HTTPS to OpenStreetMap’s Nominatim geocoding service to find places. These providers receive normal network information such as your IP address; map tile requests also reveal the map areas being viewed, and geocoding requests include the query. Inter and its font files are loaded from Google Fonts. Their own privacy and retention terms apply to those requests.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-[#713432] dark:text-[#D8DCE4]">Retention and clearing data</h2>
            <p>
              Alarm, sound, and theme settings remain in local storage until you clear them or clear browser site data. The app caches map tiles for up to 30 days and geocoding responses for up to 7 days; the geocoding cache key includes the search query. Use the button below to clear saved settings, any legacy saved destination, and these map/search caches. The browser may separately retain network records according to its own settings.
            </p>
          </section>

          <p>
            Location alarms depend on browser permission, device location availability, and background execution support. Do not rely on the app as your sole travel-safety measure.
          </p>
        </div>

        {error && <p className="mt-5 text-sm font-semibold" role="alert">{error}</p>}
        {cleared && (
          <p className="mt-5 text-sm font-semibold" role="status">
            Saved settings and map/search caches have been cleared.
          </p>
        )}
        <button
          type="button"
          onClick={clearSavedData}
          className="mt-7 rounded-xl border border-[#D5CEBA] dark:border-[#3D4658] px-4 py-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Clear saved data and caches
        </button>
      </div>
    </dialog>
  );
}
