import MedicationsSite from './med_site/MedicationsSite';
import RefillStatusPage from './pages/RefillStatusPage';
import inProgressPrescriptions from './fixtures/in-progress-prescriptions.json';

/**
 * Deep-clone fixture and set a recent completeDateTime on the shipped
 * medication so it falls within the window for shipped medications.
 */
const withRecentShippingDate = fixture => {
  const clone = JSON.parse(JSON.stringify(fixture));
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 3);
  const recentDateStr = recentDate.toISOString();
  const shippedRx = clone.data.find(
    rx =>
      rx.attributes.dispStatus === 'Active' &&
      rx.attributes.trackingList?.length > 0,
  );
  shippedRx.attributes.trackingList[0].completeDateTime = recentDateStr;
  shippedRx.attributes.trackingList[0].dateLoaded = recentDateStr;
  return clone;
};

describe('Refill Status page - successful data load', () => {
  it('displays medications in each process step', () => {
    const site = new MedicationsSite();
    site.loginWithManagementImprovements();

    const fixture = withRecentShippingDate(inProgressPrescriptions);
    const refillStatusPage = new RefillStatusPage();
    refillStatusPage.visitPage(fixture);
    cy.wait('@prescriptions');

    refillStatusPage.verifyHeading();
    refillStatusPage.verifyProcessListSteps();

    refillStatusPage.verifySubmittedPrescription(
      inProgressPrescriptions.data[0].attributes.prescriptionName,
    );

    refillStatusPage.verifyInProgressPrescription(
      inProgressPrescriptions.data[1].attributes.prescriptionName,
    );

    refillStatusPage.verifyShippedPrescription(
      inProgressPrescriptions.data[2].attributes.prescriptionName,
    );

    refillStatusPage.verifySubmittedPrescription(
      inProgressPrescriptions.data[3].attributes.prescriptionName,
    );

    refillStatusPage.verifyInProgressPrescription(
      inProgressPrescriptions.data[4].attributes.prescriptionName,
    );

    refillStatusPage.verifyPrescriptionNotInList(
      inProgressPrescriptions.data[5].attributes.prescriptionName,
    );

    refillStatusPage.verifyPrescriptionNotInList(
      inProgressPrescriptions.data[6].attributes.prescriptionName,
    );

    refillStatusPage.verifyNeedHelpSection();
    cy.injectAxe();
    cy.axeCheck('main');
  });
});
