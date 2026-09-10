import * as Location from 'expo-location';

/**
 * Fetch current real GPS coordinates.
 * Throws an error if permission is denied or location cannot be obtained.
 */
export async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission is required for attendance.');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: Number(location.coords.latitude.toFixed(6)),
    longitude: Number(location.coords.longitude.toFixed(6)),
  };
}

