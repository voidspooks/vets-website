import { VA_FORM_IDS } from '@department-of-veterans-affairs/platform-forms/constants';
import { trackAction } from './datadogRumTracking';
import {
  getBddShaSubmissionProperties,
  trackBddShaFormSubmitted,
} from './bddShaRumTracking';
import { getSideNavSubmissionProperties } from './sideNavRumTracking';

// Strategy: keep one submit entry point and compose payload subsets from
// feature-specific modules so submit wiring stays centralized and extensible.

/**
 * Gathers all submission-time properties for the 21-526EZ_claimSubmitted action
 *
 * Properties include:
 * - formId: the submitted form's ID (constant for this form)
 * - isBdd: whether the submitted form is a BDD claim (from BDD/SHA tracking)
 * - sideNavProperties
 * - sessionCount: how many sessions the user had before submitting (from BDD/SHA tracking)
 *
 * @param {object} [formData] - The submitted form data
 * @returns {object} The properties to include in the 21-526EZ_claimSubmitted action
 */
const getClaimSubmittedProperties = formData => {
  const { isBdd, sessionCount } = getBddShaSubmissionProperties(formData);
  const sideNavProperties = getSideNavSubmissionProperties();

  return {
    formId: VA_FORM_IDS.FORM_21_526EZ,
    isBdd,
    ...sideNavProperties,
    sessionCount,
  };
};

/**
 * Tracks all submission-time RUM events through one entry point.
 *
 * Event ownership:
 * - This file orchestrates submit-time event firing.
 * - sideNavRumTracking owns side-nav-derived submit fields.
 * - bddShaRumTracking owns BDD/SHA-derived submit fields and BDD-only events.
 *
 * @param {object} [formData] - The submitted form data
 */
export const trackFormSubmitted = (formData = {}) => {
  const claimSubmittedProperties = getClaimSubmittedProperties(formData);
  const { isBdd, sessionCount } = claimSubmittedProperties;

  trackAction('21-526EZ_claimSubmitted', claimSubmittedProperties);

  trackAction('21-526EZ_numberOfSessions', {
    formId: VA_FORM_IDS.FORM_21_526EZ,
    isBdd,
    sessionCount,
  });

  trackBddShaFormSubmitted(formData);
};
