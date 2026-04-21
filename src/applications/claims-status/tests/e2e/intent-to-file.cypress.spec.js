import {
  mockClaimsEndpoint,
  mockAppealsEndpoint,
  mockFeatureToggles,
  mockStemEndpoint,
  mockIntentsToFileEndpoint,
} from './support/helpers/mocks';
import { verifyTitleBreadcrumbsHeading } from './support/helpers/assertions';
import { assertDataLayerEvent } from './analytics-helpers';
import { CST_HOME_H1, INTENT_TO_FILE_PATH } from '../../constants';

const ITF_PAGE_URL = `/track-claims/${INTENT_TO_FILE_PATH}`;

const setupItfPage = ({
  cstIntentsToFile = true,
  itfs = [],
  itfStatusCode = 200,
} = {}) => {
  mockFeatureToggles({ cstIntentsToFile });
  mockClaimsEndpoint();
  mockAppealsEndpoint();
  mockStemEndpoint();
  mockIntentsToFileEndpoint(itfs, itfStatusCode);
  cy.login();
  cy.visit(ITF_PAGE_URL);
  cy.injectAxe();
};

const buildMockItfs = () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const eightMonthsAgo = new Date(now);
  eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8);
  const sixMonthsFromNow = new Date(now);
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  const fourMonthsFromNow = new Date(now);
  fourMonthsFromNow.setMonth(fourMonthsFromNow.getMonth() + 4);

  return [
    {
      id: '2',
      type: 'pension',
      creationDate: sixMonthsAgo.toISOString(),
      expirationDate: sixMonthsFromNow.toISOString(),
      status: 'active',
    },
    {
      id: '1',
      type: 'compensation',
      creationDate: eightMonthsAgo.toISOString(),
      expirationDate: fourMonthsFromNow.toISOString(),
      status: 'active',
    },
  ];
};

describe('Intent to File - List Page', () => {
  context('when cstIntentsToFile feature toggle is enabled', () => {
    context('with empty ITF response', () => {
      beforeEach(() => {
        setupItfPage();
      });

      it('should have correct page title, breadcrumbs, and heading', () => {
        verifyTitleBreadcrumbsHeading({
          title: 'Your Intents To File | Veterans Affairs',
          thirdBreadcrumb: {
            name: 'Your intents to file',
            href: '#content',
          },
          heading: { name: 'Your intents to file' },
        });

        cy.axeCheck();
      });

      it('should display the empty state for intents to file on record', () => {
        cy.findByRole('heading', {
          name: 'Intents to file on record',
          level: 2,
        });

        cy.findByText(
          /We don.t have any intents to file on record for you in our system\./,
        );

        cy.axeCheck();
      });

      it('should display the correct text sections', () => {
        cy.findByRole('heading', {
          name: 'Start a new intent to file',
          level: 2,
        }).should('be.visible');

        cy.findByRole('heading', {
          name: /Why can.t I find my intent to file\?/,
          level: 2,
        }).should('be.visible');

        cy.findByRole('heading', {
          name: 'What is an intent to file?',
          level: 2,
        }).should('be.visible');

        cy.axeCheck();
      });
    });

    context('with populated ITF response', () => {
      beforeEach(() => {
        setupItfPage({ itfs: buildMockItfs() });
      });

      it('should display ITF cards sorted by creation date', () => {
        cy.get('va-card').should('have.length', 2);
        cy.get('va-card')
          .first()
          .should('contain.text', 'Disability compensation');
        cy.get('va-card')
          .last()
          .should('contain.text', 'Pension');

        cy.axeCheck();
      });

      it('should not display the empty state text', () => {
        cy.get('va-card').should('have.length', 2);
        cy.findByText(
          /We don.t have any intents to file on record for you/,
        ).should('not.exist');

        cy.axeCheck();
      });
    });

    context('with server error', () => {
      beforeEach(() => {
        setupItfPage({ itfStatusCode: 500 });
      });

      it('should display the error alert', () => {
        cy.get('va-alert[status="warning"]').should('exist');
        cy.contains(/We can.t access your intents to file right now/);

        cy.axeCheck();
      });

      it('should not display cards or empty state', () => {
        cy.get('va-alert[status="warning"]').should('exist');
        cy.get('va-card').should('not.exist');
        cy.findByText(
          /We don.t have any intents to file on record for you/,
        ).should('not.exist');

        cy.axeCheck();
      });
    });
  });

  context('analytics', () => {
    it('should record a successful claims-itf-status event when ITFs load', () => {
      setupItfPage({ itfs: buildMockItfs() });

      cy.get('va-card').should('have.length', 2);

      assertDataLayerEvent('claims-itf-status', [
        'event',
        'api-name',
        'api-status',
        'api-latency-ms',
        'error-key',
        'itf-none',
        'itf-expiring-count',
        'itf-not-expiring-count',
      ]);

      cy.axeCheck();
    });

    it('should record a failed claims-itf-status event on server error', () => {
      setupItfPage({ itfStatusCode: 500 });

      cy.get('va-alert[status="warning"]').should('exist');

      assertDataLayerEvent('claims-itf-status', [
        'event',
        'api-name',
        'api-status',
        'api-latency-ms',
        'error-key',
        'itf-none',
        'itf-expiring-count',
        'itf-not-expiring-count',
      ]);

      cy.axeCheck();
    });
  });

  context('when cstIntentsToFile feature toggle is disabled', () => {
    it('should redirect to the claims index page', () => {
      setupItfPage({ cstIntentsToFile: false });

      cy.url().should('include', '/your-claims');
      cy.url().should('not.include', '/intent-to-file');

      cy.findByRole('heading', {
        name: CST_HOME_H1,
        level: 1,
      });

      cy.axeCheck();
    });
  });
});
