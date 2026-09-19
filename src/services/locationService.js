import { Platform } from 'react-native';
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
  let enabled = await Location.hasServicesEnabledAsync();

  if (!enabled && Platform.OS === 'android') {
    try {
      // Automatically triggers Android Google Play Services native popup to turn on GPS/Location
      await Location.enableNetworkProviderAsync();
      enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        // Allow a brief moment for system provider state to update
        await new Promise((resolve) => setTimeout(resolve, 500));
        enabled = await Location.hasServicesEnabledAsync();
      }
    } catch {
      // User tapped "No thanks" or dismissed dialog
    }
  }

  if (!enabled) {
    throw new LocationError(
      'LOCATION_SERVICES_DISABLED',
      'Please turn on GPS/Location services on your device.'
    );
  }
}

const defaultLat = 23.777702;
const defaultLon = 90.361081;
const defaultRadius = 150;

const parsedLat = parseFloat(process.env.EXPO_PUBLIC_OFFICE_LATITUDE);
const parsedLon = parseFloat(process.env.EXPO_PUBLIC_OFFICE_LONGITUDE);
const parsedRadius = parseFloat(
  process.env.EXPO_PUBLIC_OFFICE_RADIUS_METERS || process.env.EXPO_PUBLIC_GEOFENCE_RADIUS_METERS
);

export const OFFICE_LOCATION = {
  latitude: !isNaN(parsedLat) ? parsedLat : defaultLat,
  longitude: !isNaN(parsedLon) ? parsedLon : defaultLon,
  name: process.env.EXPO_PUBLIC_OFFICE_NAME || 'e-Learning & Earning Ltd.',
};

export const GEOFENCE_RADIUS_METERS = !isNaN(parsedRadius) ? parsedRadius : defaultRadius;

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

    let location = null;

    // 1. Strict Fast Path: Only accept cache if it is extremely fresh (<= 15 seconds)
    // AND has high accuracy (<= 75 meters, well inside the 150m office geofence)
    try {
      const lastKnown = await Location.getLastKnownPositionAsync({
        maxAge: 15000, // strictly within the last 15 seconds
        requiredAccuracy: 75, // high precision under 75m
      });

      if (lastKnown?.coords?.latitude && lastKnown?.coords?.longitude) {
        location = lastKnown;
      }
    } catch {
      // Proceed to fresh high-accuracy position fetch
    }

    // 2. Fetch fresh high-accuracy GPS position if no ultra-recent cache is available
    if (!location) {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
    }

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

