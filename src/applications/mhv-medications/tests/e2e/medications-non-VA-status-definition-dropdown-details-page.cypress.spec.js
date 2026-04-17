import MedicationsSite from './med_site/MedicationsSite';
import MedicationsListPage from './pages/MedicationsListPage';
import nonVARx from './fixtures/non-VA-prescription-on-list-page.json';
import MedicationsDetailsPage from './pages/MedicationsDetailsPage';
import rxList from './fixtures/listOfPrescriptions.json';
import { medicationsUrls, STATION_NUMBER_PARAM } from '../../util/constants';

describe('Medications Details Page NonVARx Status DropDown', () => {
  it('visits Medications Details Page Active NonVA Rx Status DropDown', () => {
    const site = new MedicationsSite();
    const listPage = new MedicationsListPage();
    const detailsPage = new MedicationsDetailsPage();
    const cardNumber = 5;
    site.login();
    listPage.visitMedicationsListPageURL(rxList);
    cy.injectAxe();
    cy.axeCheck('main');
    detailsPage.clickMedicationDetailsLink(nonVARx, cardNumber);
    detailsPage.verifyActiveNonVAStatusDisplayedOnDetailsPage('Active: Non-VA');
    detailsPage.clickWhatDoesThisStatusMeanDropDown();
    detailsPage.verifyNonVAStatusDropDownDefinition();
  });

  it('displays updated Non-VA status definition when MedicationsManagementImprovement flag is enabled', () => {
    const site = new MedicationsSite();
    const detailsPage = new MedicationsDetailsPage();
    site.loginWithManagementImprovements();
    const { prescriptionId } = nonVARx.data.attributes;
    const { stationNumber } = nonVARx.data.attributes;
    cy.intercept(
      'GET',
      `/my_health/v1/prescriptions/${prescriptionId}?*`,
      nonVARx,
    ).as('prescriptionDetails');
    cy.visit(
      `${
        medicationsUrls.PRESCRIPTION_DETAILS
      }/${prescriptionId}?${STATION_NUMBER_PARAM}=${stationNumber}`,
    );
    cy.wait('@prescriptionDetails');
    cy.injectAxe();
    cy.axeCheck('main');
    detailsPage.verifyActiveNonVAStatusDisplayedOnDetailsPage('Active: Non-VA');
    detailsPage.clickWhatDoesThisStatusMeanDropDown();
    detailsPage.verifyNonVAStatusDropDownDefinition(true);
  });
});
