import {
  mockAppointmentsGetApi,
  mockFeatureToggles,
} from '../../vaos-cypress-helpers';
import {
  mockReferralDetailGetApi,
  mockProviderSlotsApi,
  mockUnifiedBookingApi,
  saveScreenshot,
} from './referrals-cypress-helpers';
import MockUser from '../../../fixtures/MockUser';
import MockAppointmentResponse from '../../../fixtures/MockAppointmentResponse';
import MockReferralDetailResponse from '../../../fixtures/MockReferralDetailResponse';
import MockReferralDraftAppointmentResponse from '../../../fixtures/MockReferralDraftAppointmentResponse';
import { APPOINTMENT_STATUS } from '../../../../utils/constants';
import reviewAndConfirm from '../../referrals/page-objects/ReviewAndConfirm';

const referralId = 'test-referral-uuid';
const providerId = 'provider-0';
const slotKey = `selected-slot-referral-${referralId}`;
const providerKey = `selected-provider-referral-${referralId}`;

describe('VAOS Review and Confirm', () => {
  let draftAppointmentResponse;

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

    draftAppointmentResponse = new MockReferralDraftAppointmentResponse({
      referralNumber: referralId,
    }).toJSON();
    mockProviderSlotsApi({ response: draftAppointmentResponse });

    cy.login(new MockUser());
  });

  function setSessionStorageAndVisit() {
    // Set sessionStorage values before visiting the page so ReviewAndConfirm
    // doesn't redirect back to scheduleReferral
    const slotStart = draftAppointmentResponse.data.attributes.slots[0].start;
    cy.window().then(win => {
      win.sessionStorage.setItem(slotKey, slotStart);
      win.sessionStorage.setItem(providerKey, providerId);
    });

    cy.visit(
      `/my-health/appointments/schedule-referral/review/?id=${referralId}&providerId=${providerId}`,
    );

    cy.wait('@v2:get:providerSlots');
  }

  describe('Happy path', () => {
    it('should display appointment details for review', () => {
      setSessionStorageAndVisit();

      reviewAndConfirm.validate();
      reviewAndConfirm.assertProviderInfo();
      reviewAndConfirm.assertDetailsSection({ modality: 'Phone' });
      reviewAndConfirm.assertDateTimeInfo();
      reviewAndConfirm.assertEditDateTimeLink();
      reviewAndConfirm.assertEditDetailsLink();

      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_reviewAndConfirm_happy');
    });
  });

  describe('Submission error - Community Care (CC)', () => {
    it('should display CC error alert when appointment creation fails', () => {
      mockUnifiedBookingApi({ response: null, responseCode: 500 });

      setSessionStorageAndVisit();

      reviewAndConfirm.validate();
      reviewAndConfirm.clickContinue();

      cy.wait('@v2:post:unifiedBooking');

      reviewAndConfirm.assertApiErrorAlert();

      cy.injectAxeThenAxeCheck();
      saveScreenshot(
        'vaos_ccDirectScheduling_reviewAndConfirm_submissionError_CC',
      );
    });
  });

  describe('Submission error - VA', () => {
    it('should display VA error alert when appointment creation fails', () => {
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

      const vaDraftResponse = new MockReferralDraftAppointmentResponse({
        referralNumber: referralId,
        careType: 'VA',
      }).toJSON();
      mockProviderSlotsApi({ response: vaDraftResponse });
      mockUnifiedBookingApi({ response: null, responseCode: 500 });

      // Use VA draft slots for sessionStorage
      draftAppointmentResponse = vaDraftResponse;
      setSessionStorageAndVisit();

      reviewAndConfirm.validate();
      reviewAndConfirm.clickContinue();

      cy.wait('@v2:post:unifiedBooking');

      reviewAndConfirm.assertApiErrorAlertVA();

      cy.injectAxeThenAxeCheck();
      saveScreenshot(
        'vaos_ccDirectScheduling_reviewAndConfirm_submissionError_VA',
      );
    });
  });

  describe('API errors - Community Care (CC)', () => {
    it('should display CC error when provider slots API fails', () => {
      mockProviderSlotsApi({ response: null, responseCode: 500 });

      const slotStart = draftAppointmentResponse.data.attributes.slots[0].start;
      cy.window().then(win => {
        win.sessionStorage.setItem(slotKey, slotStart);
        win.sessionStorage.setItem(providerKey, providerId);
      });

      cy.visit(
        `/my-health/appointments/schedule-referral/review/?id=${referralId}&providerId=${providerId}`,
      );

      cy.wait('@v2:get:providerSlots');

      cy.findByTestId('error').should('exist');
      cy.findByText(/We\u2019re sorry. We\u2019ve run into a problem/i).should(
        'exist',
      );

      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_reviewAndConfirm_apiError_CC');
    });
  });

  describe('API errors - VA', () => {
    it('should display VA error when provider slots API fails', () => {
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

      mockProviderSlotsApi({ response: null, responseCode: 500 });

      const slotStart = draftAppointmentResponse.data.attributes.slots[0].start;
      cy.window().then(win => {
        win.sessionStorage.setItem(slotKey, slotStart);
        win.sessionStorage.setItem(providerKey, providerId);
      });

      cy.visit(
        `/my-health/appointments/schedule-referral/review/?id=${referralId}&providerId=${providerId}`,
      );

      cy.wait('@v2:get:providerSlots');

      cy.findByTestId('error').should('exist');
      cy.findByText(/We\u2019re sorry. We\u2019ve run into a problem/i).should(
        'exist',
      );

      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_reviewAndConfirm_apiError_VA');
    });
  });
});
