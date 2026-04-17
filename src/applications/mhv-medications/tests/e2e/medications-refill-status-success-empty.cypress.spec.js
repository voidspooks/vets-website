import MedicationsSite from './med_site/MedicationsSite';
import RefillStatusPage from './pages/RefillStatusPage';
import inProgressPrescriptions from './fixtures/in-progress-prescriptions.json';

describe('Refill Status page - successful data load (empty view)', () => {
  it('displays the empty view when there are no in-progress medications', () => {
    const site = new MedicationsSite();
    site.loginWithManagementImprovements();

    const emptyData = JSON.parse(JSON.stringify(inProgressPrescriptions));

    emptyData.data = [];
    emptyData.meta = {
      totalPages: 0,
      totalEntries: 0,
      ...emptyData.meta,
    };

    const refillStatusPage = new RefillStatusPage();
    refillStatusPage.visitPage(emptyData);
    cy.wait('@prescriptions');

    refillStatusPage.verifyHeading();
    refillStatusPage.verifyEmptyViewProcessListSteps();
    refillStatusPage.verifyNeedHelpSection();

    cy.injectAxe();
    cy.axeCheck('main');
  });
});
