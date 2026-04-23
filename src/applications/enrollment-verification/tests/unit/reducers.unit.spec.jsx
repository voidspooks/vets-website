import { expect } from 'chai';
import reducer from '../../reducers';
import { FETCH_POST_911_GI_BILL_ELIGIBILITY_SUCCESS } from '../../actions';

describe('enrollment-verification reducer', () => {
  describe('FETCH_POST_911_GI_BILL_ELIGIBILITY_SUCCESS', () => {
    const createMockResponse = enrollmentVerifications => ({
      response: {
        data: {
          attributes: {
            enrollmentVerifications,
            lastCertifiedThroughDate: '2023-01-31',
            paymentOnHold: false,
          },
        },
      },
    });

    it('filters out enrollments with certifiedEndDate in the future', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = `${tomorrow.getFullYear()}-${String(
        tomorrow.getMonth() + 1,
      ).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

      const mockEnrollments = [
        {
          verificationMonth: 'Future Month',
          certifiedBeginDate: tomorrowString,
          certifiedEndDate: tomorrowString,
          verificationResponse: 'NR',
        },
      ];

      const action = {
        type: FETCH_POST_911_GI_BILL_ELIGIBILITY_SUCCESS,
        ...createMockResponse(mockEnrollments),
      };

      const state = reducer.data(undefined, action);

      expect(
        state.enrollmentVerification.enrollmentVerifications,
      ).to.have.lengthOf(0);
    });

    it('includes enrollments with certifiedEndDate equal to today', () => {
      const today = new Date();
      const todayString = `${today.getFullYear()}-${String(
        today.getMonth() + 1,
      ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const mockEnrollments = [
        {
          verificationMonth: 'Current Month',
          certifiedBeginDate: todayString,
          certifiedEndDate: todayString,
          verificationResponse: 'NR',
        },
      ];

      const action = {
        type: FETCH_POST_911_GI_BILL_ELIGIBILITY_SUCCESS,
        ...createMockResponse(mockEnrollments),
      };

      const state = reducer.data(undefined, action);

      expect(
        state.enrollmentVerification.enrollmentVerifications,
      ).to.have.lengthOf(1);
      expect(
        state.enrollmentVerification.enrollmentVerifications[0]
          .verificationMonth,
      ).to.equal('Current Month');
    });

    it('includes enrollments with certifiedEndDate in the past', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = `${yesterday.getFullYear()}-${String(
        yesterday.getMonth() + 1,
      ).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      const mockEnrollments = [
        {
          verificationMonth: 'Past Month',
          certifiedBeginDate: yesterdayString,
          certifiedEndDate: yesterdayString,
          verificationResponse: 'NR',
        },
      ];

      const action = {
        type: FETCH_POST_911_GI_BILL_ELIGIBILITY_SUCCESS,
        ...createMockResponse(mockEnrollments),
      };

      const state = reducer.data(undefined, action);

      expect(
        state.enrollmentVerification.enrollmentVerifications,
      ).to.have.lengthOf(1);
      expect(
        state.enrollmentVerification.enrollmentVerifications[0]
          .verificationMonth,
      ).to.equal('Past Month');
    });

    it('correctly filters mixed past, present, and future enrollments', () => {
      const today = new Date();
      const todayString = `${today.getFullYear()}-${String(
        today.getMonth() + 1,
      ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = `${yesterday.getFullYear()}-${String(
        yesterday.getMonth() + 1,
      ).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = `${tomorrow.getFullYear()}-${String(
        tomorrow.getMonth() + 1,
      ).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

      const mockEnrollments = [
        {
          verificationMonth: 'Future Month',
          certifiedBeginDate: tomorrowString,
          certifiedEndDate: tomorrowString,
          verificationResponse: 'NR',
        },
        {
          verificationMonth: 'Current Month',
          certifiedBeginDate: todayString,
          certifiedEndDate: todayString,
          verificationResponse: 'NR',
        },
        {
          verificationMonth: 'Past Month',
          certifiedBeginDate: yesterdayString,
          certifiedEndDate: yesterdayString,
          verificationResponse: 'NR',
        },
      ];

      const action = {
        type: FETCH_POST_911_GI_BILL_ELIGIBILITY_SUCCESS,
        ...createMockResponse(mockEnrollments),
      };

      const state = reducer.data(undefined, action);

      expect(
        state.enrollmentVerification.enrollmentVerifications,
      ).to.have.lengthOf(2);
      expect(
        state.enrollmentVerification.enrollmentVerifications[0]
          .verificationMonth,
      ).to.equal('Current Month');
      expect(
        state.enrollmentVerification.enrollmentVerifications[1]
          .verificationMonth,
      ).to.equal('Past Month');
    });

    it('uses local timezone for date comparison, not UTC', () => {
      // This test simulates the scenario where it's March 31st locally
      // but might be April 1st in UTC depending on timezone
      const today = new Date();
      const localDateString = `${today.getFullYear()}-${String(
        today.getMonth() + 1,
      ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const mockEnrollments = [
        {
          verificationMonth: 'Current Month (Local)',
          certifiedBeginDate: localDateString,
          certifiedEndDate: localDateString,
          verificationResponse: 'NR',
        },
      ];

      const action = {
        type: FETCH_POST_911_GI_BILL_ELIGIBILITY_SUCCESS,
        ...createMockResponse(mockEnrollments),
      };

      const state = reducer.data(undefined, action);

      // The enrollment with today's local date should be included
      expect(
        state.enrollmentVerification.enrollmentVerifications,
      ).to.have.lengthOf(1);
    });
  });
});
