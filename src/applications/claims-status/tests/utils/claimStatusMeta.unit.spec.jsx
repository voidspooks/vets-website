import { expect } from 'chai';
import {
  isChampvaProviderClaim,
  shouldUseClaimStatusMeta,
  withClaimStatusMetaIfEnabled,
} from '../../utils/claimStatusMeta';

describe('claimStatusMeta utils', () => {
  describe('isChampvaProviderClaim', () => {
    it('returns true for ivc_champva provider', () => {
      const claim = { attributes: { provider: 'ivc_champva' } };
      expect(isChampvaProviderClaim(claim)).to.equal(true);
    });

    it('returns true for normalized provider class name', () => {
      const claim = {
        attributes: { provider: 'ivcchampvabenefitsclaimsprovider' },
      };
      expect(isChampvaProviderClaim(claim)).to.equal(true);
    });

    it('returns false for non-CHAMPVA claims', () => {
      const claim = { attributes: { provider: 'lighthouse' } };
      expect(isChampvaProviderClaim(claim)).to.equal(false);
    });
  });

  describe('shouldUseClaimStatusMeta', () => {
    it('returns true for CHAMPVA claims when feature toggle is enabled', () => {
      const claim = { attributes: { provider: 'ivc_champva' } };
      expect(shouldUseClaimStatusMeta(claim, true)).to.equal(true);
    });

    it('returns false for CHAMPVA claims when feature toggle is disabled', () => {
      const claim = { attributes: { provider: 'ivc_champva' } };
      expect(shouldUseClaimStatusMeta(claim, false)).to.equal(false);
    });

    it('returns true for non-CHAMPVA claims regardless of feature toggle', () => {
      const claim = { attributes: { provider: 'lighthouse' } };
      expect(shouldUseClaimStatusMeta(claim, false)).to.equal(true);
    });
  });

  describe('withClaimStatusMetaIfEnabled', () => {
    const baseClaim = {
      id: '123',
      attributes: {
        provider: 'ivc_champva',
        claimStatusMeta: { files: { simpleLayout: true } },
        status: 'PENDING',
      },
    };

    it('returns claim unchanged when feature toggle is enabled', () => {
      const result = withClaimStatusMetaIfEnabled(baseClaim, true);
      expect(result).to.equal(baseClaim);
    });

    it('removes claimStatusMeta for CHAMPVA claims when feature toggle is disabled', () => {
      const result = withClaimStatusMetaIfEnabled(baseClaim, false);

      expect(result).to.not.equal(baseClaim);
      expect(result.attributes.claimStatusMeta).to.equal(undefined);
      expect(result.attributes.status).to.equal('PENDING');
      expect(baseClaim.attributes.claimStatusMeta).to.deep.equal({
        files: { simpleLayout: true },
      });
    });

    it('returns claim unchanged when claim has no attributes', () => {
      const claim = { id: '123' };
      expect(withClaimStatusMetaIfEnabled(claim, false)).to.equal(claim);
    });
  });
});
