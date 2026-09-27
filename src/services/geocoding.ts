import type { GeocodingResult } from '../types';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
let lastRequestTime = 0;
const MIN_INTERVAL = 1100; // Nominatim rate limit: 1 req/s

async function throttledFetch(url: string): Promise<Response> {
  const wait = MIN_INTERVAL - (Date.now() - lastRequestTime);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestTime = Date.now();
  return fetch(url, {
    headers: { 'Accept-Language': 'en' },
  });
}

/**
 * Forward geocode: text query → place list.
 */
export async function searchPlaces(query: string): Promise<GeocodingResult[]> {
  const normalizedQuery = query.trim().replace(/\s+/g, ' ').slice(0, 120);
  if (normalizedQuery.length < 2) return [];
  const params = new URLSearchParams({
    format: 'json',
    q: normalizedQuery,
    limit: '6',
    addressdetails: '1',
  });
  const url = `${NOMINATIM_BASE}/search?${params.toString()}`;
  const res = await throttledFetch(url);
  if (!res.ok) throw new Error('Geocoding request failed');
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error('Unexpected geocoding response');

  return data.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    if (
      (typeof record.place_id !== 'string' && typeof record.place_id !== 'number') ||
      typeof record.display_name !== 'string'
    ) return [];

    const lat = Number(record.lat);
    const lng = Number(record.lon);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      return [];
    }

    const displayName = record.display_name.slice(0, 500);
    const name = typeof record.name === 'string' && record.name
      ? record.name.slice(0, 120)
      : displayName.split(',')[0] || '';
    return [{
      placeId: String(record.place_id),
      name,
      displayName,
      lat,
      lng,
    }];
  });
}

/**
 * Reverse geocode: coordinates → place.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodingResult | null> {
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new RangeError('Coordinates are outside valid geographic bounds');
  }
  const params = new URLSearchParams({
    format: 'json',
    lat: String(lat),
    lon: String(lng),
    addressdetails: '1',
  });
  const url = `${NOMINATIM_BASE}/reverse?${params.toString()}`;
  const res = await throttledFetch(url);
  if (!res.ok) return null;
  const item = await res.json();
  if (!item || typeof item !== 'object' || item.error) return null;
  const latValue = Number(item.lat);
  const lngValue = Number(item.lon);
  if (!Number.isFinite(latValue) || latValue < -90 || latValue > 90 || !Number.isFinite(lngValue) || lngValue < -180 || lngValue > 180 || typeof item.display_name !== 'string') {
    return null;
  }
  const displayName = item.display_name.slice(0, 500);
  return {
    placeId: String(item.place_id),
    name: typeof item.name === 'string' && item.name ? item.name.slice(0, 120) : displayName.split(',')[0] || '',
    displayName,
    lat: latValue,
    lng: lngValue,
  };
}
