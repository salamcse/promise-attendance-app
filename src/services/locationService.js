import * as Location from 'expo-location';

export class LocationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'LocationError';
    this.code = code;
  }
}

async function ensureLocationPermission() {
  const permission = await Location.getForegroundPermissionsAsync();

  if (permission.status === 'granted') {
    return;
  }

  const requested = await Location.requestForegroundPermissionsAsync();

  if (requested.status !== 'granted') {
    throw new LocationError(
      'LOCATION_PERMISSION_DENIED',
      'Location permission is required to record attendance.'
    );
  }
}

async function ensureLocationServices() {
  const enabled = await Location.hasServicesEnabledAsync();

  if (!enabled) {
    throw new LocationError(
      'LOCATION_SERVICES_DISABLED',
      'Please turn on GPS/Location services on your device.'
    );
  }
}

export const OFFICE_LOCATION = {
  latitude: 23.777702,
  longitude: 90.361081,
  name: 'e-Learning & Earning Ltd.',
};

export const GEOFENCE_RADIUS_METERS = 150;

/**
 * Calculate distance between two points in meters using Haversine formula
 */
export function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if location is within office geofence radius
 */
export function isOfficeLocation(latitude, longitude, radiusMeters = GEOFENCE_RADIUS_METERS) {
  if (latitude == null || longitude == null) return false;
  const distance = getDistanceInMeters(
    latitude,
    longitude,
    OFFICE_LOCATION.latitude,
    OFFICE_LOCATION.longitude
  );
  return distance <= radiusMeters;
}

export async function getCurrentLocation() {
  try {
    await ensureLocationPermission();
    await ensureLocationServices();

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude, accuracy } = location.coords;

    return {
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
      accuracy: accuracy ?? null,
      isOffice: isOfficeLocation(latitude, longitude),
    };
  } catch (error) {
    if (error instanceof LocationError) {
      throw error;
    }

    console.error('[LocationService] Failed to get location:', error);

    throw new LocationError(
      'LOCATION_FETCH_FAILED',
      'Unable to acquire location. Please ensure GPS is active and try again.'
    );
  }
}

