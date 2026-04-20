import {
  EVIDENCE_VA_DETAILS_URL,
  EVIDENCE_PRIVATE_PROMPT_URL,
  EVIDENCE_PRIVATE_DETAILS_URL,
} from '../constants';
import {
  hasOtherEvidence,
  hasArrayBuilderPrivateEvidence,
  hasArrayBuilderVAEvidence,
} from './form-data-retrieval';

export const redesignActive = formData => formData?.showArrayBuilder;

// TODO: remove when decision_review_sc_redesign_nov2025 is retired
// Map old saved returnUrls to their renamed equivalents. Old URLs were changed
// to avoid collisions with array builder page routes. Without this, veterans
// with in-progress forms saved at the old URLs would hit dead routes.
const RETURN_URL_MIGRATIONS = {
  '/supporting-evidence/va-medical-records': `/${EVIDENCE_VA_DETAILS_URL}`,
  '/supporting-evidence/request-private-medical-records': `/${EVIDENCE_PRIVATE_PROMPT_URL}`,
  '/supporting-evidence/private-medical-records': `/${EVIDENCE_PRIVATE_DETAILS_URL}`,
};

/**
 * Redirect to the user's last saved URL if it exists
 * @param {String} returnUrl - URL of last saved page
 * @param {Object} formData - saved form data
 * @param {Object} router - React router
 */
export const onFormLoaded = ({ returnUrl, formData, router }) => {
  if (returnUrl) {
    // Only migrate URLs from forms saved before the redesign code was deployed.
    // Old forms won't have showArrayBuilder in their saved data. New forms
    // always have it (true or false), and their URLs are already correct.
    const migratedUrl =
      formData?.showArrayBuilder === undefined
        ? RETURN_URL_MIGRATIONS[returnUrl]
        : undefined;
    router?.push(migratedUrl || returnUrl);
  }
};

/**
 * We want to hide the evidence summary page if the redesign is active
 * and the user has added VA or non-VA records, but does not upload
 * evidence. In all other situations, this screen should show
 * @param {*} formData
 * @returns
 */
export const shouldHideEvidenceSummaryPage = formData =>
  redesignActive(formData) &&
  !hasOtherEvidence(formData) &&
  (hasArrayBuilderVAEvidence(formData) ||
    hasArrayBuilderPrivateEvidence(formData));
