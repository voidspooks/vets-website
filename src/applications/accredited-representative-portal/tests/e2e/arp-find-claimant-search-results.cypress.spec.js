import user from './fixtures/mocks/user.json';
import { setFeatureToggles } from './intercepts/feature-toggles';

const vamcUser = {
  data: {
    nodeQuery: {
      count: 0,
      entities: [],
    },
  },
};

const FIND_CLAIMANT_PAGE = '/representative/find-claimant';

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

const setUpInterceptsAndVisit = ({
  featureToggles,
  claimantSearchResponse,
  claimantSearchStatusCode = 200,
}) => {
  cy.intercept('GET', '/data/cms/vamc-ehr.json', vamcUser).as('vamcUser');

  setFeatureToggles(featureToggles);

  cy.intercept(
    'POST',
    '**/accredited_representative_portal/v0/claimant/search',
    {
      statusCode: claimantSearchStatusCode,
      body: claimantSearchResponse,
    },
  ).as('claimantSearch');

  cy.visit(FIND_CLAIMANT_PAGE);
  cy.injectAxeThenAxeCheck();
};

const fillSearchForm = () => {
  cy.get('input[name="first_name"]', { timeout: 10000 }).type('Jane');
  cy.get('input[name="last_name"]', { timeout: 10000 }).type('Doe');

  cy.get('select[name="dobMonth"]', { timeout: 10000 }).select('1');
  cy.get('select[name="dobDay"]', { timeout: 10000 }).select('15');
  cy.get('input[name="dobYear"]', { timeout: 10000 }).type('1980');

  cy.get('va-text-input.masked-ssn', { timeout: 10000 })
    .should('have.class', 'hydrated')
    .shadow()
    .find('input')
    .type('123456789');
};

describe('Accredited Representative Portal - Find Claimant Search Results', () => {
  const featureToggles = {
    isAppEnabled: true,
    isInPilot: true,
    isClaimantDetailsEnabled: true,
  };

  beforeEach(() => {
    cy.loginArpUser();
  });

  describe('when claimant details feature toggle is enabled', () => {
    it('shows represented claimant search result', () => {
      setUpInterceptsAndVisit({
        featureToggles,
        claimantSearchResponse: {
          data: {
            id: 'claimant-123',
            firstName: 'Jane',
            lastName: 'Doe',
            city: 'Denver',
            state: 'CO',
            postalCode: '80202',
            representative: 'VFW',
            hasPendingPoaRequest: false,
            poaRequests: [],
          },
        },
      });

      fillSearchForm();
      cy.contains('button', 'Search').click();
      cy.wait('@claimantSearch');
      cy.injectAxeThenAxeCheck();

      cy.findByTestId('representation-requests-table-fetcher-poa-requests')
        .should('contain.text', 'Showing result for')
        .and('contain.text', 'Jane')
        .and('contain.text', 'Doe')
        .and('contain.text', '***-**-6789');

      cy.get('.claimant__name').should('contain.text', 'Doe, Jane');
      cy.contains('Representative:').should('exist');
      cy.contains('VFW').should('exist');

      cy.get(
        'va-link-action[href="/representative/find-claimant/claimant-overview/claimant-123"]',
      )
        .should('exist')
        .and('have.attr', 'text', 'Go to the claimant overview');
    });

    it('shows No POA / No Results Found state', () => {
      setUpInterceptsAndVisit({
        featureToggles,
        claimantSearchStatusCode: 404,
        claimantSearchResponse: {
          errors: [{ detail: 'Claimant not found' }],
        },
      });

      fillSearchForm();
      cy.contains('button', 'Search').click();
      cy.wait('@claimantSearch');
      cy.injectAxeThenAxeCheck();

      cy.findByTestId('representation-requests-table-fetcher-no-poa-requests')
        .should('contain.text', 'No result found for')
        .and('contain.text', 'Jane')
        .and('contain.text', 'Doe')
        .and('contain.text', '***-**-6789');
    });

    it('shows No POA / Pending request search result', () => {
      setUpInterceptsAndVisit({
        featureToggles,
        claimantSearchResponse: {
          data: {
            id: 'claimant-456',
            firstName: 'Jane',
            lastName: 'Doe',
            city: 'Denver',
            state: 'CO',
            postalCode: '80202',
            representative: null,
            hasPendingPoaRequest: true,
            poaRequests: [
              {
                id: 'req-1',
                canAccept: true,
              },
            ],
          },
        },
      });

      fillSearchForm();
      cy.contains('button', 'Search').click();
      cy.wait('@claimantSearch');
      cy.injectAxeThenAxeCheck();

      cy.findByTestId('representation-requests-table-fetcher-poa-requests')
        .should('contain.text', 'Showing result for')
        .and('contain.text', 'Jane')
        .and('contain.text', 'Doe')
        .and('contain.text', '***-**-6789');

      cy.contains('You do not have POA for this claimant.').should('exist');
    });
  });
});
