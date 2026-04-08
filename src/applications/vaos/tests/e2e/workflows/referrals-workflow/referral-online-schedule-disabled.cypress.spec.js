import { mockFeatureToggles } from '../../vaos-cypress-helpers';
import {
  mockReferralDetailGetApi,
  saveScreenshot,
} from './referrals-cypress-helpers';
import MockUser from '../../../fixtures/MockUser';
import MockReferralDetailResponse from '../../../fixtures/MockReferralDetailResponse';
import scheduleReferral from '../../referrals/page-objects/ScheduleReferral';

describe('Referral - Online Schedule Disabled', () => {
  const referralId = 'online-schedule-false';

  beforeEach(() => {
    mockFeatureToggles({
      vaOnlineSchedulingCCDirectScheduling: true,
      vaOnlineSchedulingFlatFacilityPage: true,
      vaOnlineSchedulingUseV2ApiRequests: true,
    });
    cy.login(new MockUser());
  });

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
    saveScreenshot('vaos_ccDirectScheduling_onlineScheduleDisabled');
  });
});
