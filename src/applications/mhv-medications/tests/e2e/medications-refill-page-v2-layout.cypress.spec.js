import MedicationsSite from './med_site/MedicationsSite';
import MedicationsRefillPage from './pages/MedicationsRefillPage';
import prescriptions from './fixtures/listOfPrescriptions.json';
import emptyPrescriptions from './fixtures/empty-prescriptions-list.json';

describe('Medications Refill Page V2 Layout', () => {
  it('visits Medications Refill Page V2 and verifies page title and layout', () => {
    const site = new MedicationsSite();
    const refillPage = new MedicationsRefillPage();

    site.loginWithManagementImprovements();
    refillPage.loadRefillPageV2(prescriptions);
    cy.injectAxe();
    cy.axeCheck('main');
    refillPage.verifyRefillPageTitleV2();
    refillPage.verifyRefillPageSubtitleV2();
    refillPage.verifyRenewableMedsLinkV2();
  });

  it('visits Medications Refill Page V2 and verifies updated process step guide', () => {
    const site = new MedicationsSite();
    const refillPage = new MedicationsRefillPage();

    site.loginWithManagementImprovements();
    refillPage.loadRefillPageV2(prescriptions);
    cy.injectAxe();
    cy.axeCheck('main');
    refillPage.verifyProcessStepOneContentV2();
    refillPage.verifyProcessStepThreeContentV2();
  });

  it('visits Medications Refill Page V2 with no refillable prescriptions and verifies renewable meds link is visible', () => {
    const site = new MedicationsSite();
    const refillPage = new MedicationsRefillPage();

    site.loginWithManagementImprovements();
    refillPage.loadRefillPageV2(emptyPrescriptions);
    cy.injectAxe();
    cy.axeCheck('main');
    refillPage.verifyNoMedicationsAvailableMessageOnRefillPage();
    refillPage.verifyRenewableMedsLinkV2NoRefills();
  });
});
