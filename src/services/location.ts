import type { Coordinates } from '../types';

export type LocationCallback = (coords: Coordinates) => void;
export type ErrorCallback = (error: GeolocationPositionError) => void;

class LocationService {
  private watchId: number | null = null;

  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  async getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        reject,
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
      );
    });
  }

  startWatching(onLocation: LocationCallback, onError?: ErrorCallback): void {
    this.stopWatching();
    this.watchId = navigator.geolocation.watchPosition(
      (pos) =>
        onLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      onError,
      { enableHighAccuracy: true, timeout: 30_000, maximumAge: 5_000 }
    );
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  isWatching(): boolean {
    return this.watchId !== null;
  }
}

export const locationService = new LocationService();
