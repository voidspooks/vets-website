import path from 'path';
import { createTestConfig } from 'platform/testing/e2e/cypress/support/form-tester/utilities';
import formConfig from '../../../config/form';
import manifest from '../../../manifest.json';
import { fillPrivacyAgreementAndSubmit } from './fillers';
import { startAsNewUser, startAsInProgressUser } from './helpers';
import { setupBasicTest, setupForAuth } from './setup';

/**
 * Builds a shared Cypress form-tester config with common defaults and overrides.
 *
 * Supports both:
 * - new user flows
 * - authenticated resume and stopflows using saved in-progress form data
 *
 * @param {Object} options
 * @param {string[]} options.dataSets - Array of dataset names used by form-tester
 * @param {string} [options.stop] - Pathname where the test should stop.
 * If not provided, the test will continue through the entire form and submit
 * @param {boolean} [options.useAuth=false] - Whether to run the test as an authenticated user
 * @param {Object} [options.prefill] - Mock in-progress form response used for authenticated resume tests.
 * This should only include form data up to the page represented by the saved return URL.
 * @param {Object} [options.user] - Mock authenticated user object. For resume tests, this should
 * include the appropriate `inProgressForms` metadata for the form.
 * @param {Object} [options.additionalPageHooks={}] - Additional page hooks to merge
 * @returns {Object} Test configuration
 */
export const getConfig = ({
  dataSets = [],
  stop = null,
  useAuth = false,
  prefill,
  user,
  additionalPageHooks = {},
} = {}) => {
  const basePageHooks = {
    introduction: ({ afterHook }) => {
      afterHook(
        () =>
          useAuth ? startAsInProgressUser() : startAsNewUser({ auth: useAuth }),
      );
    },
    'review-and-submit': ({ afterHook }) => {
      afterHook(() => fillPrivacyAgreementAndSubmit());
    },
  };

  const pageHooks = {
    ...basePageHooks,
    ...additionalPageHooks,
  };

  const setupPerTest = useAuth
    ? () => setupForAuth({ prefill, user })
    : () => setupBasicTest();

  return createTestConfig(
    {
      fixtures: { data: path.join(__dirname, '../fixtures/data') },
      dataPrefix: 'data',
      dataSets,
      stopTestAfterPath: stop,
      pageHooks,
      setupPerTest,
    },
    manifest,
    formConfig,
  );
};
