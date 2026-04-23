import inProgressMock from 'platform/testing/e2e/cypress/support/form-tester/utilities';
import testForm from 'platform/testing/e2e/cypress/support/form-tester';
import mockBasicPrefill from './fixtures/mocks/mock-prefill.json';
import createMockUserInProgress from './fixtures/mocks/mock-user-in-progress';
import { getConfig } from './utils';

const START_URL = '/household-information/marital-status-information';
const STOP_URL = '/household-information/dependents';

const mockUserInProgress = createMockUserInProgress({
  returnUrl: START_URL,
});

const sharedResumePrefill = {
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
};

const mockPrefillNeverMarried = inProgressMock({
  prefill: {
    ...sharedResumePrefill,
    'view:maritalStatus': {
      maritalStatus: 'Never Married',
    },
  },
  returnUrl: START_URL,
});

describe('EZR - spouse information flow', () => {
  describe('when the Veteran is not married or separated', () => {
    const testConfig = getConfig({
      dataSets: ['minimal-test'],
      prefill: mockPrefillNeverMarried,
      user: mockUserInProgress,
      stop: STOP_URL,
      useAuth: true,
    });

    testForm(testConfig);
  });
});
