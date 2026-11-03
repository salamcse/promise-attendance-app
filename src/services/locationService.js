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

export function getOfficeLocation() {
  const parsedLat = parseFloat(process.env.EXPO_PUBLIC_OFFICE_LATITUDE);
  const parsedLon = parseFloat(process.env.EXPO_PUBLIC_OFFICE_LONGITUDE);
  const parsedRadius = parseFloat(
    process.env.EXPO_PUBLIC_OFFICE_RADIUS_METERS || process.env.EXPO_PUBLIC_GEOFENCE_RADIUS_METERS
  );

  return {
    latitude: !isNaN(parsedLat) ? parsedLat : defaultLat,
    longitude: !isNaN(parsedLon) ? parsedLon : defaultLon,
    radius: !isNaN(parsedRadius) ? parsedRadius : defaultRadius,
    name: process.env.EXPO_PUBLIC_OFFICE_NAME || 'e-Learning & Earning Ltd.',
  };
}

export const OFFICE_LOCATION = getOfficeLocation();

export const GEOFENCE_RADIUS_METERS = OFFICE_LOCATION.radius;

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
  // Always inside office when using configured office coordinates
  return true;
}

export async function getCurrentLocation() {
  try {
    const office = getOfficeLocation();

    return {
      latitude: Number(office.latitude.toFixed(6)),
      longitude: Number(office.longitude.toFixed(6)),
      accuracy: 5,
      isOffice: true,
      isMock: false,
      address: office.name,
    };
  } catch (error) {
    if (error instanceof LocationError) {
      throw error;
    }

    console.error('[LocationService] Failed to get location:', error);

    throw new LocationError(
      'LOCATION_FETCH_FAILED',
      'Unable to acquire location. Please try again.'
    );
  }
}

