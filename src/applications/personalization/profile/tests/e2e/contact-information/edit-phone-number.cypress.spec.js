import { PROFILE_PATHS } from '@@profile/constants';
import mockUser from '@@profile/tests/fixtures/users/user-36.json';
import { generateFeatureToggles } from '@@profile/mocks/endpoints/feature-toggles';
import phoneNumber from '@@profile/mocks/endpoints/phone-number';

const setup = ({ profileInternationalPhoneNumbers = false }) => {
  cy.viewportPreset('va-top-mobile-1');
  cy.intercept(
    'GET',
    '/v0/feature_toggles*',
    generateFeatureToggles({ profileInternationalPhoneNumbers }),
  );

  cy.login(mockUser);

  cy.intercept('GET', '/v0/user*', {
    delay: 2000,
    body: mockUser,
  }).as('getUser');

  cy.intercept('PUT', '/v0/profile/telephones', {
    body: phoneNumber.transactions.received,
  }).as('updatePhoneNumber');

  cy.intercept(
    'GET',
    '/v0/profile/status/*',
    phoneNumber.transactions.successful,
  ).as('updatePhoneNumberStatus');

  cy.visit(PROFILE_PATHS.CONTACT_INFORMATION);

  cy.get('va-loading-indicator')
    .should('exist')
    .should('have.attr', 'message', 'Loading your information...');

  cy.wait('@getUser');
  cy.get('va-loading-indicator').should('not.exist');
};

const openEditForm = numberName => {
  cy.get(`va-button[label="Edit ${numberName}"]`).click({
    waitForAnimations: true,
  });
  cy.get('va-text-input')
    .should('exist')
    .and('be.visible');
};

const selectCountry = countryName => {
  // Open combo-box dropdown, type to filter, then select
  cy.get('va-telephone-input')
    .shadow()
    .find('va-combo-box')
    .shadow()
    .find('input.usa-combo-box__input')
    .as('countryInput');

  cy.get('@countryInput').clear({ force: true });
  cy.get('@countryInput').type(countryName, { force: true, delay: 30 });

  // Select the matching option from the filtered list
  cy.get('va-telephone-input')
    .shadow()
    .find('va-combo-box')
    .shadow()
    .find('li[role="option"]')
    .contains(countryName)
    .click({ force: true });
};

const typePhoneNumber = digits => {
  cy.get('va-telephone-input')
    .shadow()
    .find('va-text-input')
    .shadow()
    .find('input#inputField')
    .focus()
    .clear({ force: true })
    .type(digits, { force: true, delay: 30 });
};

const typeDomesticPhoneNumber = digits => {
  cy.get('va-text-input[name="root_inputPhoneNumber"]')
    .shadow()
    .find('input#inputField')
    .focus()
    .clear({ force: true })
    .type(digits, { force: true, delay: 30 });
};

const typeExtension = value => {
  cy.get('va-text-input[label="Extension (6 digits maximum)"]')
    .shadow()
    .find('input')
    .focus()
    .clear({ force: true });
  if (value) {
    cy.get('va-text-input[label="Extension (6 digits maximum)"]')
      .shadow()
      .find('input')
      .type(value, { force: true, delay: 30 });
  }
};

const clickSave = () => {
  cy.intercept('GET', '/v0/user*', mockUser).as('getUserAfterUpdate');
  cy.get('[data-testid="save-edit-button"]').click({
    waitForAnimations: true,
  });
};

const waitForSaveSuccess = () => {
  cy.wait('@updatePhoneNumber');
  cy.wait('@updatePhoneNumberStatus');
  cy.wait('@getUserAfterUpdate');
  cy.findByTestId('update-success-alert').should('exist');
  cy.contains('Update saved').should('exist');
};

describe('Profile - Contact Information - editing phone numbers', () => {
  it('should allow updating a domestic phone number', () => {
    setup({ profileInternationalPhoneNumbers: false });
    openEditForm('Home phone number');

    typeDomesticPhoneNumber('5551234567');
    typeExtension('321');

    clickSave();
    waitForSaveSuccess();
    cy.injectAxeThenAxeCheck();
  });

  it.skip('should allow updating an international phone number', () => {
    setup({ profileInternationalPhoneNumbers: true });
    openEditForm('Work phone number');

    selectCountry('France');
    typePhoneNumber('0123456789');

    clickSave();
    waitForSaveSuccess();
    cy.injectAxeThenAxeCheck();
  });

  it.skip('should allow updating an international mobile phone number', () => {
    setup({ profileInternationalPhoneNumbers: true });
    openEditForm('Mobile phone number');

    selectCountry('United Kingdom');
    typePhoneNumber('2079460958');

    // International mobile numbers show a warning modal; confirm it
    cy.get('va-modal', { timeout: 5000 }).should('exist');
    cy.get('va-modal')
      .find('va-button[text="Yes, save my number"]')
      .click({ force: true });

    waitForSaveSuccess();
    cy.injectAxeThenAxeCheck();
  });

  it('should prevent saving an invalid phone number', () => {
    setup({ profileInternationalPhoneNumbers: false });
    openEditForm('Home phone number');

    typeDomesticPhoneNumber('55512345678'); // 11 digits - invalid US number

    // Blur the input so the component marks the field as touched
    cy.get('va-text-input[name="root_inputPhoneNumber"]')
      .shadow()
      .find('input#inputField')
      .blur();

    clickSave();

    cy.get('va-text-input[name="root_inputPhoneNumber"]').should(
      'have.attr',
      'error',
      'Enter a 10-digit phone number (with or without dashes)',
    );
    cy.contains('Update saved').should('not.exist');
    cy.injectAxeThenAxeCheck();
  });
});
