import {
  mockAppointmentsGetApi,
  mockFeatureToggles,
  mockVamcEhrApi,
  vaosSetup,
} from '../../vaos-cypress-helpers';
import {
  mockReferralsGetApi,
  saveScreenshot,
} from './referrals-cypress-helpers';
import MockUser from '../../../fixtures/MockUser';
import MockAppointmentResponse from '../../../fixtures/MockAppointmentResponse';
import MockReferralListResponse from '../../../fixtures/MockReferralListResponse';
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
      // Bracket the real "now" so the maintenance window is active when the
      // app evaluates it. These values aren't displayed — they only gate the
      // downtime branch — so relative-to-now is the right shape here.
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const startTime = new Date(Date.now() - ONE_DAY_MS);
      const endTime = new Date(Date.now() + ONE_DAY_MS);

      cy.intercept('GET', '/v0/maintenance_windows', {
        data: [
          {
            id: '1',
            type: 'maintenance_windows',
            attributes: {
              externalService: 'community_care_ds',
              description: 'Community care is down',
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
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
