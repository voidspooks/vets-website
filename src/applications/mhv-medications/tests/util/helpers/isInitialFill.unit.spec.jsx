import { expect } from 'chai';
import { isInitialFill } from '../../../util/helpers/isInitialFill';

describe('isInitialFill', () => {
  describe('returns true', () => {
    it('when rxRfRecords is an empty array', () => {
      const prescription = { rxRfRecords: [] };
      expect(isInitialFill(prescription)).to.be.true;
    });
  });

  describe('returns false', () => {
    it('when rxRfRecords has items', () => {
      const prescription = {
        rxRfRecords: [{ dispensedDate: '2025-10-03T04:00:00.000Z' }],
      };
      expect(isInitialFill(prescription)).to.be.false;
    });

    it('when rxRfRecords is not an array', () => {
      expect(isInitialFill({ rxRfRecords: 'string' })).to.be.false;
      expect(isInitialFill({ rxRfRecords: null })).to.be.false;
      expect(isInitialFill({ rxRfRecords: undefined })).to.be.false;
      expect(isInitialFill({})).to.be.false;
    });

    it('when prescription is invalid', () => {
      expect(isInitialFill(null)).to.be.false;
      expect(isInitialFill(undefined)).to.be.false;
    });
  });
});
