import MedicationsSite from './med_site/MedicationsSite';
import RefillStatusPage from './pages/RefillStatusPage';

describe('Refill status page', () => {
  const site = new MedicationsSite();

  beforeEach(() => {
    site.login();
  });

  it('renders page not found when feature flag is false', () => {
    const refillStatusPage = new RefillStatusPage();

    refillStatusPage.visitPage();
    cy.findByTestId('mhv-page-not-found');
    cy.injectAxeThenAxeCheck();
  });

  it('renders the refill status page when feature flag is true', () => {
    cy.intercept('GET', '/v0/feature_toggles?*', {
      data: {
        type: 'feature_toggles',
        features: [
          {
            name: 'mhv_medications_management_improvements',
            value: true,
          },
        ],
      },
    }).as('featureToggles');

    const refillStatusPage = new RefillStatusPage();

    refillStatusPage.visitPage();
    refillStatusPage.verifyHeading();
    cy.injectAxeThenAxeCheck();
  });
});
