import { VA_FORM_IDS } from '@department-of-veterans-affairs/platform-forms/constants';
import { TRACKING_526EZ_SIDENAV_CLICKS } from '../../constants';
import {
  trackAction,
  incrementClickCounter,
  getClickCounts,
  getTrackingDefaults,
} from './datadogRumTracking';

/**
 * Returns side-nav related submission properties used by submission orchestrators.
 * Keep this scoped to side-nav concerns only; the submit orchestrator merges
 * this subset with other feature subsets.
 *
 * Properties include:
 * - sourcePath: the URL path of the page where the user submitted (from side-nav tracking)
 * - backButtonClickCount: how many times the user clicked "Back" in the side nav during this session (from side-nav tracking)
 * - continueButtonClickCount: how many times the user clicked "Continue" in the side nav during this session (from side-nav tracking)
 * - sideNavClickCount: how many times the user clicked any chapter in the side nav during this session (from side-nav tracking; only included if > 0 to reduce noise)
 *
 * @returns {object}
 */
export const getSideNavSubmissionProperties = () => {
  const { sourcePath, sidenav526ezEnabled } = getTrackingDefaults();
  const properties = {
    sourcePath,
    ...getClickCounts(),
  };

  if (sidenav526ezEnabled !== undefined) {
    properties.sidenav526ezEnabled = sidenav526ezEnabled;
  }

  return properties;
};

/**
 * Tracks side nav chapter clicks
 * This tracks when users navigate via the side navigation menu
 * Maintains a session-based click counter shared with mobile accordion clicks
 *
 * @param {object} params - Parameters for tracking
 * @param {object} params.pageData - Page data including key, label, and path
 * @param {string} params.pathname - Current page pathname before navigation
 */
export const trackSideNavChapterClick = (params = {}) => {
  const { pageData = {}, pathname = '' } = params;
  incrementClickCounter(TRACKING_526EZ_SIDENAV_CLICKS);

  const properties = {
    formId: VA_FORM_IDS.FORM_21_526EZ,
    chapterTitle: pageData?.label || '',
    sourcePath: pathname,
    ...getClickCounts(),
  };

  trackAction('Side navigation - Chapter clicked', properties);
};

/**
 * Tracks mobile sidenav accordion expand/collapse
 * This tracks when users interact with the mobile accordion to show/hide navigation
 * Maintains a session-based click counter shared with chapter clicks
 *
 * @param {object} params - Parameters for tracking
 * @param {string} params.pathname - Current page pathname
 * @param {string} params.state - Accordion state: 'expanded' or 'collapsed'
 * @param {string} params.accordionTitle - Title of the accordion (e.g., "Form steps")
 */
export const trackMobileAccordionClick = ({
  pathname = '',
  state = '',
  accordionTitle = '',
} = {}) => {
  incrementClickCounter(TRACKING_526EZ_SIDENAV_CLICKS);

  const properties = {
    formId: VA_FORM_IDS.FORM_21_526EZ,
    state,
    accordionTitle,
    sourcePath: pathname,
    ...getClickCounts(),
  };

  trackAction('Side navigation - Mobile accordion clicked', properties);
};
