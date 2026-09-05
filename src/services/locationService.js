import * as Location from 'expo-location';
import { Platform } from 'react-native';

/**
 * Fetch current user location with exact GPS coordinates and exact street address details.
 * Supports Expo Location native API with OpenStreetMap Nominatim reverse geocoding.
 */
export async function getCurrentLocation() {
  try {
    let hasPermission = false;

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        hasPermission = status === 'granted';
      } catch (e) {
        hasPermission = true;
      }
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      hasPermission = status === 'granted';
    }

    if (!hasPermission) {
      throw new Error('Location permission denied. Please enable location services in your device settings.');
    }

    let loc = null;
    try {
      loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });
    } catch (err) {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        loc = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
              }
            }),
            (error) => reject(new Error(error.message || 'Failed to get position')),
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });
      } else {
        throw err;
      }
    }

    const { latitude, longitude, accuracy } = loc.coords;
    const latFormatted = Number(latitude.toFixed(6));
    const lonFormatted = Number(longitude.toFixed(6));

    let address = `Lat: ${latFormatted}°, Lon: ${lonFormatted}°`;
    let city = `Coordinates: ${latFormatted}, ${lonFormatted}`;
    let country = '';

    // Reverse geocode to get exact street address and suburb/district
    try {
      // 1. Try OpenStreetMap Nominatim API for exact street level address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'TimePulseAttendanceApp/1.0' } }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const addrObj = data.address;

          const road = addrObj.road || addrObj.street || addrObj.pedestrian || addrObj.path || '';
          const suburb = addrObj.suburb || addrObj.neighbourhood || addrObj.residential || addrObj.quarter || '';
          const cityName = addrObj.city || addrObj.town || addrObj.village || addrObj.county || addrObj.state_district || '';
          const state = addrObj.state || addrObj.region || '';
          country = addrObj.country || '';

          // Format exact city / area title
          if (suburb && cityName) {
            city = `${suburb}, ${cityName}`;
          } else if (cityName) {
            city = cityName;
          } else if (suburb) {
            city = suburb;
          } else {
            city = `${latFormatted}°, ${lonFormatted}°`;
          }

          // Format exact full address
          const fullParts = [
            addrObj.house_number,
            road,
            suburb,
            cityName,
            state,
            country
          ].filter(Boolean);

          if (fullParts.length > 0) {
            address = fullParts.join(', ');
          } else if (data.display_name) {
            address = data.display_name;
          }
        }
      }
    } catch (osmErr) {
      console.log('Nominatim lookup notice:', osmErr);
    }

    // 2. Fallback to Expo Native reverse geocode if address not filled
    if (address.startsWith('Lat:')) {
      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode && geocode.length > 0) {
          const item = geocode[0];
          const area = item.district || item.subregion || item.street || item.name || '';
          const cityVal = item.city || item.region || '';
          city = area && cityVal ? `${area}, ${cityVal}` : (cityVal || area || `${latFormatted}°, ${lonFormatted}°`);
          country = item.country || '';

          const parts = [
            item.streetNumber,
            item.street || item.name,
            item.district || item.subregion,
            item.city,
            item.region,
            item.country
          ].filter(Boolean);

          if (parts.length > 0) {
            address = parts.join(', ');
          }
        }
      } catch (expoGeocodeErr) {
        // Keep formatted coordinate address
      }
    }

    return {
      latitude: latFormatted,
      longitude: lonFormatted,
      accuracy: Math.round(accuracy || 10),
      address,
      city,
      country,
      exactCoordinates: `${latFormatted}° N, ${lonFormatted}° E`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Location service error:', error);
    return {
      latitude: 23.8103,
      longitude: 90.4125,
      accuracy: 15,
      address: 'Plot 14, Road 11, Block D, Banani, Dhaka 1213, Bangladesh',
      city: 'Banani, Dhaka',
      country: 'Bangladesh',
      exactCoordinates: '23.810300° N, 90.412500° E',
      isFallback: true,
      errorMsg: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}
