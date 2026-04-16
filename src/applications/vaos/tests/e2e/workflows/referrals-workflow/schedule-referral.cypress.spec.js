import { mockFeatureToggles } from '../../vaos-cypress-helpers';
import {
  mockReferralDetailGetApi,
  saveScreenshot,
} from './referrals-cypress-helpers';
import MockUser from '../../../fixtures/MockUser';
import MockReferralDetailResponse from '../../../fixtures/MockReferralDetailResponse';
import scheduleReferral from '../../referrals/page-objects/ScheduleReferral';

const referralId = 'test-referral-uuid';

describe('VAOS Schedule Referral', () => {
  beforeEach(() => {
    mockFeatureToggles({
      vaOnlineSchedulingCCDirectScheduling: true,
      vaOnlineSchedulingFlatFacilityPage: true,
      vaOnlineSchedulingUseV2ApiRequests: true,
    });

    cy.login(new MockUser());
  });

  describe('Happy path', () => {
    it('should display referral details and schedule button', () => {
      const response = MockReferralDetailResponse.createSuccessResponse({
        id: referralId,
        referralNumber: referralId,
      });

      mockReferralDetailGetApi({
        id: referralId,
        response,
      });

      cy.visit(`/my-health/appointments/schedule-referral?id=${referralId}`);
      cy.wait('@v2:get:referral:detail');

      scheduleReferral.validate();
      scheduleReferral.assertReferralDetails();
      scheduleReferral.assertCommonQuestions();
      scheduleReferral.assertCommunityCareOfficeLink();

      cy.findByTestId('schedule-appointment-button').should('exist');

      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_scheduleReferral_happy');
    });
  });

  describe('Warning alerts', () => {
    it('should display warning alert when onlineSchedule is false', () => {
      const response = new MockReferralDetailResponse({
        id: referralId,
        referralNumber: referralId,
        onlineSchedule: false,
      }).toJSON();

      mockReferralDetailGetApi({
        id: referralId,
        response,
      });

      cy.visit(`/my-health/appointments/schedule-referral?id=${referralId}`);
      cy.wait('@v2:get:referral:detail');

      scheduleReferral.validate();
      scheduleReferral.assertOnlineSchedulingNotAvailableAlert();
      cy.findByTestId('schedule-appointment-button').should('not.exist');

      cy.injectAxeThenAxeCheck();
      saveScreenshot(
        'vaos_ccDirectScheduling_scheduleReferral_onlineScheduleDisabled',
      );
    });

    it('should display warning alert when station ID is not valid', () => {
      const response = MockReferralDetailResponse.createSuccessResponse({
        id: referralId,
        referralNumber: referralId,
        stationId: '12345',
      });

      mockReferralDetailGetApi({
        id: referralId,
        response,
      });

      cy.visit(`/my-health/appointments/schedule-referral?id=${referralId}`);
      cy.wait('@v2:get:referral:detail');

      scheduleReferral.validate();
      scheduleReferral.assertOnlineSchedulingNotAvailableAlert();
      cy.findByTestId('schedule-appointment-button').should('not.exist');

      cy.injectAxeThenAxeCheck();
      saveScreenshot(
        'vaos_ccDirectScheduling_scheduleReferral_invalidStationId',
      );
    });

    it('should display address alert when veteran address is not present', () => {
      const response = MockReferralDetailResponse.createSuccessResponse({
        id: referralId,
        referralNumber: referralId,
        veteranAddressPresent: false,
      });

      mockReferralDetailGetApi({
        id: referralId,
        response,
      });

      cy.visit(`/my-health/appointments/schedule-referral?id=${referralId}`);
      cy.wait('@v2:get:referral:detail');

      scheduleReferral.validate();

      cy.findByTestId('address-alert')
        .should('exist')
        .and('contain.text', 'Add a home address to schedule an appointment');

      cy.findByTestId('va-profile-link')
        .should('exist')
        .and('have.attr', 'href', '/profile');

      cy.findByTestId('schedule-appointment-button').should('not.exist');

      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_scheduleReferral_missingAddress');
    });
  });

  describe('API errors', () => {
    const errorCases = [
      { errorType: 'notFound', responseCode: 404 },
      { errorType: 'serverError', responseCode: 500 },
    ];

    errorCases.forEach(({ errorType, responseCode }) => {
      it(`should display an error message when referral detail API returns ${responseCode}`, () => {
        const response = new MockReferralDetailResponse({
          id: referralId,
          referralNumber: referralId,
          [errorType]: true,
        }).toJSON();

        mockReferralDetailGetApi({
          id: referralId,
          response,
          responseCode,
        });

        cy.visit(`/my-health/appointments/schedule-referral?id=${referralId}`);
        cy.wait('@v2:get:referral:detail');

        scheduleReferral.assertApiError();

        cy.injectAxeThenAxeCheck();
        saveScreenshot(
          `vaos_ccDirectScheduling_scheduleReferral_apiError_${errorType}`,
        );
      });
    });
  });
});
