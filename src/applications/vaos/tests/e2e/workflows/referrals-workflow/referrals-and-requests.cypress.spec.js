import {
  mockAppointmentsGetApi,
  mockFeatureToggles,
  mockVamcEhrApi,
  vaosSetup,
} from '../../vaos-cypress-helpers';
import {
  mockReferralDetailGetApi,
  mockReferralProvidersApi,
  mockReferralsGetApi,
  saveScreenshot,
} from './referrals-cypress-helpers';
import MockUser from '../../../fixtures/MockUser';
import MockAppointmentResponse from '../../../fixtures/MockAppointmentResponse';
import MockReferralDetailResponse from '../../../fixtures/MockReferralDetailResponse';
import MockReferralListResponse from '../../../fixtures/MockReferralListResponse';
import MockReferralProvidersResponse from '../../../fixtures/MockReferralProvidersResponse';
import { APPOINTMENT_STATUS } from '../../../../utils/constants';
import appointmentList from '../../page-objects/AppointmentList/AppointmentListPageObject';
import referralsAndRequests from '../../referrals/page-objects/ReferralsAndRequests';

// Fixed instant for appointment start times so test output is deterministic
// across runs. The fixture requires an actual Date instance — passing
// `Date()` (a string) would be silently ignored by MockAppointmentResponse
// and fall back to wall-clock time.
const APPOINTMENT_START = new Date('2025-01-15T10:00:00Z');

function navigateToReferralsAndRequests() {
  cy.visit('/my-health/appointments');
  cy.wait('@v2:get:appointments');
  appointmentList.clickReferralsAndRequestsLink();
  cy.wait('@v2:get:referrals');
}

describe('VAOS Referrals and Requests', () => {
  beforeEach(() => {
    mockFeatureToggles({
      vaOnlineSchedulingCCDirectScheduling: true,
      vaOnlineSchedulingFlatFacilityPage: true,
      vaOnlineSchedulingUseV2ApiRequests: true,
    });

    vaosSetup();
    mockVamcEhrApi();
    cy.login(new MockUser());
  });

  describe('Happy path - referrals and requests load', () => {
    it('should display referrals when there are referrals', () => {
      const appointmentResponse = new MockAppointmentResponse({
        cancellable: false,
        localStartTime: APPOINTMENT_START,
        status: APPOINTMENT_STATUS.booked,
      });
      mockAppointmentsGetApi({ response: [appointmentResponse] });

      const referralListResponse = {
        data: [
          MockReferralListResponse.createReferral({
            id: 'test-referral-1',
            categoryOfCare: 'PRIMARY CARE',
            referralNumber: 'VA0000001111',
          }),
          MockReferralListResponse.createReferral({
            id: 'test-referral-2',
            categoryOfCare: 'PRIMARY CARE',
            referralNumber: 'VA0000002222',
          }),
        ],
      };
      mockReferralsGetApi({ response: referralListResponse });

      navigateToReferralsAndRequests();

      referralsAndRequests.validatePageLoaded();
      referralsAndRequests.assertPendingReferrals({ count: 2 });
      referralsAndRequests.assertTypeOfCare({ typeOfCare: 'Primary Care' });

      cy.injectAxeThenAxeCheck();
      saveScreenshot(
        'vaos_ccDirectScheduling_referralsAndRequests_withReferrals',
      );
    });

    it('should display no referrals message when there are no referrals', () => {
      const appointmentResponse = new MockAppointmentResponse({
        cancellable: false,
        localStartTime: APPOINTMENT_START,
        status: APPOINTMENT_STATUS.booked,
      });
      mockAppointmentsGetApi({ response: [appointmentResponse] });
      mockReferralsGetApi({ response: { data: [] } });

      navigateToReferralsAndRequests();

      referralsAndRequests.validatePageLoaded();
      referralsAndRequests.assertPendingReferrals({ count: 0 });

      cy.injectAxeThenAxeCheck();
      saveScreenshot(
        'vaos_ccDirectScheduling_referralsAndRequests_noReferrals',
      );
    });

    it('should display pending and canceled appointment requests', () => {
      const pendingAppointment = new MockAppointmentResponse({
        pending: true,
        localStartTime: APPOINTMENT_START,
        status: APPOINTMENT_STATUS.proposed,
      });
      const canceledAppointment = new MockAppointmentResponse({
        pending: true,
        localStartTime: APPOINTMENT_START,
        status: APPOINTMENT_STATUS.cancelled,
      });
      mockAppointmentsGetApi({
        response: [pendingAppointment, canceledAppointment],
      });
      mockReferralsGetApi({ response: { data: [] } });

      navigateToReferralsAndRequests();

      referralsAndRequests.validatePageLoaded();

      cy.findByRole('heading', { level: 2, name: 'Active requests' }).should(
        'exist',
      );
      cy.findByRole('heading', {
        level: 2,
        name: 'Canceled requests',
      }).should('exist');

      cy.injectAxeThenAxeCheck();
      saveScreenshot(
        'vaos_ccDirectScheduling_referralsAndRequests_pendingAndCanceled',
      );
    });

    it('should display no appointment requests message when there are none', () => {
      mockAppointmentsGetApi({ response: [] });
      mockReferralsGetApi({ response: { data: [] } });

      cy.visit('/my-health/appointments/referrals-requests');
      cy.wait('@v2:get:referrals');

      referralsAndRequests.validatePageLoaded();

      cy.findByRole('heading', {
        level: 2,
        name: /You don\u2019t have any appointment requests/i,
      }).should('exist');

      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_referralsAndRequests_noRequests');
    });
  });

  describe('Downtime', () => {
    it('should display downtime message when community care service is down', () => {
      // Freeze time and bracket it with fixed start/end timestamps so the
      // maintenance window is deterministically active when the app evaluates
      // it.
      cy.clock(APPOINTMENT_START, ['Date']);

      cy.intercept('GET', '/v0/maintenance_windows', {
        data: [
          {
            id: '1',
            type: 'maintenance_windows',
            attributes: {
              externalService: 'community_care_ds',
              description: 'Community care is down',
              startTime: '2025-01-14T10:00:00Z',
              endTime: '2025-01-16T10:00:00Z',
            },
          },
        ],
      });

      const appointmentResponse = new MockAppointmentResponse({
        cancellable: false,
        localStartTime: APPOINTMENT_START,
        status: APPOINTMENT_STATUS.booked,
      });
      mockAppointmentsGetApi({ response: [appointmentResponse] });
      mockReferralsGetApi({ response: { data: [] } });

      navigateToReferralsAndRequests();

      referralsAndRequests.validatePageLoaded();

      cy.findByText(
        /We\u2019re working on community care referrals right now/i,
      ).should('exist');
      cy.findByText(
        /You can\u2019t access community care referrals right now/i,
      ).should('exist');

      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_referralsAndRequests_downtime');
    });
  });

  describe('Stale referral list data', () => {
    // When the referrals list is cached but a referral has since been booked
    // on another tab/session, clicking "Schedule an appointment" navigates to
    // the provider-selection page, which fetches the referral detail fresh.
    // If the fresh response shows the referral now has an appointment, the
    // provider-selection page redirects to ScheduleReferral
    const staleReferralId = 'stale-referral-1';

    it('should navigate to ScheduleReferral when fresh fetch reveals the referral was already booked', () => {
      mockAppointmentsGetApi({ response: [] });
      mockReferralsGetApi({
        response: {
          data: [
            MockReferralListResponse.createReferral({
              id: staleReferralId,
              categoryOfCare: 'PRIMARY CARE',
              referralNumber: 'VA0000009999',
              hasAppointments: false,
            }),
          ],
        },
      });
      mockReferralDetailGetApi({
        id: staleReferralId,
        response: MockReferralDetailResponse.createSuccessResponse({
          id: staleReferralId,
          referralNumber: 'VA0000009999',
          hasAppointments: true,
        }),
      });

      navigateToReferralsAndRequests();

      referralsAndRequests.validatePageLoaded();
      referralsAndRequests.assertPendingReferrals({ count: 1 });

      referralsAndRequests.selectReferral(0);
      cy.wait('@v2:get:referral:detail');

      cy.url().should(
        'include',
        `/my-health/appointments/schedule-referral?id=${staleReferralId}`,
      );
      cy.url().should('not.include', '/schedule-referral/provider-selection');

      cy.findByTestId('has-appointments-content').should('exist');
      cy.findByTestId('schedule-appointment-button').should('not.exist');
      cy.findByTestId('subtitle').should('not.exist');

      cy.injectAxeThenAxeCheck();
      saveScreenshot(
        'vaos_ccDirectScheduling_referralsAndRequests_staleReferral_redirectsToScheduleReferral',
      );
    });

    it('should proceed to provider-selection when fresh fetch confirms no appointment exists', () => {
      mockAppointmentsGetApi({ response: [] });
      mockReferralsGetApi({
        response: {
          data: [
            MockReferralListResponse.createReferral({
              id: staleReferralId,
              categoryOfCare: 'PRIMARY CARE',
              referralNumber: 'VA0000009999',
              hasAppointments: false,
            }),
          ],
        },
      });
      mockReferralDetailGetApi({
        id: staleReferralId,
        response: MockReferralDetailResponse.createSuccessResponse({
          id: staleReferralId,
          referralNumber: 'VA0000009999',
          hasAppointments: false,
        }),
      });
      mockReferralProvidersApi({
        response: MockReferralProvidersResponse.createSuccessResponse({
          page: 1,
          perPage: 5,
          totalEntries: 1,
        }),
      });

      navigateToReferralsAndRequests();
      referralsAndRequests.validatePageLoaded();
      referralsAndRequests.selectReferral(0);
      cy.wait('@v2:get:referral:detail');

      cy.url().should(
        'include',
        `/my-health/appointments/schedule-referral/provider-selection?id=${staleReferralId}`,
      );
      cy.injectAxeThenAxeCheck();
    });
  });

  describe('API errors', () => {
    it('should display error message when both referrals and appointments APIs fail', () => {
      mockAppointmentsGetApi({ response: null, responseCode: 500 });
      mockReferralsGetApi({ response: null, responseCode: 500 });

      navigateToReferralsAndRequests();

      referralsAndRequests.assertApiError();

      cy.injectAxeThenAxeCheck();
      saveScreenshot(
        'vaos_ccDirectScheduling_referralsAndRequests_bothApiErrors',
      );
    });

    it('should display referral error when only referrals API fails', () => {
      const appointmentResponse = new MockAppointmentResponse({
        cancellable: false,
        localStartTime: APPOINTMENT_START,
        status: APPOINTMENT_STATUS.booked,
      });
      mockAppointmentsGetApi({ response: [appointmentResponse] });
      mockReferralsGetApi({ response: null, responseCode: 500 });

      navigateToReferralsAndRequests();

      referralsAndRequests.validatePageLoaded();
      cy.findByText(
        /We\u2019re having trouble getting your community care referrals/i,
      ).should('exist');

      cy.injectAxeThenAxeCheck();
      saveScreenshot(
        'vaos_ccDirectScheduling_referralsAndRequests_referralApiError',
      );
    });

    it('should display requests error when only appointments API fails', () => {
      mockAppointmentsGetApi({ response: null, responseCode: 500 });

      const referralListResponse = {
        data: [
          MockReferralListResponse.createReferral({
            id: 'test-referral-1',
            categoryOfCare: 'PRIMARY CARE',
            referralNumber: 'VA0000001111',
          }),
        ],
      };
      mockReferralsGetApi({ response: referralListResponse });

      navigateToReferralsAndRequests();

      referralsAndRequests.validatePageLoaded();
      referralsAndRequests.assertPendingReferrals({ count: 1 });
      cy.findByText(/We\u2019re having trouble getting your requests/i).should(
        'exist',
      );

      cy.injectAxeThenAxeCheck();
      saveScreenshot(
        'vaos_ccDirectScheduling_referralsAndRequests_requestsApiError',
      );
    });
  });
});
