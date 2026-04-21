import { PROFILE_PATHS } from '@@profile/constants';
import mockUser from '@@profile/tests/fixtures/users/user-36.json';
import {
  mockFeatureToggles,
  mockGETEndpoints,
} from '@@profile/tests/e2e/helpers';

const setup = () => {
  cy.viewportPreset('va-top-mobile-1');

  cy.login(mockUser);

  mockGETEndpoints([
    'v0/mhv_account',
    'v0/profile/full_name',
    'v0/profile/status',
    'v0/profile/personal_information',
    'v0/profile/service_history',
    'v0/profile/direct_deposits',
  ]);

  mockFeatureToggles(() => ({
    data: {
      type: 'feature_toggles',
      features: [
        {
          name: 'profile_international_phone_numbers',
          value: true,
        },
        {
          name: 'profileInternationalPhoneNumbers',
          value: true,
        },
      ],
    },
  }));

  cy.intercept('GET', '/v0/user?*', {
    statusCode: 200,
    body: mockUser,
  });

  cy.visit(PROFILE_PATHS.CONTACT_INFORMATION);
  cy.get('va-loading-indicator').should('not.exist');
};

describe('International mobile phone number editing', () => {
  it('shows the inline text-notification warning for international mobile numbers', () => {
    setup();

    cy.get('va-button[label="Edit Mobile phone number"]').click({
      force: true,
    });

    cy.contains(
      'Enter a U.S. mobile phone number to receive text notifications. We can’t send text notifications to international numbers.',
    ).should('be.visible');

    cy.get('va-combo-box')
      .should('exist')
      .as('countryCodeInput');
    cy.get('va-telephone-input[label="Mobile phone number"]')
      .should('exist')
      .as('mobilePhoneInput');

    cy.get('@countryCodeInput').then($comboBox => {
      cy.selectVaComboBox($comboBox, 'AF');
    });

    cy.get('@mobilePhoneInput').then($telephoneInput => {
      cy.fillVaTelephoneInput($telephoneInput, {
        contact: '201234567',
      });
    });

    cy.get('@countryCodeInput')
      .shadow()
      .find('input')
      .should('have.value', 'Afghanistan +93');

    cy.get('@mobilePhoneInput')
      .shadow()
      .find('input#inputField')
      .should('have.value', '201234567');

    cy.injectAxeThenAxeCheck();
  });
});
