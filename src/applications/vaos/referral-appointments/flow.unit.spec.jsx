import { expect } from 'chai';
import {
  getReferralBackLinkText,
  getReferralPageKeyFromPathname,
  getReferralUrlLabel,
} from './flow';

describe('Referral Appointments Flow', () => {
  describe('getReferralBackLinkText', () => {
    it('returns "Back to referrals and requests" when on scheduleReferral', () => {
      expect(getReferralBackLinkText('scheduleReferral')).to.equal(
        'Back to referrals and requests',
      );
    });

    it('derives the text from the previous page label', () => {
      // providerSelection.previous === 'scheduleReferral' which has label 'Appointment Referral'.
      expect(getReferralBackLinkText('providerSelection')).to.equal(
        'Back to appointment referral',
      );
    });

    it('returns "Back" for a page without a valid previous label', () => {
      expect(getReferralBackLinkText('appointments')).to.equal('Back');
    });

    it('returns "Back" for an unknown page key', () => {
      expect(getReferralBackLinkText('nonExistingPage')).to.equal('Back');
    });
  });

  describe('getReferralPageKeyFromPathname', () => {
    it('maps /schedule-referral to scheduleReferral', () => {
      expect(getReferralPageKeyFromPathname('/schedule-referral')).to.equal(
        'scheduleReferral',
      );
    });

    it('maps /schedule-referral/provider-selection to providerSelection', () => {
      expect(
        getReferralPageKeyFromPathname('/schedule-referral/provider-selection'),
      ).to.equal('providerSelection');
    });

    it('maps /schedule-referral/date-time to scheduleAppointment', () => {
      expect(
        getReferralPageKeyFromPathname('/schedule-referral/date-time'),
      ).to.equal('scheduleAppointment');
    });

    it('maps /schedule-referral/review to reviewAndConfirm', () => {
      expect(
        getReferralPageKeyFromPathname('/schedule-referral/review'),
      ).to.equal('reviewAndConfirm');
    });

    it('maps /schedule-referral/complete/APPT to complete', () => {
      expect(
        getReferralPageKeyFromPathname('/schedule-referral/complete/APPT'),
      ).to.equal('complete');
    });

    it('maps /referrals-requests to referralsAndRequests', () => {
      expect(getReferralPageKeyFromPathname('/referrals-requests')).to.equal(
        'referralsAndRequests',
      );
    });

    it('maps a nested /referrals-requests/ path to referralsAndRequests', () => {
      expect(
        getReferralPageKeyFromPathname('/referrals-requests/details'),
      ).to.equal('referralsAndRequests');
    });

    it('maps / to appointments', () => {
      expect(getReferralPageKeyFromPathname('/')).to.equal('appointments');
    });

    it('returns null for an unknown path', () => {
      expect(getReferralPageKeyFromPathname('/foo')).to.equal(null);
    });

    it('returns null for an empty string', () => {
      expect(getReferralPageKeyFromPathname('')).to.equal(null);
    });

    it('returns null for undefined', () => {
      expect(getReferralPageKeyFromPathname(undefined)).to.equal(null);
    });
  });

  describe('getReferralUrlLabel', () => {
    const tests = [
      {
        currentPage: 'error',
        categoryOfCare: 'Primary Care',
        expected: 'Back to appointments',
      },
      {
        currentPage: 'appointments',
        categoryOfCare: 'Primary Care',
        expected: 'Appointments',
      },
      {
        currentPage: 'referralsAndRequests',
        categoryOfCare: 'Primary Care',
        expected: 'Referrals and requests',
      },
      {
        currentPage: 'scheduleReferral',
        categoryOfCare: 'Primary Care',
        expected: 'Back to referrals and requests',
      },
      {
        currentPage: 'providerSelection',
        categoryOfCare: 'Primary Care',
        expected: 'Back',
      },
      {
        currentPage: 'scheduleAppointment',
        categoryOfCare: 'Primary Care',
        expected: 'Back',
      },
      {
        currentPage: 'reviewAndConfirm',
        categoryOfCare: 'Primary Care',
        expected: 'Back',
      },
      {
        currentPage: 'complete',
        categoryOfCare: 'Primary Care',
        expected: 'Back to appointments',
      },
      {
        currentPage: 'nonExistingPage',
        categoryOfCare: 'Primary Care',
        expected: null,
      },
    ];
    it('should return the correct label for current page in the flow', () => {
      tests.forEach(test => {
        const breadcrumb = getReferralUrlLabel(
          test.currentPage,
          test.categoryOfCare,
        );
        expect(breadcrumb).to.equal(test.expected);
      });
    });

    it('should return null if the current location is not in the flow', () => {
      const breadcrumb = getReferralUrlLabel('nonExistingPage');
      expect(breadcrumb).to.be.null;
    });
  });
});
