/**
 * Error utility: Returns the direct error message from backend or error object
 */
export function getErrorMessage(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const msg = typeof error === 'string' ? error : error.message || '';

  if (
    msg.includes('UnknownHostException') ||
    msg.includes('Unable to resolve host') ||
    msg.includes('Network request failed') ||
    msg.includes('Failed to fetch')
  ) {
    return 'No internet connection. Please check your mobile data or Wi-Fi connection.';
  }

  if (error?.code === 'TIMEOUT' || msg.includes('timed out')) {
    return 'Network request timed out. Please check your internet connection.';
  }

  return msg || 'Something went wrong. Please try again.';
}
