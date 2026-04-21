import user from './fixtures/mocks/user.json';
import { setFeatureToggles } from './intercepts/feature-toggles';

const CLAIMANT_ID = 'claimant-123';
const CLAIMANT_OVERVIEW_PAGE = `/representative/find-claimant/claimant-overview/${CLAIMANT_ID}`;

Cypress.Commands.add('loginArpUser', () => {
  cy.intercept('GET', '**/accredited_representative_portal/v0/user', {
    statusCode: 200,
    body: user,
  }).as('fetchUser');

  cy.intercept('GET', '**authorize_as_representative', {
    statusCode: 200,
    body: user,
  }).as('authorizeAsRepresentative');
});

const setUpClaimantOverview = ({
  featureToggles,
  claimantOverviewResponse,
  claimantOverviewStatusCode = 200,
}) => {
  setFeatureToggles(featureToggles);

  cy.intercept(
    'GET',
    `**/accredited_representative_portal/v0/claimant/${CLAIMANT_ID}*`,
    {
      statusCode: claimantOverviewStatusCode,
      body: claimantOverviewResponse,
    },
  ).as('getClaimantOverview');

  cy.visit(CLAIMANT_OVERVIEW_PAGE);
  cy.wait('@getClaimantOverview');
  cy.injectAxeThenAxeCheck();
};

const featureToggles = {
  isAppEnabled: true,
  isInPilot: true,
  isClaimantDetailsEnabled: true,
};

/* eslint-disable camelcase */
const baseClaimantResponse = {
  data: {
    first_name: 'Jane',
    last_name: 'Doe',
    birth_date: '1980-01-15',
    ssn: '6789',
    phone: '5555551234',
    email: 'jane.doe@example.com',
    address: {
      line1: '123 main st',
      city: 'denver',
      state: 'co',
      zip: '80202',
    },
    representative_name: 'VFW',
    itf: [
      {
        type: 'compensation',
        creationDate: '2025-01-15',
        expirationDate: '2026-01-15',
      },
    ],
  },
};
/* eslint-enable camelcase */

describe('Accredited Representative Portal - Claimant Overview', () => {
  beforeEach(() => {
    cy.loginArpUser();
  });

  it('shows claimant overview when user has established POA for a claimant', () => {
    setUpClaimantOverview({
      featureToggles,
      claimantOverviewResponse: baseClaimantResponse,
    });

    cy.injectAxeThenAxeCheck();
    cy.contains('Claimant overview').should('exist');
    cy.contains('Doe, Jane').should('exist');
    cy.contains('Claimant information').should('exist');
    cy.contains('Representative information').should('exist');
    cy.contains('VFW').should('exist');
    cy.contains('Intent to file status').should('exist');
    cy.contains('Disability compensation (VA Form 21-526EZ)').should('exist');
  });

  it('shows pending request banner when claimant is represented and has a pending POA request', () => {
    /* eslint-disable camelcase */
    setUpClaimantOverview({
      featureToggles,
      claimantOverviewResponse: {
        data: {
          ...baseClaimantResponse.data,
          is_representative: true,
          poa_requests: [
            {
              id: 'pending-request-123',
              resolution: null,
            },
          ],
        },
      },
    });
    /* eslint-enable camelcase */

    cy.injectAxeThenAxeCheck();
    cy.contains('There is a pending representation request').should('exist');
  });

  it('shows no ITF message when user has established POA for a claimant without an established ITF', () => {
    setUpClaimantOverview({
      featureToggles,
      claimantOverviewResponse: {
        data: {
          ...baseClaimantResponse.data,
          itf: [],
        },
      },
    });

    cy.injectAxeThenAxeCheck();
    cy.contains('Intent to file status').should('exist');
    cy.contains('This claimant doesn’t have an intent to file.').should(
      'exist',
    );
    cy.contains('Submit online VA Form 21-0966').should('exist');
  });

  it('shows multiple ITF sections when user has established POA for a claimant with multiple established ITFs', () => {
    setUpClaimantOverview({
      featureToggles,
      claimantOverviewResponse: {
        data: {
          ...baseClaimantResponse.data,
          itf: [
            {
              type: 'compensation',
              creationDate: '2025-01-15',
              expirationDate: '2026-01-15',
            },
            {
              type: 'pension',
              creationDate: '2025-02-01',
              expirationDate: '2026-02-01',
            },
            {
              type: 'survivor',
              creationDate: '2025-03-01',
              expirationDate: '2026-03-01',
            },
          ],
        },
      },
    });

    cy.injectAxeThenAxeCheck();
    cy.contains('Disability compensation').should('exist');
    cy.contains('Pension').should('exist');
    cy.contains('Survivor').should('exist');
    cy.contains('Disability compensation (VA Form 21-526EZ)').should('exist');
    cy.contains('Pension (VA Form 21P-527EZ)').should('exist');
    cy.contains('Survivor benefits').should('exist');
  });

  it('shows warning icon and expires text when user has established POA for a claimant with expiring ITF', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    const expiringDate = soon.toISOString().split('T')[0];

    setUpClaimantOverview({
      featureToggles,
      claimantOverviewResponse: {
        data: {
          ...baseClaimantResponse.data,
          itf: [
            {
              type: 'compensation',
              creationDate: '2025-01-15',
              expirationDate: expiringDate,
            },
          ],
        },
      },
    });

    cy.injectAxeThenAxeCheck();
    cy.contains('Intent to file status').should('exist');
    cy.contains(/Expires in \d+ days/).should('exist');
    cy.get('va-icon[icon="warning"]').should('exist');
  });

  it('shows not represented state when user has no established POA for a claimant', () => {
    setUpClaimantOverview({
      featureToggles,
      claimantOverviewStatusCode: 403,
      claimantOverviewResponse: {
        errors: [{ detail: 'Forbidden' }],
      },
    });

    cy.injectAxeThenAxeCheck();
    cy.contains('Claimant not found').should('exist');
    cy.contains('You don’t represent this claimant').should('exist');
    cy.contains('Learn about establishing representation').should('exist');
    cy.contains('Find another claimant').should('exist');
  });
});
