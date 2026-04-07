import path from 'path';
import testForm from 'platform/testing/e2e/cypress/support/form-tester';
import { createTestConfig } from 'platform/testing/e2e/cypress/support/form-tester/utilities';
import formConfig from '../../config/form';
import manifest from '../../manifest.json';
import {
  fillIdentityForm,
  fillVaFacility,
  goToNextPage,
  setupBasicTest,
  startAsGuestUser,
} from './utils';

const testConfig = createTestConfig(
  {
    dataPrefix: 'data',
    dataSets: ['scenario-tera-response-test'],
    fixtures: { data: path.join(__dirname, 'fixtures/data') },
    pageHooks: {
      introduction: ({ afterHook }) => {
        afterHook(() => startAsGuestUser());
      },
      'id-form': () => {
        cy.get('@testData').then(testData => fillIdentityForm(testData));
      },
      'insurance-information/va-facility': ({ afterHook }) => {
        afterHook(() => {
          cy.get('@testData').then(testData => {
            fillVaFacility(testData['view:preferredFacility']);
            goToNextPage();
          });
        });
      },
    },
    setupPerTest: () => setupBasicTest(),
  },
  manifest,
  formConfig,
);

testForm(testConfig);
