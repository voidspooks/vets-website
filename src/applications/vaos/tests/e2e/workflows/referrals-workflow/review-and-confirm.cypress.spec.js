import {
  mockAppointmentsGetApi,
  mockFeatureToggles,
} from '../../vaos-cypress-helpers';
import {
  mockReferralDetailGetApi,
  mockReferralProvidersApi,
  mockProviderSlotsApi,
  mockUnifiedBookingApi,
  navigateFromProviderSelectionToDateTime,
  saveScreenshot,
} from './referrals-cypress-helpers';
import MockUser from '../../../fixtures/MockUser';
import MockAppointmentResponse from '../../../fixtures/MockAppointmentResponse';
import MockReferralDetailResponse from '../../../fixtures/MockReferralDetailResponse';
import MockReferralDraftAppointmentResponse from '../../../fixtures/MockReferralDraftAppointmentResponse';
import MockReferralProvidersResponse from '../../../fixtures/MockReferralProvidersResponse';
import { APPOINTMENT_STATUS } from '../../../../utils/constants';
import chooseDateAndTime from '../../referrals/page-objects/ChooseDateAndTime';
import reviewAndConfirm from '../../referrals/page-objects/ReviewAndConfirm';

const referralId = 'test-referral-uuid';

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

    cy.login(new MockUser());
  });

  function navigateToReviewAfterChoosingSlot({
    providerMode,
    draftResponse = draftAppointmentResponse,
  }) {
    const providersResponse = MockReferralProvidersResponse.createSuccessResponse(
      {
        page: 1,
        perPage: 5,
        totalEntries: 5,
        providerMode,
      },
    );
    mockReferralProvidersApi({ response: providersResponse });
    mockProviderSlotsApi({ response: draftResponse });
    navigateFromProviderSelectionToDateTime({ referralId });
    chooseDateAndTime.selectNextMonth();
    chooseDateAndTime.selectAppointmentSlot(0);
    chooseDateAndTime.clickContinue();
  }

  describe('Happy path', () => {
    it('should display appointment details for review', () => {
      navigateToReviewAfterChoosingSlot({ providerMode: 'cc' });

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

      navigateToReviewAfterChoosingSlot({ providerMode: 'cc' });

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
      mockUnifiedBookingApi({ response: null, responseCode: 500 });

      navigateToReviewAfterChoosingSlot({
        providerMode: 'va',
        draftResponse: vaDraftResponse,
      });

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
});
