import Timeouts from 'platform/testing/e2e/timeouts';
import {
  benefitSummaryOptions,
  mockUserData,
} from './e2e/fixtures/mocks/lh_letters';

describe('Foreign Medical Program (FMP) Letter', () => {
  const lettersPage = '/records/download-va-letters/letters/';
  const fmpLetterTitle = 'Foreign Medical Program Enrollment Letter';

  const lettersWithFMP = {
    fullName: 'William Shakespeare',
    letters: [
      { name: 'Commissary Letter', letterType: 'commissary' },
      { name: 'Proof of Service Letter', letterType: 'proof_of_service' },
      {
        name: 'Service Verification Letter',
        letterType: 'service_verification',
      },
      { name: 'Benefit Summary Letter', letterType: 'benefit_summary' },
      {
        name: 'Benefit Verification Letter',
        letterType: 'benefit_verification',
      },
      {
        name: fmpLetterTitle,
        letterType: 'foreign_medical_program',
      },
    ],
  };

  beforeEach(() => {
    // Enable FMP feature flag
    cy.intercept('GET', '/v0/feature_toggles*', {
      data: {
        type: 'feature_toggles',
        features: [
          {
            name: 'fmp_benefits_authorization_letter',
            value: true,
          },
        ],
      },
    });
    cy.intercept(
      'GET',
      '/v0/letters_generator/beneficiary',
      benefitSummaryOptions,
    );
    cy.intercept('GET', '/v0/letters_generator', lettersWithFMP);
    cy.login(mockUserData);
  });

  it('displays FMP letter in the list when feature flag is enabled', () => {
    cy.visit(lettersPage);
    cy.injectAxeThenAxeCheck();
    cy.get('[data-test-id="letters-accordion"]', { timeout: Timeouts.slow })
      .should('be.visible')
      .as('lettersAccordion');
    cy.contains('va-accordion-item', fmpLetterTitle).should('be.visible');
  });

  it('allows expanding the FMP letter accordion', () => {
    cy.visit(lettersPage);
    cy.injectAxeThenAxeCheck();
    cy.contains('va-accordion-item', fmpLetterTitle)
      .as('fmpAccordionItem')
      .shadow()
      .find('button[aria-expanded=false]')
      .should('be.visible')
      .click({ force: true });
    cy.get('@fmpAccordionItem')
      .shadow()
      .find('button[aria-expanded=true]')
      .should('exist');
    cy.injectAxeThenAxeCheck();
  });

  it('displays FMP letter content when expanded', () => {
    cy.visit(lettersPage);
    cy.contains('va-accordion-item', fmpLetterTitle)
      .as('fmpAccordionItem')
      .shadow()
      .find('button[aria-expanded=false]')
      .click({ force: true });
    cy.get('@fmpAccordionItem')
      .find('p')
      .should(
        'contain',
        'This letter confirms your enrollment in the Foreign Medical Program',
      );
    cy.injectAxeThenAxeCheck();
  });

  it('allows downloading the FMP letter', () => {
    cy.intercept(
      'POST',
      '/v0/letters_generator/download/foreign_medical_program',
      {
        fixture: './applications/letters/tests/e2e/fixtures/PDFs/test.txt',
      },
    ).as('fmpDownload');
    cy.visit(lettersPage);
    cy.contains('va-accordion-item', fmpLetterTitle)
      .as('fmpAccordionItem')
      .shadow()
      .find('button[aria-expanded=false]')
      .click({ force: true });
    cy.get('@fmpAccordionItem')
      .find('va-link[filetype="PDF"]')
      .should('be.visible')
      .click({ force: true });
    cy.wait('@fmpDownload', { timeout: Timeouts.slow });
    cy.injectAxeThenAxeCheck();
  });

  it('hides FMP letter when feature flag is disabled', () => {
    cy.intercept('GET', '/v0/feature_toggles*', {
      data: {
        type: 'feature_toggles',
        features: [
          {
            name: 'fmp_benefits_authorization_letter',
            value: false,
          },
        ],
      },
    });
    cy.visit(lettersPage);
    cy.injectAxeThenAxeCheck();
    cy.contains('va-accordion-item', fmpLetterTitle).should('not.exist');
  });
});
