import MedicationsSite from './med_site/MedicationsSite';
import pendingPrescriptions from './fixtures/pending-prescriptions-med-list.json';
import { Data } from './utils/constants';
import MedicationsListPage from './pages/MedicationsListPage';
import pendingRenewalRxDetails from './fixtures/pending-prescriptions-for-renewal.json';

describe('Medication History Page Pending Rx Renew (management improvements enabled)', () => {
  it('visits Medication History Page Pending Prescriptions Renewal', () => {
    const site = new MedicationsSite();
    const listPage = new MedicationsListPage();
    site.loginWithManagementImprovements();
    listPage.visitMedicationHistoryPageURL(pendingPrescriptions);
    listPage.verifyPendingRenewalInfoTextOnMedicationCardOnListPage(
      Data.PENDING_RENEW_TEXT,
    );
    listPage.verifyPrecriptionNumberForPendingRxOnMedicationCard(
      pendingRenewalRxDetails.data.attributes.prescriptionNumber,
      4,
    );
    cy.injectAxe();
    cy.axeCheck('main');
  });
});

describe('Medications List Page Pending Rx Renew (management improvements disabled)', () => {
  it('visits Medications List Page and does not show pending renewal card copy', () => {
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
