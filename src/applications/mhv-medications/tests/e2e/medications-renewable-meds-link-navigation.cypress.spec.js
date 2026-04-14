import MedicationsSite from './med_site/MedicationsSite';
import MedicationsRefillPage from './pages/MedicationsRefillPage';
import prescriptions from './fixtures/listOfPrescriptions.json';
import emptyPrescriptions from './fixtures/empty-prescriptions-list.json';
import renewRx from './fixtures/filter-prescriptions.json';
import allergies from './fixtures/allergies.json';

describe('Medications Refill Page - Renewable Meds Link Navigation', () => {
  it('navigates to history page with RENEWAL filter when clicking renewable meds link', () => {
    const site = new MedicationsSite();
    const refillPage = new MedicationsRefillPage();

    site.loginWithManagementImprovements();
    refillPage.loadRefillPageV2(prescriptions);

    cy.injectAxe();
    cy.axeCheck('main');

    // Verify the link exists
    refillPage.verifyRenewableMedsLinkV2();

    // Set up intercepts for history page navigation
    // Use broad pattern to catch the prescriptions list request
    cy.intercept('GET', /\/my_health\/v1\/prescriptions\?.*/, renewRx).as(
      'prescriptionsList',
    );
    cy.intercept('GET', '/my_health/v1/medical_records/allergies', allergies);

    // Click the renewable meds link
    refillPage.clickRenewableMedsLinkV2();

    // Wait for the prescriptions request triggered by navigation
    cy.wait('@prescriptionsList');

    // Verify navigation to history page
    cy.url().should('include', '/history');

    // Verify the RENEWAL filter is active by checking the radio button state.
    // The onClick handler dispatches setFilterOption('RENEWAL') to Redux before navigation,
    // which the history page reads on mount to pre-select the filter.
    cy.get('[data-testid="medication-history-filter-option-RENEWAL"]').should(
      'have.attr',
      'checked',
    );
  });

  it('navigates to history page with RENEWAL filter when clicking renewable meds link (no refills case)', () => {
    const site = new MedicationsSite();
    const refillPage = new MedicationsRefillPage();

    site.loginWithManagementImprovements();
    refillPage.loadRefillPageV2(emptyPrescriptions);

    cy.injectAxe();
    cy.axeCheck('main');

    // Verify the link exists in the no-refills state
    refillPage.verifyRenewableMedsLinkV2NoRefills();

    // Set up intercepts for history page navigation
    cy.intercept('GET', /\/my_health\/v1\/prescriptions\?.*/, renewRx).as(
      'prescriptionsList',
    );
    cy.intercept('GET', '/my_health/v1/medical_records/allergies', allergies);

    // Click the renewable meds link (no-refills variant)
    refillPage.clickRenewableMedsLinkV2NoRefills();

    // Wait for the prescriptions request triggered by navigation
    cy.wait('@prescriptionsList');

    // Verify navigation to history page
    cy.url().should('include', '/history');

    // Verify the RENEWAL filter is active
    cy.get('[data-testid="medication-history-filter-option-RENEWAL"]').should(
      'have.attr',
      'checked',
    );
  });
});
