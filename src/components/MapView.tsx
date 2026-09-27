import { useEffect, useRef, useCallback, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAppState } from '../hooks/useAppState';
import { FIGMA_LIGHT_STYLE } from '../services/mapStyle';
import { FIGMA_DARK_STYLE } from '../services/mapStyleDark';

const DEFAULT_CENTER: [number, number] = [77.5946, 12.9716]; // Bangalore fallback
const DEFAULT_ZOOM = 14;

export default function MapView() {
  const { state } = useAppState();
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const locMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);
  const routeAdded = useRef(false);
  const prevDarkRef = useRef(state.darkMode);

  /* ── initialise map ─────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialStyle = state.darkMode ? FIGMA_DARK_STYLE : FIGMA_LIGHT_STYLE;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: initialStyle,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
      pitchWithRotate: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.on('error', () => setMapUnavailable(true));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* ── handle dark mode style switch ──────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || prevDarkRef.current === state.darkMode) return;
    prevDarkRef.current = state.darkMode;
    routeAdded.current = false;
    map.setStyle(state.darkMode ? FIGMA_DARK_STYLE : FIGMA_LIGHT_STYLE);
  }, [state.darkMode]);

  /* ── current location marker ────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!state.currentLocation) {
      locMarkerRef.current?.remove();
      locMarkerRef.current = null;
      return;
    }

    if (!locMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'loc-marker';
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Current location');
      el.innerHTML = `<div class="loc-pulse"></div><div class="loc-dot"></div>`;
      locMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([state.currentLocation.lng, state.currentLocation.lat])
        .addTo(map);
    } else {
      locMarkerRef.current.setLngLat([
        state.currentLocation.lng,
        state.currentLocation.lat,
      ]);
    }
  }, [state.currentLocation]);

  /* ── destination marker ─────────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (state.destination) {
      const { lng, lat } = state.destination.coordinates;

      if (!destMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'dest-pin';
        el.setAttribute('role', 'img');
        el.setAttribute('aria-label', `Selected destination: ${state.destination.name}`);
        el.innerHTML = `
          <div class="pin-body">
            <div class="pin-head"><div class="pin-ring"><div class="pin-dot"></div></div></div>
            <div class="pin-stem"></div>
          </div>
          <div class="pin-shadow"></div>
        `;
        destMarkerRef.current = new maplibregl.Marker({
          element: el,
          anchor: 'bottom',
        })
          .setLngLat([lng, lat])
          .addTo(map);
      } else {
        destMarkerRef.current.getElement().setAttribute(
          'aria-label',
          `Selected destination: ${state.destination.name}`
        );
        destMarkerRef.current.setLngLat([lng, lat]);
      }

      // Fly to destination
      map.flyTo({
        center: [lng, lat],
        zoom: 14.5,
        duration: 1800,
        essential: true,
      });
    } else if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }
  }, [state.destination]);

  /* ── route line ─────────────────────────────────────────── */
  const updateRoute = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const currentLocation = state.currentLocation;
    const destination = state.destination;

    if (!currentLocation || !destination) {
      if (routeAdded.current) {
        if (map.getLayer('route-glow')) map.removeLayer('route-glow');
        if (map.getLayer('route-line')) map.removeLayer('route-line');
        if (map.getSource('route')) map.removeSource('route');
        routeAdded.current = false;
      }
      return;
    }

    const coords = createWavyConnection(
      [currentLocation.lng, currentLocation.lat],
      [destination.coordinates.lng, destination.coordinates.lat]
    );

    const geojson: GeoJSON.Feature = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: coords },
    };

    if (routeAdded.current) {
      const src = map.getSource('route') as maplibregl.GeoJSONSource;
      if (src) src.setData(geojson);
    } else {
      map.addSource('route', { type: 'geojson', data: geojson, lineMetrics: true });
      const accent = state.darkMode ? '#FF8373' : '#FF6666';
      const lineLength = getProjectedLineLength(map, coords);
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-width': 9,
          'line-blur': 3,
          'line-gradient': createDashGradient(
            lineLength,
            0,
            state.darkMode
              ? 'rgba(255,131,115,0.3)'
              : 'rgba(255,102,102,0.3)'
          ),
        },
      });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-width': 2.5,
          'line-gradient': createDashGradient(lineLength, 0, accent),
        },
      });
      routeAdded.current = true;
    }
  }, [state.currentLocation, state.destination, state.darkMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleStyleLoad = () => {
      routeAdded.current = false;
      updateRoute();
    };
    map.on('style.load', handleStyleLoad);
    if (map.isStyleLoaded()) updateRoute();

    return () => {
      map.off('style.load', handleStyleLoad);
    };
  }, [updateRoute]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !state.currentLocation || !state.destination) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let lastUpdate = 0;
    const coords = createWavyConnection(
      [state.currentLocation.lng, state.currentLocation.lat],
      [state.destination.coordinates.lng, state.destination.coordinates.lat]
    );
    let lineLength = getProjectedLineLength(map, coords);
    const updateLineLength = () => {
      lineLength = getProjectedLineLength(map, coords);
    };
    map.on('move', updateLineLength);
    map.on('resize', updateLineLength);

    const animateDashes = (timestamp: number) => {
      if (timestamp - lastUpdate >= 40 && map.getLayer('route-line')) {
        const effectiveLength = Math.max(1, lineLength);
        const period = 24 / effectiveLength;
        const phase = ((timestamp / 1000) * (12 / effectiveLength)) % period;
        const dashGradient = createDashGradient(
          effectiveLength,
          phase,
          state.darkMode ? '#FF8373' : '#FF6666'
        );
        const glowGradient = createDashGradient(
          effectiveLength,
          phase,
          state.darkMode
            ? 'rgba(255,131,115,0.3)'
            : 'rgba(255,102,102,0.3)'
        );
        map.setPaintProperty('route-line', 'line-gradient', dashGradient);
        if (map.getLayer('route-glow')) {
          map.setPaintProperty('route-glow', 'line-gradient', glowGradient);
        }
        lastUpdate = timestamp;
      }
      frame = requestAnimationFrame(animateDashes);
    };

    frame = requestAnimationFrame(animateDashes);
    return () => {
      cancelAnimationFrame(frame);
      map.off('move', updateLineLength);
      map.off('resize', updateLineLength);
    };
  }, [state.currentLocation, state.destination, state.darkMode]);

  /* ── alarm radius circles ───────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !state.destination) return;

    // Remove old radius layers
    const layers = map.getStyle().layers || [];
    layers.forEach((l) => {
      if (l.id.startsWith('alarm-radius-')) {
        map.removeLayer(l.id);
      }
    });
    const sources = Object.keys(map.getStyle().sources || {});
    sources.forEach((s) => {
      if (s.startsWith('alarm-radius-')) {
        map.removeSource(s);
      }
    });

    const alarms =
      state.alarmMode === 'single'
        ? [state.singleAlarm]
        : state.progressiveAlarms;

    const { lng, lat } = state.destination.coordinates;
    const colors: Record<string, string> = {
      gentle: 'rgba(76,175,80,0.12)',
      medium: 'rgba(255,193,7,0.12)',
      strong: 'rgba(255,152,0,0.12)',
      critical: 'rgba(255,102,102,0.12)',
    };
    const borders: Record<string, string> = {
      gentle: 'rgba(76,175,80,0.35)',
      medium: 'rgba(255,193,7,0.35)',
      strong: 'rgba(255,152,0,0.35)',
      critical: 'rgba(255,102,102,0.35)',
    };

    alarms.forEach((alarm) => {
      const id = `alarm-radius-${alarm.id}`;
      const circle = createGeoJSONCircle([lng, lat], alarm.distance / 1000, 64);

      map.addSource(id, { type: 'geojson', data: circle });
      map.addLayer({
        id: `${id}-fill`,
        type: 'fill',
        source: id,
        paint: { 'fill-color': colors[alarm.intensity] || colors.critical },
      });
      map.addLayer({
        id: `${id}-stroke`,
        type: 'line',
        source: id,
        paint: {
          'line-color': borders[alarm.intensity] || borders.critical,
          'line-width': 1.5,
          'line-dasharray': [4, 2],
        },
      });
    });
  }, [state.destination, state.alarmMode, state.singleAlarm, state.progressiveAlarms]);

  return (
    <div
      ref={containerRef}
      className={`map-container transition-all duration-300 ${
        state.darkMode ? 'map-dark' : 'map-warm'
      }`}
    >
      {mapUnavailable && (
        <p className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-xl bg-[#F3EED9]/95 px-3 py-2 text-center text-xs font-semibold text-[#713432] shadow-md dark:bg-[#1C1F26]/95 dark:text-[#D8DCE4]" role="status">
          Map imagery is unavailable. Check your connection; alarm controls remain available.
        </p>
      )}
    </div>
  );
}

/* ── Helper: GeoJSON circle ─────────────────────────────────────── */

function createGeoJSONCircle(
  center: [number, number],
  radiusKm: number,
  points = 64
): GeoJSON.Feature {
  const coords: [number, number][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
  }
  coords.push(coords[0]!);

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  };
}

function createWavyConnection(
  from: [number, number],
  to: [number, number]
): [number, number][] {
  const meanLatitude = ((from[1] + to[1]) / 2) * (Math.PI / 180);
  const metersPerLongitudeDegree = 111320 * Math.max(0.01, Math.cos(meanLatitude));
  const metersPerLatitudeDegree = 110574;
  const startX = from[0] * metersPerLongitudeDegree;
  const startY = from[1] * metersPerLatitudeDegree;
  const deltaX = (to[0] - from[0]) * metersPerLongitudeDegree;
  const deltaY = (to[1] - from[1]) * metersPerLatitudeDegree;
  const length = Math.hypot(deltaX, deltaY);
  const amplitude = Math.min(length * 0.08, Math.max(6, length * 0.025));
  const perpendicularX = length === 0 ? 0 : -deltaY / length;
  const perpendicularY = length === 0 ? 0 : deltaX / length;
  const segments = 48;
  const coordinates: [number, number][] = [];

  for (let i = 0; i <= segments; i++) {
    const progress = i / segments;
    const offset = Math.sin(progress * Math.PI * 2) * amplitude;
    const x = startX + deltaX * progress + perpendicularX * offset;
    const y = startY + deltaY * progress + perpendicularY * offset;
    coordinates.push([
      x / metersPerLongitudeDegree,
      y / metersPerLatitudeDegree,
    ]);
  }

  return coordinates;
}

function getProjectedLineLength(
  map: maplibregl.Map,
  coordinates: [number, number][]
): number {
  let length = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const previous = map.project(coordinates[i - 1]!);
    const current = map.project(coordinates[i]!);
    length += Math.hypot(current.x - previous.x, current.y - previous.y);
  }
  return Math.max(1, length);
}

function createDashGradient(
  lineLength: number,
  phase: number,
  color: string
): maplibregl.ExpressionSpecification {
  const period = 24 / lineLength;
  const dashLength = 9 / lineLength;

  return [
    'step',
    ['%', ['-', ['line-progress'], phase], period],
    color,
    dashLength,
    'rgba(0,0,0,0)',
  ];
}
