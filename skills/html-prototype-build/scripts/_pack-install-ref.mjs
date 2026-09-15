/** Branch used when a pinned pack ref is missing from the remote archive. */
export const PACK_REF_FALLBACK_BRANCH = 'master';

export function isPackRefFallbackEligible(error) {
  if (!error || typeof error.message !== 'string') return false;
  return error.message.startsWith('tarball fetch failed')
    || error.message.includes('pack path not found in archive');
}

export function planPackRefFallback(requestedRef, error) {
  if (!requestedRef || requestedRef === PACK_REF_FALLBACK_BRANCH) return null;
  if (!isPackRefFallbackEligible(error)) return null;
  return {
    requested: requestedRef,
    actual: PACK_REF_FALLBACK_BRANCH,
    reason: error.message
  };
}
