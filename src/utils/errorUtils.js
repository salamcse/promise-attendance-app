/**
 * Error utility: Returns the direct error message from backend or error object
 */
export function getErrorMessage(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const rawMsg = [
    typeof error === 'string' ? error : '',
    error?.message,
    error?.cause?.message,
    String(error || ''),
  ]
    .filter(Boolean)
    .join(' ');

  const lower = rawMsg.toLowerCase();

  if (
    lower.includes('unknownhostexception') ||
    lower.includes('unable to resolve host') ||
    lower.includes('no address associated with hostname') ||
    lower.includes('network request failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('fetch failed') ||
    lower.includes('enotfound') ||
    lower.includes('econnrefused') ||
    lower.includes('econnreset') ||
    lower.includes('eai_again') ||
    lower.includes('err_internet_disconnected')
  ) {
    return 'No internet connection. Please check your mobile data or Wi-Fi connection.';
  }

  if (error?.code === 'TIMEOUT' || lower.includes('timed out') || lower.includes('timeout')) {
    return 'Network request timed out. Please check your internet connection.';
  }

  return (typeof error === 'string' ? error : error.message) || 'Something went wrong. Please try again.';
}
