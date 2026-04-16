import inProgressMock from 'platform/testing/e2e/cypress/support/form-tester/utilities';
import testForm from 'platform/testing/e2e/cypress/support/form-tester';
import mockBasicPrefill from './fixtures/mocks/mock-prefill-tera.json';
import createMockUserInProgress from './fixtures/mocks/mock-user-in-progress';
import { getConfig } from './utils';

const START_URL = '/military-service/toxic-exposure';
const STOP_URL = '/household-information/marital-status-information';

const mockPrefillAgentOrangeDob = inProgressMock({
  prefill: {
    ...mockBasicPrefill.formData,
  },
  returnUrl: START_URL,
});

const mockPrefillCombat = inProgressMock({
  prefill: {
    ...mockBasicPrefill.formData,
    veteranDateOfBirth: '1968-11-18',
  },
  returnUrl: START_URL,
});

const mockPrefillPostSept11ServiceDob = inProgressMock({
  prefill: {
    ...mockBasicPrefill.formData,
    veteranDateOfBirth: '1976-11-18',
  },
  returnUrl: START_URL,
});

const mockPrefillOtherExposureDob = inProgressMock({
  prefill: {
    ...mockBasicPrefill.formData,
    veteranDateOfBirth: '2021-11-18',
  },
  returnUrl: START_URL,
});

const mockUserAgentOrange = createMockUserInProgress({
  birthDate: '1948-11-18', // prior to 1966
  returnUrl: START_URL,
});

const mockUserCombat = createMockUserInProgress({
  birthDate: '1968-11-18', // 1966–1975
  returnUrl: START_URL,
});

const mockUserPostSept11 = createMockUserInProgress({
  birthDate: '1976-11-18', // 1976+
  returnUrl: START_URL,
});

const mockUserOtherExposure = createMockUserInProgress({
  birthDate: '2021-11-18', // < 15 years old scenario
  returnUrl: START_URL,
});

describe('EZR - Resume and stop flow (TERA scenarios)', () => {
  describe('when the user has a DOB prior to 1966', () => {
    const testConfig = getConfig({
      dataSets: ['tera-test'],
      prefill: mockPrefillAgentOrangeDob,
      user: mockUserAgentOrange,
      stop: STOP_URL,
      useAuth: true,
    });

    testForm(testConfig);
  });

  describe('when the user has a DOB between 1966 and 1975', () => {
    const testConfig = getConfig({
      dataSets: ['tera-test'],
      prefill: mockPrefillCombat,
      user: mockUserCombat,
      stop: STOP_URL,
      useAuth: true,
    });

    testForm(testConfig);
  });

  describe('when the user has a DOB from 1976 through 15 years before the present day', () => {
    const testConfig = getConfig({
      dataSets: ['maximal-test'],
      prefill: mockPrefillPostSept11ServiceDob,
      user: mockUserPostSept11,
      stop: STOP_URL,
      useAuth: true,
    });

    testForm(testConfig);
  });

  describe('when the user is younger than 15 years old', () => {
    const testConfig = getConfig({
      dataSets: ['maximal-test'],
      prefill: mockPrefillOtherExposureDob,
      user: mockUserOtherExposure,
      stop: STOP_URL,
      useAuth: true,
    });

    testForm(testConfig);
  });
});
