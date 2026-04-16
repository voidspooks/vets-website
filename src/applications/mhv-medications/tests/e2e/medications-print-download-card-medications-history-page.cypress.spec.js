import MedicationsSite from './med_site/MedicationsSite';
import rxList from './fixtures/listOfPrescriptions.json';
import MedicationsListPage from './pages/MedicationsListPage';

describe('Medications List Page Print Download Card', () => {
  beforeEach(() => {
    const site = new MedicationsSite();
    const listPage = new MedicationsListPage();
    site.login();
    cy.intercept('GET', '/v0/feature_toggles*', {
      data: {
        type: 'feature_toggles',
        features: [
          { name: 'mhv_medications_management_improvements', value: true },
        ],
      },
    }).as('featureToggles');
    cy.intercept('GET', '/my_health/v1/prescriptions?*filter*', rxList).as(
      'filteredPrescriptions',
    );
    // Catch-all for export requests (print/PDF/TXT) which use V2 sort params
    cy.intercept('GET', '/my_health/v1/prescriptions?*sort*', rxList).as(
      'exportPrescriptions',
    );
    listPage.visitMedicationsListPageURL(rxList);
    cy.visit('/my-health/medications/list');
    cy.injectAxe();
  });

  it('should display the print or download toggle button', () => {
    cy.axeCheck('main');
    cy.findByTestId('print-records-button').should('exist');
    cy.findByTestId('print-records-button').should(
      'contain',
      'Print or download',
    );
  });

  it('should open the dropdown menu when toggle is clicked', () => {
    cy.axeCheck('main');
    cy.findByTestId('print-records-button').click();
    cy.findByTestId('print-download-list').should('be.visible');
  });

  it('should show Print option in dropdown', () => {
    cy.axeCheck('main');
    cy.findByTestId('print-records-button').click();
    cy.findByTestId('download-print-button').should('exist');
  });

  it('should show PDF download option in dropdown', () => {
    cy.axeCheck('main');
    cy.findByTestId('print-records-button').click();
    cy.findByTestId('download-pdf-button').should('exist');
  });

  it('should show TXT download option in dropdown', () => {
    cy.axeCheck('main');
    cy.findByTestId('print-records-button').click();
    cy.findByTestId('download-txt-button').should('exist');
  });

  it('should pass accessibility checks on print download component', () => {
    cy.axeCheck('main');
  });
});
