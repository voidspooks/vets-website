import inProgressMock from 'platform/testing/e2e/cypress/support/form-tester/utilities';
import testForm from 'platform/testing/e2e/cypress/support/form-tester';
import mockBasicPrefill from './fixtures/mocks/mock-prefill.json';
import createMockUserInProgress from './fixtures/mocks/mock-user-in-progress';
import { getConfig } from './utils';

const START_URL = '/household-information/financial-information';
const STOP_URL = '/insurance-information/medicaid-eligibility';

const mockUserInProgress = createMockUserInProgress({
  returnUrl: START_URL,
});

const basePrefill = {
  ...mockBasicPrefill.formData,
  veteranAddress: {
    country: 'USA',
    street: '123 Main St',
    city: 'Springfield',
    state: 'OH',
    postalCode: '54321',
  },
  'view:doesMailingMatchHomeAddress': true,
  'view:isEnrolledMedicarePartA': false,
  'view:householdEnabled': true,
};

const buildPrefill = maritalStatus =>
  inProgressMock({
    prefill: {
      ...basePrefill,
      'view:maritalStatus': {
        maritalStatus,
      },
    },
    returnUrl: START_URL,
  });

describe('EZR - financial information flow', () => {
  describe('when the user has financial information to report and has a spouse', () => {
    const testConfig = getConfig({
      dataSets: ['maximal-test'],
      prefill: buildPrefill('Married'),
      user: mockUserInProgress,
      stop: STOP_URL,
      useAuth: true,
    });

    testForm(testConfig);
  });

  describe('when the user has financial information to report and has no spouse', () => {
    const testConfig = getConfig({
      dataSets: ['maximal-test'],
      prefill: buildPrefill('Never Married'),
      user: mockUserInProgress,
      stop: STOP_URL,
      useAuth: true,
    });

    testForm(testConfig);
  });

  describe('when the user has no financial information to report', () => {
    const testConfig = getConfig({
      dataSets: ['minimal-test'],
      prefill: buildPrefill('Never Married'),
      user: mockUserInProgress,
      stop: STOP_URL,
      useAuth: true,
    });

    testForm(testConfig);
  });
});
