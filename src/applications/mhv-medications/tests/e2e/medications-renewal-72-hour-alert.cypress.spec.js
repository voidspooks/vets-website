import MedicationsSite from './med_site/MedicationsSite';
import MedicationsListPage from './pages/MedicationsListPage';
import rxList from './fixtures/listOfPrescriptions.json';

describe('Medications Renewal 72-Hour Alert appears on expected med cards on List Page', () => {
  const recentTimestamp = Date.now() - 24 * 60 * 60 * 1000; // 1 day ago
  const oldTimestamp = Date.now() - 96 * 60 * 60 * 1000; // 4 days ago

  const buildRxList = (overrides = {}) => {
    const baseRx = {
      ...rxList.data[0],
      attributes: {
        ...rxList.data[0].attributes,
        dispStatus: 'Active',
        refillStatus: 'active',
        refillRemaining: 0,
        isRefillable: false,
        isRenewable: true,
        isTrackable: false,
        prescriptionSource: 'RX',
        expirationDate: '2027-07-19T04:00:00.000Z',
        rxRfRecords: [],
        trackingList: [],
        renewalSubmittedTimestamp: null,
        ...overrides,
      },
    };
    return {
      ...rxList,
      data: [baseRx],
      meta: {
        ...rxList.meta,
        pagination: { ...rxList.meta.pagination, totalEntries: 1 },
      },
    };
  };

  const setupWithFlags = (prescriptions, { sm = true } = {}) => {
    const site = new MedicationsSite();
    const listPage = new MedicationsListPage();

    site.login({
      featureToggles: {
        mhvSecureMessagingMedicationsRenewalRequest: sm,
        mhvMedicationsCernerPilot: false,
        mhvMedicationsV2StatusMapping: false,
        mhvMedicationsOracleHealthCutover: false,
      },
    });

    listPage.visitMedicationsListPageURL(prescriptions);
    return { site, listPage };
  };

  describe('when showSecureMessagingRenewalRequest is ON', () => {
    it('shows the recently renewed alert when Active with no refills and timestamp is within 72 hours', () => {
      const prescriptions = buildRxList({
        renewalSubmittedTimestamp: recentTimestamp,
      });
      setupWithFlags(prescriptions);

      cy.get('[data-testid="rx-details-refill-alert"]').should('exist');
      cy.get('[data-testid="rx-details-refill-alert"]').should(
        'contain',
        'You may have already requested a renewal',
      );
      cy.get('[data-testid="no-refills-left-alert"]').should('not.exist');
      cy.injectAxe();
      cy.axeCheck('main');
    });

    it('shows the recently renewed alert for Expired renewable prescription within 72 hours', () => {
      const prescriptions = buildRxList({
        dispStatus: 'Expired',
        refillStatus: 'expired',
        renewalSubmittedTimestamp: recentTimestamp,
      });
      setupWithFlags(prescriptions);

      cy.get('[data-testid="rx-details-refill-alert"]').should('exist');
      cy.get('[data-testid="rx-details-refill-alert"]').should(
        'contain',
        'You may have already requested a renewal',
      );
      cy.get('[data-testid="no-refills-left-alert"]').should('not.exist');
      cy.injectAxe();
      cy.axeCheck('main');
    });

    it('shows a link to sent messages inside the alert', () => {
      const prescriptions = buildRxList({
        renewalSubmittedTimestamp: recentTimestamp,
      });
      setupWithFlags(prescriptions);

      cy.get('[data-testid="go-to-sent-messages-alert-link"]')
        .should('exist')
        .shadow()
        .find('a')
        .should('have.attr', 'href')
        .and('include', '/my-health/secure-messages/sent/');
      cy.injectAxe();
      cy.axeCheck('main');
    });

    it('does not show the recently renewed alert when timestamp is older than 72 hours', () => {
      const prescriptions = buildRxList({
        renewalSubmittedTimestamp: oldTimestamp,
      });
      setupWithFlags(prescriptions);

      cy.get('[data-testid="rx-details-refill-alert"]').should('not.exist');
      cy.injectAxe();
      cy.axeCheck('main');
    });

    it('does not show the recently renewed alert when timestamp is null', () => {
      const prescriptions = buildRxList({ renewalSubmittedTimestamp: null });
      setupWithFlags(prescriptions);

      cy.get('[data-testid="rx-details-refill-alert"]').should('not.exist');
      cy.injectAxe();
      cy.axeCheck('main');
    });

    it('does not show the recently renewed alert for Non-VA prescription', () => {
      const prescriptions = buildRxList({
        prescriptionSource: 'NV',
        renewalSubmittedTimestamp: recentTimestamp,
      });
      setupWithFlags(prescriptions);

      cy.get('[data-testid="rx-details-refill-alert"]').should('not.exist');
      cy.injectAxe();
      cy.axeCheck('main');
    });

    it('does not show the recently renewed alert when prescription has refills remaining', () => {
      const prescriptions = buildRxList({
        refillRemaining: 3,
        renewalSubmittedTimestamp: recentTimestamp,
      });
      setupWithFlags(prescriptions);

      cy.get('[data-testid="rx-details-refill-alert"]').should('not.exist');
      cy.injectAxe();
      cy.axeCheck('main');
    });
  });

  describe('when showSecureMessagingRenewalRequest is OFF', () => {
    it('does not show the recently renewed alert even with a recent timestamp', () => {
      const prescriptions = buildRxList({
        renewalSubmittedTimestamp: recentTimestamp,
      });
      setupWithFlags(prescriptions, { sm: false });

      cy.get('[data-testid="rx-details-refill-alert"]').should('not.exist');
      cy.injectAxe();
      cy.axeCheck('main');
    });
  });
});
