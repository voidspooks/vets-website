import { mockFeatureToggles } from '../../vaos-cypress-helpers';
import {
  mockAppointmentDetailsApi,
  saveScreenshot,
} from './referrals-cypress-helpers';
import MockUser from '../../../fixtures/MockUser';
import MockReferralAppointmentDetailsResponse from '../../../fixtures/MockReferralAppointmentDetailsResponse';
import epsAppointmentDetails from '../../referrals/page-objects/EpsAppointmentDetails';

const appointmentId = 'EEKoGzEf';

describe('Referral Appointment Details', () => {
  beforeEach(() => {
    mockFeatureToggles({
      vaOnlineSchedulingCCDirectScheduling: true,
      vaOnlineSchedulingFlatFacilityPage: true,
      vaOnlineSchedulingUseV2ApiRequests: true,
    });

    cy.login(new MockUser());
  });

  describe('Happy path', () => {
    it('should display appointment details for a booked appointment', () => {
      const detailsResponse = MockReferralAppointmentDetailsResponse.createSuccessResponse(
        {
          appointmentId,
          status: 'booked',
        },
      );
      mockAppointmentDetailsApi({
        id: appointmentId,
        response: detailsResponse,
      });

      cy.visit(`/my-health/appointments/${appointmentId}?eps=true`);
      cy.wait('@v2:get:appointmentDetails');

      epsAppointmentDetails.validate();
      epsAppointmentDetails.assertProviderInfo();

      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_appointmentDetails_happy');
    });
  });

  describe('API errors', () => {
    const errorCases = [
      { errorType: 'notFound', responseCode: 404 },
      { errorType: 'serverError', responseCode: 500 },
    ];

    errorCases.forEach(({ errorType, responseCode }) => {
      it(`should display an error message when appointment details returns ${responseCode}`, () => {
        const appointmentDetailsResponse = new MockReferralAppointmentDetailsResponse(
          {
            appointmentId,
            [errorType]: true,
          },
        ).toJSON();
        mockAppointmentDetailsApi({
          id: appointmentId,
          response: appointmentDetailsResponse,
          responseCode,
        });

        cy.visit(`/my-health/appointments/${appointmentId}?eps=true`);
        cy.wait('@v2:get:appointmentDetails');

        epsAppointmentDetails.assertApiError();

        cy.injectAxeThenAxeCheck();
        saveScreenshot(
          `vaos_ccDirectScheduling_appointmentDetails_apiError_${errorType}`,
        );
      });
    });
  });
});
