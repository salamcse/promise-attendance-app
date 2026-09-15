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
