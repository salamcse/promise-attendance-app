/**
 * Error normalization and user-friendly message resolution
 */

export function getErrorMessage(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';

  if (typeof error === 'string') return error;

  // Handle ApiError or standard error code
  if (error.code) {
    switch (error.code) {
      case 'AUTH_ERROR':
        return error.message || 'Your session has expired. Please log in again.';
      case 'TIMEOUT_ERROR':
        return 'The request timed out. Please check your connection and try again.';
      case 'NETWORK_ERROR':
        return 'Unable to reach the server. Please check your internet connection.';
      case 'SERVER_ERROR':
        return 'Server encountered an issue. Please try again in a moment.';
      case 'LOCATION_PERMISSION_DENIED':
        return 'Location permission is required to record attendance.';
      case 'LOCATION_SERVICES_DISABLED':
        return 'Please enable GPS/Location services on your device.';
      case 'LOCATION_FETCH_FAILED':
        return 'Unable to detect your location. Please try again.';
      default:
        break;
    }
  }

  // Handle HTTP status fallback
  if (error.status === 401 || error.status === 403) {
    return 'Invalid credentials or expired session.';
  }

  if (error.status === 500) {
    return 'Server error. Please try again shortly.';
  }

  return error.message || 'Something went wrong. Please try again.';
}
