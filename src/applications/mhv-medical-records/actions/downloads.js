import { format } from 'date-fns';
import {
  generateCCD,
  downloadCCD,
  generateCCDV2,
  statusCCDV2,
  downloadCCDV2 as downloadCCDV2Api,
} from '../api/MrApi';
import { Actions } from '../util/actionTypes';
import { addAlert, clearAlerts } from './alerts';
import { sendDatadogError } from '../util/helpers';
import * as Constants from '../util/constants';

const INITIAL_BACKOFF = 1000; // 1 second
const BACKOFF_FACTOR = 1.05; // 5% increase
const MAX_DURATION = 60000; // 1 minute total
const MIN_DELAY = 1000; // 1s floor for status polling
const MAX_DELAY = 30000; // 30s ceiling for status polling
const CACHE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Checks whether a CCD V2 format status value indicates readiness.
 * @param {string} value - Status string from the status endpoint (e.g., 'READY', 'NOT_READY')
 * @returns {boolean} True if the value is 'READY' (case-insensitive)
 */
const isReady = value =>
  typeof value === 'string' && value.toUpperCase() === 'READY';

// Shared media type map for CCD downloads
const MEDIA_TYPE_MAP = {
  xml: 'application/xml;charset=utf-8',
  html: 'text/html;charset=utf-8',
  pdf: 'application/pdf',
};

/**
 * Validates file type and returns corresponding media type
 * @param {string} fileType - File extension (xml, html, pdf)
 * @returns {string} Media type
 * @throws {Error} If file type is unsupported
 */
const validateAndGetMediaType = fileType => {
  const extension = String(fileType).toLowerCase();
  const mediaType = MEDIA_TYPE_MAP[extension];

  if (!mediaType) {
    throw new Error(`Unsupported file type: ${extension}`);
  }

  return mediaType;
};

/**
 * Creates a blob with the correct MIME type
 * @param {Response} response - Fetch API response
 * @param {string} mediaType - MIME type to apply
 * @returns {Promise<Blob>} Blob with correct type
 */
const createBlobWithType = async (response, mediaType) => {
  const blob = await response.blob();
  // If blob doesn't have a type, set it explicitly
  return blob.type ? blob : blob.slice(0, blob.size, mediaType);
};

/**
 * Triggers browser file download
 * @param {Blob} blob - File blob to download
 * @param {string} fileName - Name for downloaded file
 */
const triggerFileDownload = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
};

export const genAndDownloadCCD = (
  firstName,
  lastName,
  fileType = 'xml',
  backoff = INITIAL_BACKOFF,
  startTime = Date.now(),
) => async dispatch => {
  // Clear any previous error alerts before attempting new download
  dispatch(clearAlerts());

  dispatch({ type: Actions.Downloads.GENERATE_CCD });

  try {
    // GET LIST OF CCDs
    const generate = await generateCCD();

    // SUCCESSFUL CCD GENERATION
    if (generate[0]?.status === 'COMPLETE') {
      // getting the timestamp and filename for download
      const timestamp = generate[0].dateGenerated;
      const timestampDate = new Date(timestamp);

      const extension = fileType.toLowerCase();
      const fileName = `VA-Continuity-of-care-document-${
        firstName ? `${firstName}-` : ''
      }${lastName}-${format(timestampDate, 'M-d-yyyy_hhmmssaaa')}.${extension}`;

      // get the xml data from the api
      const response = await downloadCCD(timestamp, fileType);

      // Validate file type and create blob with correct MIME type
      const mediaType = validateAndGetMediaType(fileType);
      const blob = await createBlobWithType(response, mediaType);

      // download the file to the user
      dispatch({ type: Actions.Downloads.DOWNLOAD_CCD, response: timestamp });
      triggerFileDownload(blob, fileName);
    }

    // ERROR IN GENERATION (API SIDE)
    else if (generate[0]?.status === 'ERROR') {
      const timestamp = generate[0].dateGenerated;
      localStorage.setItem('lastCCDError', timestamp);
      dispatch({
        type: Actions.Downloads.CCD_GENERATION_ERROR,
        response: timestamp,
      });
    }

    // RETRY WITH BACKOFF
    else {
      const elapsed = Date.now() - startTime;

      // if we have exceeded 1 minute, throw an error
      if (elapsed >= MAX_DURATION) {
        throw new Error('CCD generation timed out.');
      }

      const nextBackoff = backoff * BACKOFF_FACTOR;
      setTimeout(() => {
        dispatch(
          genAndDownloadCCD(
            firstName,
            lastName,
            fileType,
            nextBackoff,
            startTime,
          ),
        );
      }, backoff);
    }
  } catch (error) {
    dispatch({ type: Actions.Downloads.CANCEL_CCD });
    dispatch(addAlert(Constants.ALERT_TYPE_CCD_ERROR, error));
  }
};

/**
 * Helper that polls the CCD V2 status endpoint until the requested format
 * reports "READY", or the timeout is reached.
 *
 * @param {string} jobId   - Job ID returned by the generate call
 * @param {string} requestedFormat - The file extension the user requested (xml, html, pdf)
 * @param {number} retryAfterSeconds - Initial retry interval in seconds
 * @returns {Promise<{taskId: string, xml: string, html: string, pdf: string, authoredOn: string|null}>}
 *   The status attributes including the taskId to use for download,
 *   the readiness state of each format, and the authoredOn timestamp
 *   from the READY response (used for cache expiration).
 */
const pollCCDV2Status = async (jobId, requestedFormat, retryAfterSeconds) => {
  const startTime = Date.now();
  let delay = Math.min(
    Math.max(retryAfterSeconds * 1000, MIN_DELAY),
    MAX_DELAY,
  );
  // Start polling with the UUID jobId. Once the backend assigns a taskId
  // we switch to polling with that instead.
  let pollId = jobId;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const elapsed = Date.now() - startTime;
    if (elapsed >= MAX_DURATION) {
      throw new Error('CCD generation timed out.');
    }

    // Wait for the retry interval before polling
    const currentDelay = delay;
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => setTimeout(resolve, currentDelay));

    // eslint-disable-next-line no-await-in-loop
    const statusResponse = await statusCCDV2(pollId);
    const attrs = statusResponse?.data?.attributes;

    // Once a taskId is available, switch to polling with it
    if (attrs?.taskId) {
      pollId = attrs.taskId;
    }

    // The requested format must be READY before we can download
    if (isReady(attrs?.[requestedFormat])) {
      return {
        taskId: pollId,
        xml: attrs?.xml || null,
        html: attrs?.html || null,
        pdf: attrs?.pdf || null,
        authoredOn: attrs?.authoredOn || null,
      };
    }

    // Update delay from the response if available
    if (attrs?.retryAfterSeconds) {
      delay = Math.min(
        Math.max(attrs.retryAfterSeconds * 1000, MIN_DELAY),
        MAX_DELAY,
      );
    }
  }
};

/**
 * Downloads CCD from Oracle Health (V2 endpoint)
 *
 * Flow: generate -> poll status until READY -> download
 *
 * If a previous download already completed for a different format, the cached
 * ccdV2Status (taskId + format readiness) is reused so we skip generate + poll
 * and go straight to download.  The cache is only valid for 10 minutes after
 * the authoredOn timestamp; once expired a fresh generate + poll cycle runs.
 *
 * @param {string} firstName - User's first name for the filename
 * @param {string} lastName  - User's last name for the filename
 * @param {string} fileType  - Desired format: 'xml', 'html', or 'pdf'
 * @param {Object|null} cachedStatus - Previously stored ccdV2Status from Redux
 *   Shape: { taskId: string, xml: string, html: string, pdf: string, authoredOn: string }
 */
export const genAndDownloadCCDV2 = (
  firstName,
  lastName,
  fileType = 'xml',
  cachedStatus = null,
) => async dispatch => {
  // Clear any previous error alerts before attempting new download
  dispatch(clearAlerts());

  dispatch({ type: Actions.Downloads.GENERATE_CCD });

  try {
    const extension = fileType.toLowerCase();
    const mediaType = validateAndGetMediaType(extension);

    let downloadId;
    let authoredOnDate;

    // Determine whether the cached status is still fresh (< 10 min old)
    const cacheIsFresh =
      cachedStatus?.authoredOn &&
      Date.now() - new Date(cachedStatus.authoredOn).getTime() <
        CACHE_MAX_AGE_MS;

    // Check if a previous generation already produced a READY status for this format
    if (
      cacheIsFresh &&
      cachedStatus?.taskId &&
      isReady(cachedStatus[extension])
    ) {
      downloadId = cachedStatus.taskId;
      authoredOnDate = cachedStatus.authoredOn;
    } else {
      // Step 1: Generate the CCD – returns a jobId and retryAfterSeconds
      const generateResponse = await generateCCDV2();
      const generateAttrs = generateResponse?.data?.attributes;
      const { jobId, retryAfterSeconds, authoredOn, message } = generateAttrs;

      if (!jobId) {
        dispatch({
          type: Actions.Downloads.CCD_GENERATION_ERROR,
          response: authoredOn || new Date().toISOString(),
        });
        throw new Error(
          `CCD generation error: ${message || 'No job ID returned.'}`,
        );
      }

      // Step 2: Poll statusCCDV2 until the requested format is READY
      const statusResult = await pollCCDV2Status(
        jobId,
        extension,
        retryAfterSeconds || 10,
      );

      downloadId = statusResult.taskId;
      authoredOnDate = statusResult.authoredOn;

      // Cache the V2 status so subsequent format downloads skip generate + poll
      dispatch({
        type: Actions.Downloads.SET_CCD_V2_STATUS,
        response: statusResult,
      });
    }

    // Step 3: Download the document in the requested format
    const response = await downloadCCDV2Api(downloadId, extension);

    const fileDate = authoredOnDate ? new Date(authoredOnDate) : new Date();
    const fileName = `VA-Continuity-of-care-document-OH-${
      firstName ? `${firstName}-` : ''
    }${lastName}-${format(fileDate, 'M-d-yyyy_hhmmssaaa')}.${extension}`;

    const blob = await createBlobWithType(response, mediaType);
    triggerFileDownload(blob, fileName);

    dispatch({
      type: Actions.Downloads.DOWNLOAD_CCD,
      response: new Date().toISOString(),
    });
  } catch (error) {
    dispatch({ type: Actions.Downloads.CANCEL_CCD });
    dispatch({ type: Actions.Downloads.CLEAR_CCD_V2_STATUS });
    dispatch(addAlert(Constants.ALERT_TYPE_CCD_ERROR, error));
    sendDatadogError(error, 'actions_downloads_downloadCCDV2');
  }
};

export const updateReportDateRange = (
  option,
  fromDate,
  toDate,
) => async dispatch => {
  dispatch({
    type: Actions.Downloads.SET_DATE_FILTER,
    response: {
      option,
      fromDate,
      toDate,
    },
  });
  dispatch({ type: Actions.BlueButtonReport.CLEAR_APPOINTMENTS });
};

export const updateReportRecordType = selectedTypes => async dispatch => {
  dispatch({
    type: Actions.Downloads.SET_RECORD_FILTER,
    response: selectedTypes,
  });
};

export const updateReportFileType = selectedType => async dispatch => {
  dispatch({
    type: Actions.Downloads.SET_FILE_TYPE_FILTER,
    response: selectedType,
  });
};
