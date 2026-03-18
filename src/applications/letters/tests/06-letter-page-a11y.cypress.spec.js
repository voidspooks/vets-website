import Timeouts from 'platform/testing/e2e/timeouts';
import {
  letters,
  benefitSummaryOptions,
  address,
  countries,
  states,
  mockUserData,
} from './e2e/fixtures/mocks/lh_letters';

describe('Letter page accessibility', () => {
  const lettersPage = '/records/download-va-letters/letters/';

  beforeEach(() => {
    cy.intercept('GET', '/v0/feature_toggles*', {
      data: {
        type: 'feature_toggles',
        features: [
          {
            name: 'fmp_benefits_authorization_letter',
            value: true,
          },
          {
            name: 'tsa_safe_travel_letter',
            value: false,
          },
        ],
      },
    });
    cy.intercept('GET', '/v0/letters_generator', letters).as('letters');
    cy.intercept(
      'GET',
      '/v0/letters_generator/beneficiary',
      benefitSummaryOptions,
    );
    cy.intercept('GET', '/v0/address', address);
    cy.intercept('GET', '/v0/address/countries', countries);
    cy.intercept('GET', '/v0/address/states', states);

    cy.login(mockUserData);
    cy.visit(lettersPage);
    cy.wait('@letters', { timeout: Timeouts.slow });
  });

  it('passes accessibility checks on initial render', () => {
    cy.contains('h2', 'Verify your mailing address').should('be.visible');
    cy.contains('h2', 'Benefit letters and documents').should('be.visible');
    cy.get('[data-test-id="letters-accordion"]', {
      timeout: Timeouts.slow,
    }).should('be.visible');

    cy.injectAxeThenAxeCheck();
  });

  it('passes accessibility checks after opening letter details', () => {
    cy.get('[data-test-id="letters-accordion"] va-accordion-item')
      .first()
      .shadow()
      .find('button[aria-expanded]')
      .click({ force: true });

    cy.injectAxeThenAxeCheck();
  });
});
