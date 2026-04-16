import { VA_FORM_IDS } from '@department-of-veterans-affairs/platform-forms/constants';
import {
  TRACKING_526EZ_BDD_SESSION_COUNT,
  TRACKING_526EZ_BDD_SHOWN_SHA_INTRO,
  TRACKING_526EZ_BDD_SHOWN_SHA_UPLOAD,
} from '../../constants';
import { incrementClickCounter, trackAction } from './datadogRumTracking';
import { getBddShaUploads, hasShaDocumentUploaded, isBDD } from '../index';

// ──────────────────────────────────────────────
// Session tracking
// ──────────────────────────────────────────────

/**
 * Initializes / increments BDD session tracking.
 * Called when the ITF banner is dismissed (i.e. starting or resuming a session).
 *
 * - Increments the session counter.
 * - Initializes page-seen flags to 'false' if they don't already have a value,
 *   preserving 'true' across sessions if the page was previously visited.
 *
 * NOTE: The session count definition may change in the future.
 * Currently, each ITF banner display counts as a new session.
 */
export const initBddSessionTracking = () => {
  incrementClickCounter(TRACKING_526EZ_BDD_SESSION_COUNT);

  // Only initialize page-seen flags if they haven't been set yet.
  // This preserves 'true' values across Save & Finish Later resumes.
  if (!sessionStorage.getItem(TRACKING_526EZ_BDD_SHOWN_SHA_INTRO)) {
    sessionStorage.setItem(TRACKING_526EZ_BDD_SHOWN_SHA_INTRO, 'false');
  }
  if (!sessionStorage.getItem(TRACKING_526EZ_BDD_SHOWN_SHA_UPLOAD)) {
    sessionStorage.setItem(TRACKING_526EZ_BDD_SHOWN_SHA_UPLOAD, 'false');
  }
};

// ──────────────────────────────────────────────
// Event: SHA page seen
// ──────────────────────────────────────────────

const PAGE_SEEN_KEYS = {
  intro: TRACKING_526EZ_BDD_SHOWN_SHA_INTRO,
  upload: TRACKING_526EZ_BDD_SHOWN_SHA_UPLOAD,
};

/**
 * Marks a SHA page as seen in sessionStorage.
 * Called when the SHA intro or upload page renders.
 *
 * @param {'intro'|'upload'} pageKey - Which page was seen
 */
export const trackShaPageSeen = pageKey => {
  const storageKey = PAGE_SEEN_KEYS[pageKey];
  if (storageKey) {
    sessionStorage.setItem(storageKey, 'true');
  }
};

// ──────────────────────────────────────────────
// Event: SHA destructive modal shown
// ──────────────────────────────────────────────

/**
 * Tracks when the user is shown the destructive modal warning about removing SHA evidence.
 * Fired from the SeparationHealthAssessment
 */
export const trackShaDestructiveModal = () => {
  trackAction('21-526EZ_bddShaDestructiveModalShown', {
    formId: VA_FORM_IDS.FORM_21_526EZ,
  });
};

// ──────────────────────────────────────────────
// Event: SHA download link clicked
// ──────────────────────────────────────────────

/**
 * Tracks when the user clicks the SHA download link.
 * Fired from the SeparationHealthAssessmentWarningAlert.
 */
export const trackShaDownloadLinkClicked = () => {
  trackAction('21-526EZ_bddShaDownloadShaLinkClicked', {
    formId: VA_FORM_IDS.FORM_21_526EZ,
  });
};

const getSessionCount = () => {
  try {
    return parseInt(
      sessionStorage.getItem(TRACKING_526EZ_BDD_SESSION_COUNT) || '0',
      10,
    );
  } catch (error) {
    return 0;
  }
};

/**
 * Returns submission-scoped BDD/SHA properties used by submission orchestrators.
 * Keep this BDD/SHA-specific so submit orchestration can compose feature subsets
 * without duplicating BDD logic in a generic tracking file.
 *
 * @param {object} [formData] - The submitted form data
 * @returns {{isBdd: boolean, sessionCount: number, shaUploaded: boolean, shaFileCount: number, shownShaIntro: string, shownShaUpload: string}}
 */
export const getBddShaSubmissionProperties = (formData = {}) => {
  const isBdd = isBDD(formData);
  const shaUploaded = isBdd ? hasShaDocumentUploaded(formData) : false;
  const shaFileCount = isBdd ? getBddShaUploads(formData).length : 0;

  return {
    isBdd,
    sessionCount: getSessionCount(),
    shaUploaded,
    shaFileCount,
    shownShaIntro:
      sessionStorage.getItem(TRACKING_526EZ_BDD_SHOWN_SHA_INTRO) || 'false',
    shownShaUpload:
      sessionStorage.getItem(TRACKING_526EZ_BDD_SHOWN_SHA_UPLOAD) || 'false',
  };
};

/**
 * Fires BDD/SHA submission-only actions when the submitted form is BDD.
 * Called by the centralized submission orchestrator.
 *
 * @param {object} [formData] - The submitted form data
 */
const trackBddShaSubmissionEvents = (formData = {}) => {
  const {
    isBdd,
    shaUploaded,
    shaFileCount,
    shownShaIntro,
    shownShaUpload,
  } = getBddShaSubmissionProperties(formData);

  if (!isBdd) {
    return;
  }

  trackAction('21-526EZ_bddShaUploadStatus', {
    formId: VA_FORM_IDS.FORM_21_526EZ,
    shaUploaded,
  });

  trackAction('21-526EZ_bddShownSeparationHealthAssessmentIntro', {
    formId: VA_FORM_IDS.FORM_21_526EZ,
    shownShaIntro,
  });

  trackAction('21-526EZ_bddShownSeparationHealthAssessmentUpload', {
    formId: VA_FORM_IDS.FORM_21_526EZ,
    shownShaUpload,
  });

  trackAction('21-526EZ_bddShaNumberOfFilesUploaded', {
    formId: VA_FORM_IDS.FORM_21_526EZ,
    shaFileCount,
  });
};

const resetBddShaSubmissionTracking = () => {
  try {
    sessionStorage.removeItem(TRACKING_526EZ_BDD_SESSION_COUNT);
    sessionStorage.removeItem(TRACKING_526EZ_BDD_SHOWN_SHA_INTRO);
    sessionStorage.removeItem(TRACKING_526EZ_BDD_SHOWN_SHA_UPLOAD);
  } catch (error) {
    // Storage access blocked - silent fail
  }
};

// ──────────────────────────────────────────────
// BDD / SHA Submission tracking
// ──────────────────────────────────────────────
/**
 *  BDD only tracking fired on form submission to capture final BDD-related metrics:
 *  - 21-526EZ_bddShaUploadStatus
 *  - 21-526EZ_bddShownSeparationHealthAssessmentIntro
 *  - 21-526EZ_bddShownSeparationHealthAssessmentUpload
 *  - 21-526EZ_bddShaNumberOfFilesUploaded
 */

export const trackBddShaFormSubmitted = formData => {
  trackBddShaSubmissionEvents(formData);
  resetBddShaSubmissionTracking();
};
