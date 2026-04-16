import { mockFeatureToggles } from '../../vaos-cypress-helpers';
import {
  mockReferralDetailGetApi,
  mockUnifiedBookingGetApi,
  mockAppointmentDetailsApiWithPolling,
  saveScreenshot,
} from './referrals-cypress-helpers';
import MockUser from '../../../fixtures/MockUser';
import MockReferralDetailResponse from '../../../fixtures/MockReferralDetailResponse';
import MockReferralAppointmentDetailsResponse from '../../../fixtures/MockReferralAppointmentDetailsResponse';
import completeReferral from '../../referrals/page-objects/CompleteReferral';

const referralId = 'test-referral-uuid';
const appointmentId = `appointment-for-${referralId}`;

// Provider type cases for parameterized tests
const providerTypes = [
  { providerType: 'eps', careType: 'CC', label: 'Community Care (eps)' },
  { providerType: 'va', careType: 'VA', label: 'VA (va)' },
];

describe('VAOS Complete Referral', () => {
  beforeEach(() => {
    mockFeatureToggles({
      vaOnlineSchedulingCCDirectScheduling: true,
      vaOnlineSchedulingFlatFacilityPage: true,
      vaOnlineSchedulingUseV2ApiRequests: true,
    });

    cy.login(new MockUser());
  });

  providerTypes.forEach(({ providerType, careType, label }) => {
    describe(`Happy path - ${label}`, () => {
      beforeEach(() => {
        const referralResponse = MockReferralDetailResponse.createSuccessResponse(
          {
            id: referralId,
            referralNumber: referralId,
            careType,
          },
        );
        mockReferralDetailGetApi({
          id: referralId,
          response: referralResponse,
        });
      });

      it(`should display the confirmed appointment when booked on the first poll (${providerType})`, () => {
        const bookedResponse = MockReferralAppointmentDetailsResponse.createSuccessResponse(
          {
            appointmentId,
            status: 'booked',
          },
        );
        mockUnifiedBookingGetApi({
          id: appointmentId,
          response: bookedResponse,
        });

        cy.visit(
          `/my-health/appointments/schedule-referral/complete/${appointmentId}?id=${referralId}&providerType=${providerType}`,
        );

        cy.wait('@v2:get:unifiedBooking');

        completeReferral.validate();
        completeReferral.assertAppointmentDetails();
        completeReferral.assertReferralsLink();

        if (providerType === 'eps') {
          completeReferral.assertCCAppointment();
        } else {
          completeReferral.assertVAAppointment();
        }

        cy.injectAxeThenAxeCheck();
        saveScreenshot(
          `vaos_ccDirectScheduling_completeReferral_happy_${providerType}`,
        );
      });
    });
  });

  providerTypes.forEach(({ providerType, careType, label }) => {
    describe(`Polling - ${label}`, () => {
      beforeEach(() => {
        const referralResponse = MockReferralDetailResponse.createSuccessResponse(
          {
            id: referralId,
            referralNumber: referralId,
            careType,
          },
        );
        mockReferralDetailGetApi({
          id: referralId,
          response: referralResponse,
        });
      });

      it(`should poll until the appointment transitions from proposed to booked (${providerType})`, () => {
        const proposedResponse = MockReferralAppointmentDetailsResponse.createSuccessResponse(
          {
            appointmentId,
            status: 'proposed',
          },
        );
        const bookedResponse = MockReferralAppointmentDetailsResponse.createSuccessResponse(
          {
            appointmentId,
            status: 'booked',
          },
        );

        // First 2 requests return "proposed", then switch to "booked".
        // The component polls on an interval of 1s until status === 'booked'.
        mockAppointmentDetailsApiWithPolling({
          id: appointmentId,
          firstResponse: proposedResponse,
          secondResponse: bookedResponse,
          switchAfterRequests: 2,
        });

        cy.visit(
          `/my-health/appointments/schedule-referral/complete/${appointmentId}?id=${referralId}&providerType=${providerType}`,
        );

        // While polling and the status is still proposed, the loading indicator
        // should be displayed. The message is rendered inside the
        // va-loading-indicator's shadow DOM, so we assert on the `message`
        // attribute rather than searching the DOM for the text directly.
        cy.findByTestId('loading')
          .should('exist')
          .and('have.attr', 'message')
          .and('match', /Confirming your appointment/i);

        // Polling fires every 1s, so three requests take ~3s; extend the wait
        // timeout to avoid flake.
        cy.wait('@v2:get:unifiedBooking:polling', { timeout: 10000 });
        cy.wait('@v2:get:unifiedBooking:polling', { timeout: 10000 });
        cy.wait('@v2:get:unifiedBooking:polling', { timeout: 10000 });

        completeReferral.validate();
        completeReferral.assertAppointmentDetails();

        cy.injectAxeThenAxeCheck();
        saveScreenshot(
          `vaos_ccDirectScheduling_completeReferral_polling_${providerType}`,
        );
      });

      it(`should display timeout warning when the appointment never becomes booked (${providerType})`, () => {
        const proposedResponse = MockReferralAppointmentDetailsResponse.createSuccessResponse(
          {
            appointmentId,
            status: 'proposed',
          },
        );

        // Always return "proposed" so the component polls until the 30s
        // timeout is hit and the warning alert is shown.
        mockUnifiedBookingGetApi({
          id: appointmentId,
          response: proposedResponse,
        });

        // Only override Date — not setTimeout/setInterval — so RTK Query's
        // polling interval keeps firing naturally. Advancing the mocked Date
        // forward with cy.tick() makes the component's elapsed-time check
        // (`Date.now() - startTime > TIMEOUT_MS`) fire on the next poll.
        //
        // Pin to a fixed instant so the test is deterministic across runs —
        // the component only uses elapsed time, not the absolute value, so
        // any fixed starting point works.
        cy.clock(new Date('2025-01-15T10:00:00Z'), ['Date']);

        cy.visit(
          `/my-health/appointments/schedule-referral/complete/${appointmentId}?id=${referralId}&providerType=${providerType}`,
        );

        cy.wait('@v2:get:unifiedBooking', { timeout: 10000 });

        // Advance the mocked Date past the 30s timeout. The next completed
        // poll will see elapsed time > TIMEOUT_MS and trigger setTimedOut(true).
        cy.tick(31000);

        // The component polls every 1s in real time. Once a poll response is
        // processed after the tick, Date.now() - startTime > TIMEOUT_MS and
        // the warning alert is rendered. Wait on the UI directly (rather than
        // on a specific request) with a generous timeout to tolerate CI
        // scheduling variability.
        cy.findByTestId('warning-alert', { timeout: 15000 }).should('exist');

        completeReferral.assertNotBookedError();

        cy.injectAxeThenAxeCheck();
        saveScreenshot(
          `vaos_ccDirectScheduling_completeReferral_timeout_${providerType}`,
        );
      });
    });
  });

  providerTypes.forEach(({ providerType, careType, label }) => {
    describe(`API errors - ${label}`, () => {
      const errorCases = [
        { errorType: 'notFound', responseCode: 404 },
        { errorType: 'serverError', responseCode: 500 },
      ];

      beforeEach(() => {
        const referralResponse = MockReferralDetailResponse.createSuccessResponse(
          {
            id: referralId,
            referralNumber: referralId,
            careType,
          },
        );
        mockReferralDetailGetApi({
          id: referralId,
          response: referralResponse,
        });
      });

      errorCases.forEach(({ errorType, responseCode }) => {
        it(`should display an error when unified booking API returns ${responseCode} (${providerType})`, () => {
          const errorResponse = new MockReferralAppointmentDetailsResponse({
            appointmentId,
            [errorType]: true,
          }).toJSON();
          mockUnifiedBookingGetApi({
            id: appointmentId,
            response: errorResponse,
            responseCode,
          });

          cy.visit(
            `/my-health/appointments/schedule-referral/complete/${appointmentId}?id=${referralId}&providerType=${providerType}`,
          );

          cy.wait('@v2:get:unifiedBooking');

          completeReferral.assertApiError();

          cy.injectAxeThenAxeCheck();
          saveScreenshot(
            `vaos_ccDirectScheduling_completeReferral_apiError_${providerType}_${errorType}`,
          );
        });
      });
    });
  });
});
