import MedicationsSite from './med_site/MedicationsSite';
import MedicationsListPage from './pages/MedicationsListPage';
import rxList from './fixtures/listOfPrescriptions.json';

describe('Medication List page', () => {
  const site = new MedicationsSite();

  beforeEach(() => {
    site.login();
  });

  it('renders page not found when feature flag is false', () => {
    const listPage = new MedicationsListPage();

    listPage.visitPage();
    cy.findByTestId('mhv-page-not-found');
    cy.injectAxeThenAxeCheck();
  });

  it('renders the medication list page when feature flag is true', () => {
    const listPage = new MedicationsListPage();

    site.loginWithManagementImprovements();
    listPage.visitPageWithPrescriptions(rxList);
    listPage.verifyHeading();
    cy.injectAxeThenAxeCheck();
  });

  it('displays navigation links, medications list, and sort dropdown', () => {
    const listPage = new MedicationsListPage();
    site.loginWithManagementImprovements();
    listPage.visitPageWithPrescriptions(rxList);
    listPage.verifyHeading();
    listPage.verifyRefillStatusLink();
    listPage.verifyRefillLink();
    listPage.verifyMedicationsListVisible();
    listPage.verifySortDropdownVisible();
    listPage.verifyMedicationCardVisible();
    listPage.verifyPageTotalInfo(1, 10, 29);
    cy.injectAxeThenAxeCheck();
  });

  it('displays Need Help section with management improvements links', () => {
    const listPage = new MedicationsListPage();
    site.loginWithManagementImprovements();
    listPage.visitPageWithPrescriptions(rxList);
    listPage.verifyNeedHelpSection();
    listPage.verifyNeedHelpManagingMedsLink();
    cy.injectAxeThenAxeCheck();
  });

  it('displays Medication Resources section with management improvements links', () => {
    const listPage = new MedicationsListPage();
    site.loginWithManagementImprovements();
    listPage.visitPageWithPrescriptions(rxList);
    listPage.verifyMedicationResourcesSection();
    listPage.verifyMedicationResourcesOrderSuppliesLink();
    listPage.verifyMedicationResourcesSeiLink();
    listPage.verifyMedicationResourcesNotificationSettingsLink();
    listPage.verifyMedicationResourcesAllergiesLink();
    cy.injectAxeThenAxeCheck();
  });

  it('displays error notification when prescriptions API fails', () => {
    const listPage = new MedicationsListPage();
    site.loginWithManagementImprovements();
    listPage.visitPageWithApiError();
    listPage.verifyHeading();
    listPage.verifyApiErrorNotification();
    cy.injectAxeThenAxeCheck();
  });

  it('displays empty list message when no medications exist', () => {
    const listPage = new MedicationsListPage();
    site.loginWithManagementImprovements();
    listPage.visitPageWithEmptyList();
    listPage.verifyHeading();
    listPage.verifyEmptyListMessage();
    cy.injectAxeThenAxeCheck();
  });
});
