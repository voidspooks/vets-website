import path from 'path';

import testForm from 'platform/testing/e2e/cypress/support/form-tester';
import { createTestConfig } from 'platform/testing/e2e/cypress/support/form-tester/utilities';

import {
  fillTextWebComponent,
  reviewAndSubmitPageFlow,
} from '../../../shared/tests/e2e/helpers';
import featureToggles from '../../../shared/tests/e2e/fixtures/mocks/feature-toggles.json';
import mockSubmit from '../../../shared/tests/e2e/fixtures/mocks/application-submit.json';

import formConfig from '../../config/form';
import manifest from '../../manifest.json';

// disable custom scroll-n-focus to minimize interference with input-fills
formConfig.useCustomScrollAndFocus = false;

const v3StepHeaderSelector =
  'va-segmented-progress-bar[heading-text][header-level="2"]';
const awaitFocusSelectorThenTest = () => {
  return ({ afterHook }) => {
    cy.injectAxeThenAxeCheck();
    afterHook(() => {
      cy.get(v3StepHeaderSelector)
        .should('be.visible')
        .then(() => {
          cy.fillPage();
          cy.axeCheck();
          cy.findByText(/continue/i, { selector: 'button' }).click();
        });
    });
  };
};

// Use actual paths from formConfig to avoid mismatches
const pagePaths = [
  'veteran-personal-information',
  'identification-information',
  'supporting-documentation',
  'request-type',
  'applicant-personal-information',
  'applicant-address',
  'applicant-contact-information',
  'certificates',
  'additional-certificates-yes-no',
  'additional-certificates-request',
];

const pageTestConfigs = pagePaths.reduce((obj, pagePath) => {
  return {
    ...obj,
    [pagePath]: awaitFocusSelectorThenTest(),
  };
}, {});

const testConfig = createTestConfig(
  {
    useWebComponentFields: true,
    dataPrefix: 'data',

    dataDir: path.join(__dirname, 'fixtures', 'data'),

    // Test all workflow variations:
    // 1. SSN + first request + additional certs
    // 2. SSN + first request + no additional certs
    // 3. VA file number + replacement request + additional certs
    dataSets: [
      'test-data',
      'test-data-no-additional-certs',
      'test-data-va-file-number',
    ],

    pageHooks: {
      introduction: ({ afterHook }) => {
        afterHook(() => {
          cy.findAllByText(/start/i, { selector: 'a' })
            .first()
            .click();
        });
      },
      ...pageTestConfigs,
      'applicant-address': ({ afterHook }) => {
        cy.injectAxeThenAxeCheck();
        afterHook(() => {
          cy.get('@testData').then(data => {
            cy.get(v3StepHeaderSelector)
              .should('be.visible')
              .then(() => {
                cy.get('[name="root_applicantAddress_state"]')
                  .should('not.have.attr', 'disabled')
                  .then(() => {
                    cy.fillAddressWebComponentPattern(
                      'applicantAddress',
                      data.applicantAddress,
                    );

                    cy.axeCheck('.form-panel');
                    cy.findByText(/continue/i, { selector: 'button' }).click();
                  });
              });
          });
        });
      },
      'additional-certificates-request': ({ afterHook }) => {
        cy.injectAxeThenAxeCheck();
        afterHook(() => {
          cy.get('@testData').then(data => {
            const { additionalAddress, additionalCopies } = data;

            cy.get(v3StepHeaderSelector)
              .should('be.visible')
              .then(() => {
                cy.get('input[name="root_additionalAddress_state"]')
                  .should('not.be.disabled')
                  .then(() => {
                    cy.fillAddressWebComponentPattern(
                      'additionalAddress',
                      additionalAddress,
                    );
                    fillTextWebComponent('additionalCopies', additionalCopies);

                    cy.axeCheck('.form-panel');
                    cy.findByText(/continue/i, { selector: 'button' }).click();
                  });
              });
          });
        });
      },
      'review-and-submit': ({ afterHook }) => {
        afterHook(() => {
          cy.get('@testData').then(data => {
            const { applicantFullName } = data;

            reviewAndSubmitPageFlow(applicantFullName, 'Submit request');
          });
        });
      },
    },

    setupPerTest: () => {
      cy.intercept('GET', '/v0/feature_toggles?*', featureToggles);
      cy.intercept(formConfig.submitUrl, mockSubmit);
      cy.config('includeShadowDom', true);
    },
    skip: false,
  },
  manifest,
  formConfig,
);

testForm(testConfig);
