import {
  mockAppointmentsGetApi,
  mockFeatureToggles,
  mockVamcEhrApi,
  vaosSetup,
} from '../../vaos-cypress-helpers';
import {
  mockReferralsGetApi,
  mockReferralDetailGetApi,
  mockReferralProvidersApiPaginated,
  mockProviderSlotsApi,
  mockUnifiedBookingApi,
  mockAppointmentDetailsApiWithPolling,
  saveScreenshot,
} from './referrals-cypress-helpers';
import MockUser from '../../../fixtures/MockUser';
import MockAppointmentResponse from '../../../fixtures/MockAppointmentResponse';
import MockReferralDetailResponse from '../../../fixtures/MockReferralDetailResponse';
import MockReferralProvidersResponse from '../../../fixtures/MockReferralProvidersResponse';
import MockReferralDraftAppointmentResponse from '../../../fixtures/MockReferralDraftAppointmentResponse';
import MockReferralAppointmentDetailsResponse from '../../../fixtures/MockReferralAppointmentDetailsResponse';
import { APPOINTMENT_STATUS } from '../../../../utils/constants';
import appointmentList from '../../page-objects/AppointmentList/AppointmentListPageObject';
import referralsAndRequests from '../../referrals/page-objects/ReferralsAndRequests';
import scheduleReferral from '../../referrals/page-objects/ScheduleReferral';
import providerSelection from '../../referrals/page-objects/ProviderSelection';
import chooseDateAndTime from '../../referrals/page-objects/ChooseDateAndTime';
import reviewAndConfirm from '../../referrals/page-objects/ReviewAndConfirm';
import completeReferral from '../../referrals/page-objects/CompleteReferral';

const referralId = 'add2f0f4-a1ea-4dea-a504-a54ab57c68';
const appointmentId = `appointment-for-${referralId}`;
const referralListResponse = {
  data: [
    {
      id: referralId,
      type: 'referrals',
      attributes: {
        expirationDate: '2027-01-01',
        uuid: referralId,
        categoryOfCare: 'PRIMARY CARE',
        careType: 'CC',
        referralNumber: 'VA0000005681',
        referralConsultId: '12345',
        stationId: '534',
        onlineSchedule: true,
        hasAppointments: false,
      },
    },
  ],
};

const referralDetailResponse = MockReferralDetailResponse.createSuccessResponse(
  {
    id: referralId,
    referralNumber: 'VA0000005681',
    categoryOfCare: 'PRIMARY CARE',
  },
);

const providersPage1 = MockReferralProvidersResponse.createSuccessResponse({
  page: 1,
  perPage: 5,
  totalEntries: 5,
});

function setupBookingMocks() {
  const draftAppointmentResponse = new MockReferralDraftAppointmentResponse({
    referralNumber: referralId,
  }).toJSON();
  mockProviderSlotsApi({ response: draftAppointmentResponse });
}

function setupConfirmationMocks() {
  const createAppointmentResponse = {
    data: {
      id: appointmentId,
      type: 'appointments',
      attributes: {
        id: appointmentId,
        status: 'booked',
      },
    },
  };
  mockUnifiedBookingApi({ response: createAppointmentResponse });

  const pendingDetailsResponse = MockReferralAppointmentDetailsResponse.createSuccessResponse(
    {
      appointmentId,
      status: 'proposed',
    },
  );
  const bookedDetailsResponse = MockReferralAppointmentDetailsResponse.createSuccessResponse(
    {
      appointmentId,
      status: 'booked',
    },
  );
  mockAppointmentDetailsApiWithPolling({
    id: appointmentId,
    firstResponse: pendingDetailsResponse,
    secondResponse: bookedDetailsResponse,
    switchAfterRequests: 1,
  });
}

function navigateToReferralsAndRequests() {
  cy.visit('/my-health/appointments');
  cy.wait('@v2:get:appointments');
  appointmentList.validateCCReferralsDisabledBanner({ exist: false });
  cy.findByTestId('review-requests-and-referrals').should('exist');
  cy.injectAxeThenAxeCheck();

  mockReferralsGetApi({ response: referralListResponse });
  appointmentList.clickReferralsAndRequestsLink();
  cy.wait('@v2:get:referrals');

  referralsAndRequests.validatePageLoaded();
  referralsAndRequests.assertPendingReferrals({ count: 1 });
  referralsAndRequests.assertTypeOfCare({ typeOfCare: 'PRIMARY CARE' });
  cy.injectAxeThenAxeCheck();
}

function completeSchedulingFlow(screenshotPrefix) {
  // Choose date/time
  chooseDateAndTime.validate();
  chooseDateAndTime.assertProviderInfo({
    providerName: 'Dr. Bones',
    organizationName: 'Meridian Health',
  });
  // cy.injectAxeThenAxeCheck();
  saveScreenshot(
    `vaos_ccDirectScheduling_${screenshotPrefix}_chooseDateAndTime`,
  );

  chooseDateAndTime.selectNextMonth();
  chooseDateAndTime.selectAppointmentSlot(0);
  chooseDateAndTime.clickContinue();

  // Review and confirm
  reviewAndConfirm.validate();
  reviewAndConfirm.assertProviderInfo();
  reviewAndConfirm.assertDetailsSection({ modality: 'Phone' });
  reviewAndConfirm.assertDateTimeInfo();
  reviewAndConfirm.assertEditDateTimeLink();
  cy.injectAxeThenAxeCheck();
  saveScreenshot(
    `vaos_ccDirectScheduling_${screenshotPrefix}_reviewAndConfirm`,
  );

  // Confirm the appointment
  setupConfirmationMocks();
  reviewAndConfirm.clickContinue();
  cy.wait('@v2:post:unifiedBooking');

  // Verify completion page
  completeReferral.validate();
  completeReferral.assertAppointmentDetails();
  cy.injectAxeThenAxeCheck();
  saveScreenshot(`vaos_ccDirectScheduling_${screenshotPrefix}_complete`);
}

describe('VAOS Referral Online Schedule', () => {
  beforeEach(() => {
    mockFeatureToggles({
      vaOnlineSchedulingCCDirectScheduling: true,
      vaOnlineSchedulingFlatFacilityPage: true,
      vaOnlineSchedulingUseV2ApiRequests: true,
      vaOnlineSchedulingCCDirectSchedulingV2: true,
    });

    const appointmentResponse = new MockAppointmentResponse({
      cancellable: false,
      localStartTime: Date(),
      status: APPOINTMENT_STATUS.booked,
    });
    mockAppointmentsGetApi({ response: [appointmentResponse] });

    vaosSetup();
    mockVamcEhrApi();
    cy.login(new MockUser());
  });

  describe('Direct to provider selection', () => {
    it('should complete scheduling via the "Schedule an appointment" action link', () => {
      navigateToReferralsAndRequests();
      saveScreenshot('vaos_ccDirectScheduling_direct_referralsAndRequests');

      // Click "Schedule an appointment" which skips referral details
      mockReferralDetailGetApi({
        id: referralId,
        response: referralDetailResponse,
      });
      mockReferralProvidersApiPaginated({
        referralId,
        responses: { '1': providersPage1 },
      });

      referralsAndRequests.selectReferral(0);
      cy.wait('@v2:get:referral:providers');

      providerSelection.validate();
      providerSelection.assertProviderCards(5);
      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_direct_providerSelection');

      // Select provider
      setupBookingMocks();
      providerSelection.clickProviderLink(0);
      cy.wait('@v2:get:providerSlots');

      completeSchedulingFlow('direct');
    });
  });

  describe('Via referral details page', () => {
    it('should complete scheduling via the referral title link and details page', () => {
      navigateToReferralsAndRequests();
      saveScreenshot('vaos_ccDirectScheduling_details_referralsAndRequests');

      // Click the referral title link to view referral details
      mockReferralDetailGetApi({
        id: referralId,
        response: referralDetailResponse,
      });

      cy.findAllByTestId('appointment-list-item')
        .eq(0)
        .within(() => {
          cy.get('va-link[text*="referral"]').click({
            waitForAnimations: true,
          });
        });
      cy.wait('@v2:get:referral:detail');

      // Verify referral details page
      scheduleReferral.validate();
      scheduleReferral.assertReferralDetails();
      scheduleReferral.assertCommonQuestions();
      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_details_scheduleReferral');

      // Click "Schedule appointment" to go to provider selection
      mockReferralProvidersApiPaginated({
        referralId,
        responses: { '1': providersPage1 },
      });

      scheduleReferral.clickScheduleAppointment();
      cy.wait('@v2:get:referral:providers');

      providerSelection.validate();
      providerSelection.assertProviderCards(5);
      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_details_providerSelection');

      // Select provider
      setupBookingMocks();
      providerSelection.clickProviderLink(0);
      cy.wait('@v2:get:providerSlots');

      completeSchedulingFlow('details');
    });
  });
});
