import { PROFILE_PATHS } from '@@profile/constants';
import { mhvUser } from '@@profile/mocks/endpoints/user';
import mockFullName from '@@profile/tests/fixtures/full-name-success.json';
import mockPersonalInformation from '@@profile/tests/fixtures/personal-information-success.json';
import mockServiceHistory from '@@profile/tests/fixtures/service-history-success.json';
import mockDisabilityRating from '@@profile/tests/fixtures/disability-rating-success.json';
import mockStatusInfo from '@@profile/tests/fixtures/status-info.json';
import { mockFeatureToggles } from '@@profile/tests/e2e/helpers';

describe('PERSONAL INFORMATION SIGNATURE ALERT', () => {
  it('shows the relocation alert for messages signature', () => {
    cy.login(mhvUser);

    mockFeatureToggles();
    cy.intercept('GET', '/v0/user?*', {
      statusCode: 200,
      body: mhvUser,
    });
    cy.intercept('GET', 'v0/profile/full_name', mockFullName);
    cy.intercept(
      'GET',
      'v0/profile/personal_information',
      mockPersonalInformation,
    );
    cy.intercept('GET', 'v0/profile/service_history', mockServiceHistory);
    cy.intercept(
      'GET',
      'v0/disability_compensation_form/rating_info',
      mockDisabilityRating,
    );
    cy.intercept('GET', '/v0/profile/status/*', mockStatusInfo);
    cy.intercept('GET', '/v0/profile/direct_deposits', { data: {} });
    cy.intercept('GET', '/v0/profile/scheduling_preferences', {
      statusCode: 200,
      body: {
        data: {
          type: 'schedulingPreferences',
          attributes: {
            preferences: [],
          },
        },
      },
    });

    cy.visit(PROFILE_PATHS.PERSONAL_INFORMATION);

    cy.get('va-loading-indicator').should('not.exist');
    cy.findByRole('heading', { name: /Personal information/i }).should('exist');
    cy.contains(
      /Your health care messages signature has moved to your health care settings\./i,
    ).should('exist');
    cy.get(
      'va-link[href="/profile/health-care-settings/messages-signature"]',
    ).should('have.attr', 'text', 'Manage the signature on your messages');

    cy.injectAxeThenAxeCheck();
  });
});
