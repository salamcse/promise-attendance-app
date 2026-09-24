import { Platform } from 'react-native';
import * as Device from 'expo-device';

/**
 * Returns standardized device information for clock-in / clock-out payloads.
 * Format:
 *   device_type: 'mobile' | 'web'
 *   device_info: 'iPhone 12' | 'Samsung SM-G998B' | etc.
 */
export function getDeviceDetails() {
  const deviceType = Platform.OS === 'web' ? 'web' : 'mobile';

  // Use expo-device modelName if available (e.g. "iPhone 12", "Pixel 6")
  let deviceInfo = Device.modelName;

  if (!deviceInfo) {
    if (Platform.OS === 'ios') {
      deviceInfo = 'iPhone';
    } else if (Platform.OS === 'android') {
      const brand = Platform.constants?.Brand || '';
      const model = Platform.constants?.Model || '';
      const combined = [brand, model].filter(Boolean).join(' ');
      deviceInfo = combined || 'Android Device';
    } else {
      deviceInfo = 'Web Browser';
    }
  }

  return {
    device_type: deviceType,
    device_info: deviceInfo,
  };
}
