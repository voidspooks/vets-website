import MedicationsSite from './med_site/MedicationsSite';
import RefillStatusPage from './pages/RefillStatusPage';

const errorResponse = {
  statusCode: 500,
  body: {
    errors: [
      {
        title: 'Internal server error',
        status: '500',
      },
    ],
  },
};

describe('Refill status page - API error', () => {
  it('displays an error notification when the prescriptions API fails', () => {
    const site = new MedicationsSite();
    site.loginWithManagementImprovements();

    const refillStatusPage = new RefillStatusPage();
    refillStatusPage.visitPageWithError(errorResponse);
    cy.wait('@prescriptionsError');

    refillStatusPage.verifyHeading();
    refillStatusPage.verifyApiErrorNotification();
    refillStatusPage.verifyNeedHelpSection();

    cy.injectAxe();
    cy.axeCheck('main');
  });
});
