import path from 'path';
import testForm from 'platform/testing/e2e/cypress/support/form-tester';
import { createTestConfig } from 'platform/testing/e2e/cypress/support/form-tester/utilities';

import formConfig from '../../config/form';
import manifest from '../../manifest.json';
import { setupCypress } from './cypress.helpers';

// Performance: skip CSS animation waits between page transitions
Cypress.config('waitForAnimations', false);

/**
 * Minimal FDF test — adds a single biological child.
 * Covers Section I (veteran info) and Section X (statement of truth)
 * with the simplest possible add-child path: biological, lives with
 * veteran, no disability, never married, born in the USA.
 */
const fdfPageHooks = {
  introduction: ({ afterHook }) => {
    afterHook(() => {
      cy.wait('@mockVaFileNumber');
      cy.clickStartForm();
    });
  },

  'review-and-submit': ({ afterHook }) => {
    afterHook(() => {
      cy.get('@testData').then(() => {
        cy.fillVaStatementOfTruth({
          fullName: 'John Doe',
          checked: true,
        });
        cy.clickFormContinue();
      });
    });
  },
};

const testConfig = createTestConfig(
  {
    useWebComponentFields: true,
    dataPrefix: 'data',
    dataSets: ['686c-minimal-fdf'],
    fixtures: { data: path.join(__dirname, 'fixtures') },
    setupPerTest: () => setupCypress({ useFdfMocks: true }),
    pageHooks: fdfPageHooks,
  },
  manifest,
  formConfig,
);

testForm(testConfig);
