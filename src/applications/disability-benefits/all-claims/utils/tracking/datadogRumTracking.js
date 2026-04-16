import { VA_FORM_IDS } from '@department-of-veterans-affairs/platform-forms/constants';
import {
  TRACKING_526EZ_SIDENAV_BACK_BUTTON_CLICKS,
  TRACKING_526EZ_SIDENAV_CONTINUE_BUTTON_CLICKS,
  TRACKING_526EZ_SIDENAV_FEATURE_TOGGLE,
  TRACKING_526EZ_SIDENAV_CLICKS,
} from '../../constants';
import * as datadogRumAddActionModule from './datadogRumAddAction';

// ──────────────────────────────────────────────
// Shared helpers — used by sidenav, BDD SHA, and generic tracking
// ──────────────────────────────────────────────

/**
 * Helper function to track DataDog RUM actions
 * Centralizes all datadogRum.addAction calls for easier debugging and maintenance
 * Wrapped in try-catch to ensure tracking failures never break the form
 *
 * @param {string} actionName - Name of the action to track
 * @param {object} properties - Properties to attach to the action
 */
export const trackAction = (actionName, properties) => {
  try {
    datadogRumAddActionModule.datadogRumAddAction(actionName, properties);
  } catch (error) {
    // Silent fail - tracking should never break the form
  }
};

/**
 * Increments a click counter in sessionStorage
 * Returns the new count value, defaulting to 1 if storage is blocked
 *
 * @param {string} storageKey - The sessionStorage key to increment
 * @returns {number} The new click count
 */
export const incrementClickCounter = storageKey => {
  let count = 1;
  try {
    const currentCount = parseInt(
      sessionStorage.getItem(storageKey) || '0',
      10,
    );
    count = currentCount + 1;
    sessionStorage.setItem(storageKey, count.toString());
  } catch (error) {
    // Storage access blocked - continue with default count
  }
  return count;
};

/**
 * Reads all click counters from sessionStorage
 * Returns an object with only counters that have values > 0
 * This allows every tracking action to include comprehensive click count context
 *
 * @returns {object} Object containing backButtonClickCount, continueButtonClickCount, sideNavClickCount (only if > 0)
 */
export const getClickCounts = () => {
  const counts = {};
  try {
    const backButtonCount = parseInt(
      sessionStorage.getItem(TRACKING_526EZ_SIDENAV_BACK_BUTTON_CLICKS) || '0',
      10,
    );
    const continueButtonCount = parseInt(
      sessionStorage.getItem(TRACKING_526EZ_SIDENAV_CONTINUE_BUTTON_CLICKS) ||
        '0',
      10,
    );
    const sideNavCount = parseInt(
      sessionStorage.getItem(TRACKING_526EZ_SIDENAV_CLICKS) || '0',
      10,
    );

    if (backButtonCount > 0) counts.backButtonClickCount = backButtonCount;
    if (continueButtonCount > 0)
      counts.continueButtonClickCount = continueButtonCount;
    if (sideNavCount > 0) counts.sideNavClickCount = sideNavCount;
  } catch (error) {
    // Storage access blocked - return empty object
  }
  return counts;
};

/**
 * Reads common tracking defaults from sessionStorage and the browser.
 * Provides values commonly needed by tracking functions:
 * - sidenav526ezEnabled: written once by Form526EZApp on mount
 * - sourcePath: current window pathname
 *
 * @returns {{ sourcePath: string, sidenav526ezEnabled: boolean|undefined }}
 */
export const getTrackingDefaults = () => {
  let sidenav526ezEnabled;
  let sourcePath = '';

  try {
    sourcePath = window?.location?.pathname || '';
  } catch (error) {
    sourcePath = '';
  }

  try {
    const raw = sessionStorage.getItem(TRACKING_526EZ_SIDENAV_FEATURE_TOGGLE);
    sidenav526ezEnabled = raw !== null ? raw === 'true' : undefined;
  } catch (error) {
    // Storage access blocked (privacy mode, CSP, etc.)
    sidenav526ezEnabled = undefined;
  }

  return {
    sourcePath,
    sidenav526ezEnabled,
  };
};

// ──────────────────────────────────────────────
// Generic form tracking
// ──────────────────────────────────────────────

/**
 * Tracks back button clicks in the 526EZ form
 * Maintains a session-based click counter and reads tracking defaults
 * from sessionStorage / window.location for DataDog RUM tracking
 */
export const trackBackButtonClick = () => {
  const { sourcePath, sidenav526ezEnabled } = getTrackingDefaults();
  incrementClickCounter(TRACKING_526EZ_SIDENAV_BACK_BUTTON_CLICKS);

  const properties = {
    formId: VA_FORM_IDS.FORM_21_526EZ,
    sourcePath,
    ...getClickCounts(),
  };

  if (sidenav526ezEnabled !== undefined) {
    properties.sidenav526ezEnabled = sidenav526ezEnabled;
  }

  trackAction('Form navigation - Back button clicked', properties);
};

/**
 * Tracks continue button clicks in the 526EZ form
 * Maintains a session-based click counter and reads tracking defaults
 * from sessionStorage / window.location for DataDog RUM tracking
 */
export const trackContinueButtonClick = () => {
  const { sourcePath, sidenav526ezEnabled } = getTrackingDefaults();
  incrementClickCounter(TRACKING_526EZ_SIDENAV_CONTINUE_BUTTON_CLICKS);

  const properties = {
    formId: VA_FORM_IDS.FORM_21_526EZ,
    sourcePath,
    ...getClickCounts(),
  };

  if (sidenav526ezEnabled !== undefined) {
    properties.sidenav526ezEnabled = sidenav526ezEnabled;
  }

  trackAction('Form navigation - Continue button clicked', properties);
};

/**
 * Tracks when user starts the form from introduction page
 * This tracks the initial form start event (not resumption)
 *
 * @param {boolean} isBddForm - Whether this form is started as a BDD claim
 *
 */
export const trackFormStarted = (isBddForm = false) => {
  const { sourcePath, sidenav526ezEnabled } = getTrackingDefaults();

  const properties = {
    formId: VA_FORM_IDS.FORM_21_526EZ,
    isBdd: Boolean(isBddForm),
    sourcePath,
    ...getClickCounts(),
  };

  if (sidenav526ezEnabled !== undefined) {
    properties.sidenav526ezEnabled = sidenav526ezEnabled;
  }

  trackAction('21-526EZ_claimStarted', properties);
};

/**
 * Tracks when user resumes a saved form
 * This tracks form resumption (not initial start)
 */
export const trackFormResumption = () => {
  const { sourcePath, sidenav526ezEnabled } = getTrackingDefaults();

  const properties = {
    formId: VA_FORM_IDS.FORM_21_526EZ,
    sourcePath,
    ...getClickCounts(),
  };

  if (sidenav526ezEnabled !== undefined) {
    properties.sidenav526ezEnabled = sidenav526ezEnabled;
  }

  trackAction('Form resumption - Saved form loaded', properties);
};
