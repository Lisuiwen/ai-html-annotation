import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PACK_REF_FALLBACK_BRANCH,
  isPackRefFallbackEligible,
  planPackRefFallback
} from '../../skills/html-prototype-build/scripts/_pack-install-ref.mjs';

test('planPackRefFallback retries master when pinned ref tarball is missing', () => {
  const error = new Error('tarball fetch failed (404): https://example.test/v0.4.1.tar.gz');
  const fallback = planPackRefFallback('v0.4.1', error);
  assert.deepEqual(fallback, {
    requested: 'v0.4.1',
    actual: PACK_REF_FALLBACK_BRANCH,
    reason: error.message
  });
});

test('planPackRefFallback retries master when pack path is absent in archive', () => {
  const error = new Error('pack path not found in archive: .html-prototype/packs/admin-desktop/');
  const fallback = planPackRefFallback('v0.4.0', error);
  assert.equal(fallback?.actual, PACK_REF_FALLBACK_BRANCH);
});

test('planPackRefFallback does not retry when already on master', () => {
  const error = new Error('tarball fetch failed (404): https://example.test/master.tar.gz');
  assert.equal(planPackRefFallback(PACK_REF_FALLBACK_BRANCH, error), null);
});

test('isPackRefFallbackEligible ignores unrelated errors', () => {
  assert.equal(isPackRefFallbackEligible(new Error('installed pack is incomplete: manifest.json')), false);
});
