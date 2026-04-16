import {
  mockAppointmentsGetApi,
  mockFeatureToggles,
} from '../../vaos-cypress-helpers';
import {
  mockReferralDetailGetApi,
  mockProviderSlotsApi,
  saveScreenshot,
} from './referrals-cypress-helpers';
import MockUser from '../../../fixtures/MockUser';
import MockAppointmentResponse from '../../../fixtures/MockAppointmentResponse';
import MockReferralDetailResponse from '../../../fixtures/MockReferralDetailResponse';
import MockReferralDraftAppointmentResponse from '../../../fixtures/MockReferralDraftAppointmentResponse';
import { APPOINTMENT_STATUS } from '../../../../utils/constants';
import chooseDateAndTime from '../../referrals/page-objects/ChooseDateAndTime';

const referralId = 'test-referral-uuid';
const providerId = 'provider-0';

describe('VAOS Choose Date and Time', () => {
  beforeEach(() => {
    mockFeatureToggles({
      vaOnlineSchedulingCCDirectScheduling: true,
      vaOnlineSchedulingFlatFacilityPage: true,
      vaOnlineSchedulingUseV2ApiRequests: true,
    });

    const referralResponse = MockReferralDetailResponse.createSuccessResponse({
      id: referralId,
      referralNumber: referralId,
    });
    mockReferralDetailGetApi({
      id: referralId,
      response: referralResponse,
    });

    const appointmentResponse = new MockAppointmentResponse({
      cancellable: false,
      localStartTime: Date(),
      status: APPOINTMENT_STATUS.booked,
    });
    mockAppointmentsGetApi({ response: [appointmentResponse] });

    cy.login(new MockUser());
  });

  describe('Happy path - Community Care (CC)', () => {
    it('should display the calendar with available appointment slots', () => {
      const draftAppointmentResponse = new MockReferralDraftAppointmentResponse(
        {
          referralNumber: referralId,
        },
      ).toJSON();
      mockProviderSlotsApi({ response: draftAppointmentResponse });

      cy.visit(
        `/my-health/appointments/schedule-referral/date-time/?id=${referralId}&providerId=${providerId}`,
      );

      cy.wait('@v2:get:providerSlots');

      chooseDateAndTime.validate();
      chooseDateAndTime.assertProviderInfo({
        providerName: 'Dr. Bones',
        organizationName: 'Meridian Health',
      });

      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_chooseDateAndTime_happy_CC');
    });
  });

  describe('Happy path - VA', () => {
    it('should display the calendar with provider clinic label for VA appointments', () => {
      const draftAppointmentResponse = new MockReferralDraftAppointmentResponse(
        {
          referralNumber: referralId,
          careType: 'VA',
        },
      ).toJSON();
      mockProviderSlotsApi({ response: draftAppointmentResponse });

      cy.visit(
        `/my-health/appointments/schedule-referral/date-time/?id=${referralId}&providerId=${providerId}`,
      );

      cy.wait('@v2:get:providerSlots');

      chooseDateAndTime.validate();
      cy.findByText(
        /Scheduling with Dr. Bones clinic at Meridian Health\./,
      ).should('exist');

      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_chooseDateAndTime_happy_VA');
    });
  });

  describe('No slots available - Community Care (CC)', () => {
    it('should display CC no slots alert when there are no available slots', () => {
      const draftAppointmentResponse = new MockReferralDraftAppointmentResponse(
        {
          referralNumber: referralId,
          noSlotsError: true,
        },
      ).toJSON();
      mockProviderSlotsApi({ response: draftAppointmentResponse });

      cy.visit(
        `/my-health/appointments/schedule-referral/date-time/?id=${referralId}&providerId=${providerId}`,
      );

      cy.wait('@v2:get:providerSlots');

      chooseDateAndTime.assertNoSlotsAvailableAlert();

      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_chooseDateAndTime_noSlots_CC');
    });
  });

  describe('No slots available - VA', () => {
    it('should display VA no slots alert when there are no available slots', () => {
      const draftAppointmentResponse = new MockReferralDraftAppointmentResponse(
        {
          referralNumber: referralId,
          careType: 'VA',
          noSlotsError: true,
        },
      ).toJSON();
      mockProviderSlotsApi({ response: draftAppointmentResponse });

      cy.visit(
        `/my-health/appointments/schedule-referral/date-time/?id=${referralId}&providerId=${providerId}`,
      );

      cy.wait('@v2:get:providerSlots');

      chooseDateAndTime.assertNoSlotsAvailableAlertVA();

      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_chooseDateAndTime_noSlots_VA');
    });
  });

  describe('API errors - Community Care (CC)', () => {
    const errorCases = [
      { errorType: 'notFound', responseCode: 404 },
      { errorType: 'serverError', responseCode: 500 },
    ];

    errorCases.forEach(({ errorType, responseCode }) => {
      it(`should display CC error message when provider slots API returns ${responseCode}`, () => {
        const errorResponse = new MockReferralDraftAppointmentResponse({
          referralNumber: referralId,
          [errorType]: true,
        }).toJSON();
        mockProviderSlotsApi({
          response: errorResponse,
          responseCode,
        });

        cy.visit(
          `/my-health/appointments/schedule-referral/date-time/?id=${referralId}&providerId=${providerId}`,
        );

        cy.wait('@v2:get:providerSlots');

        chooseDateAndTime.assertApiError();

        cy.injectAxeThenAxeCheck();
        saveScreenshot(
          `vaos_ccDirectScheduling_chooseDateAndTime_apiError_CC_${errorType}`,
        );
      });
    });
  });

  describe('API errors - VA', () => {
    const errorCases = [
      { errorType: 'notFound', responseCode: 404 },
      { errorType: 'serverError', responseCode: 500 },
    ];

    beforeEach(() => {
      const vaReferralResponse = MockReferralDetailResponse.createSuccessResponse(
        {
          id: referralId,
          referralNumber: referralId,
          careType: 'VA',
        },
      );
      mockReferralDetailGetApi({
        id: referralId,
        response: vaReferralResponse,
      });
    });

    errorCases.forEach(({ errorType, responseCode }) => {
      it(`should display VA error message when provider slots API returns ${responseCode}`, () => {
        const errorResponse = new MockReferralDraftAppointmentResponse({
          referralNumber: referralId,
          careType: 'VA',
          [errorType]: true,
        }).toJSON();
        mockProviderSlotsApi({
          response: errorResponse,
          responseCode,
        });

        cy.visit(
          `/my-health/appointments/schedule-referral/date-time/?id=${referralId}&providerId=${providerId}`,
        );

        cy.wait('@v2:get:providerSlots');

        chooseDateAndTime.assertApiErrorVA();

        cy.injectAxeThenAxeCheck();
        saveScreenshot(
          `vaos_ccDirectScheduling_chooseDateAndTime_apiError_VA_${errorType}`,
        );
      });
    });
  });
});
