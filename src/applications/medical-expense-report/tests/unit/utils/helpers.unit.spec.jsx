import { expect } from 'chai';
import { parseISO } from 'date-fns';
import sinon from 'sinon';
import * as formsUi from 'platform/forms-system/src/js/utilities/ui';
import {
  isSameOrAfter,
  isProductionEnv,
  showMultiplePageResponse,
  focusFirstError,
  focusH3,
} from '../../../utils/helpers';

describe('Helpers', () => {
  describe('isSameOrAfter', () => {
    it('should return true when first date is after second date', () => {
      const date1 = parseISO('2025-01-02');
      const date2 = parseISO('2025-01-01');

      expect(isSameOrAfter(date1, date2)).to.be.true;
    });

    it('should return true when dates are equal', () => {
      const date1 = parseISO('2025-01-01');
      const date2 = parseISO('2025-01-01');

      expect(isSameOrAfter(date1, date2)).to.be.true;
    });

    it('should return false when first date is before second date', () => {
      const date1 = parseISO('2025-01-01');
      const date2 = parseISO('2025-01-02');

      expect(isSameOrAfter(date1, date2)).to.be.false;
    });
  });

  describe('isProductionEnv', () => {
    it('should return a boolean value', () => {
      const result = isProductionEnv();
      expect(typeof result).to.equal('boolean');
    });

    it('should return false in test environment (Mocha is present)', () => {
      expect(isProductionEnv()).to.be.false;
    });
  });

  describe('showMultiplePageResponse', () => {
    it('should return a boolean value', () => {
      const result = showMultiplePageResponse();
      expect(typeof result).to.equal('boolean');
    });

    it('should return false by default in test environment', () => {
      expect(showMultiplePageResponse()).to.be.false;
    });
  });

  describe('focus helpers', () => {
    let queryErrorStub;
    let h3;
    let h3FocusSpy;

    beforeEach(() => {
      queryErrorStub = sinon.stub(formsUi, '$');

      const main = document.createElement('div');
      main.id = 'main';
      h3 = document.createElement('h3');
      main.appendChild(h3);
      document.body.appendChild(main);
      h3FocusSpy = sinon.spy(h3, 'focus');
    });

    afterEach(() => {
      h3FocusSpy.restore();
      document.getElementById('main')?.remove();
      queryErrorStub.restore();
    });

    it('focusFirstError returns true and scrolls to alert when an error exists', () => {
      queryErrorStub.returns(document.createElement('input'));

      const result = focusFirstError(0, document.body);

      expect(result).to.be.true;
      expect(
        queryErrorStub.calledWithExactly(
          '[error], .usa-input-error',
          document.body,
        ),
      ).to.be.true;
    });

    it('focusFirstError returns false when no error exists', () => {
      queryErrorStub.returns(null);

      const result = focusFirstError(0, document.body);

      expect(result).to.be.false;
      expect(
        queryErrorStub.calledWithExactly(
          '[error], .usa-input-error',
          document.body,
        ),
      ).to.be.true;
    });

    it('focusH3 does not focus h3 when a field error exists', () => {
      queryErrorStub.returns(document.createElement('input'));

      focusH3(0, document.body);

      expect(h3FocusSpy.notCalled).to.be.true;
    });

    it('focusH3 focuses the h3 when no field error exists', () => {
      queryErrorStub.returns(null);

      focusH3(0, document.body);

      expect(h3FocusSpy.calledOnce).to.be.true;
    });
  });
});
