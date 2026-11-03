/**
 * Application Configuration & API Base URL Strategy
 */

const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL;
const DEFAULT_API_URL = 'https://spider.promiseassets.com/api/v1';

function resolveBaseUrl() {
  if (!RAW_API_URL) {
    if (__DEV__) {
      console.warn(
        '[Config] EXPO_PUBLIC_API_URL is not set. Falling back to default URL:',
        DEFAULT_API_URL
      );
    }
    return DEFAULT_API_URL;
  }

  let cleaned = RAW_API_URL.trim().replace(/\/+$/, '');
  // Normalize if URL accidentally includes endpoint sub-path
  if (cleaned.endsWith('/hrm')) {
    cleaned = cleaned.slice(0, -4);
  }
  return cleaned;
}

export const API_BASE_URL = resolveBaseUrl();
export const API_TIMEOUT_MS = 12000;

export const DEFAULT_OFFICE_LATITUDE = 23.777702;
export const DEFAULT_OFFICE_LONGITUDE = 90.361081;

export const OFFICE_CONFIG = {
  LATITUDE: !isNaN(parseFloat(process.env.EXPO_PUBLIC_OFFICE_LATITUDE))
    ? parseFloat(process.env.EXPO_PUBLIC_OFFICE_LATITUDE)
    : DEFAULT_OFFICE_LATITUDE,
  LONGITUDE: !isNaN(parseFloat(process.env.EXPO_PUBLIC_OFFICE_LONGITUDE))
    ? parseFloat(process.env.EXPO_PUBLIC_OFFICE_LONGITUDE)
    : DEFAULT_OFFICE_LONGITUDE,
  RADIUS_METERS: parseFloat(process.env.EXPO_PUBLIC_OFFICE_RADIUS_METERS) || 150,
  NAME: process.env.EXPO_PUBLIC_OFFICE_NAME || 'e-Learning & Earning Ltd.',
};
