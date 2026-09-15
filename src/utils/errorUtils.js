/**
 * Error utility: Returns the direct error message from backend or error object
 */
export function getErrorMessage(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';
  if (typeof error === 'string') return error;
  return error.message || 'Something went wrong. Please try again.';
}
