import MedicationsSite from './med_site/MedicationsSite';
import pendingPrescriptions from './fixtures/pending-prescriptions-med-list.json';
import { Data } from './utils/constants';
import MedicationsListPage from './pages/MedicationsListPage';
import pendingRxDetails from './fixtures/pending-prescriptions-details.json';

describe('Medication History Page Pending New Rx (management improvements enabled)', () => {
  it('visits Medication History Page Pending New Prescriptions', () => {
    const site = new MedicationsSite();
    site.loginWithManagementImprovements();
    const listPage = new MedicationsListPage();

    listPage.visitMedicationHistoryPageURL(pendingPrescriptions);
    listPage.verifyPendingNewRxInfoTextOnMedicationCardOnListPage(
      Data.PENDING_RX_CARD_INFO,
    );
    listPage.verifyPrecriptionNumberForPendingRxOnMedicationCard(
      pendingRxDetails.data.attributes.prescriptionNumber,
      1,
    );
    cy.injectAxe();
    cy.axeCheck('main');
  });
});

describe('Medications List Page Pending New Rx (management improvements disabled)', () => {
  it('visits Medications List Page and does not show pending card copy', () => {
    const site = new MedicationsSite();
    const listPage = new MedicationsListPage();

    site.login();
    listPage.visitMedicationsListPageURL(pendingPrescriptions);
    cy.url().should('include', '/my-health/medications');
    cy.url().should('not.include', '/history');
    cy.get('[data-testid="pending-renewal-rx"]').should('not.exist');
    cy.injectAxe();
    cy.axeCheck('main');
  });
});
