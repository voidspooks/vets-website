import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getImagingStudyThumbnails,
  getImagingStudyDicomZip,
} from '../actions/labsAndTests';
import { addAlert } from '../actions/alerts';
import { Actions } from '../util/actionTypes';
import {
  ALERT_TYPE_IMAGE_THUMBNAIL_ERROR,
  ALERT_TYPE_IMAGE_DICOM_ERROR,
} from '../util/constants';
import useAlerts from './use-alerts';

const INITIAL_THUMB_POLL_INTERVAL = 2000;
const INITIAL_DICOM_POLL_INTERVAL = 5000;
const BACKOFF_FACTOR = 1.05;
const MAX_POLL_INTERVAL = 30000;
const MAX_POLL_DURATION = 60000;

/**
 * Custom hook that polls for imaging study thumbnails and DICOM download URL
 * with exponential backoff. Each resource polls on its own cadence — thumbnails
 * start at 2 s and DICOM at 5 s — and each independently backs off, times out,
 * or stops when its data arrives.
 *
 * Thumbnails are considered fully loaded only when the number of URLs in state
 * reaches `expectedImageCount`. Partial results will continue polling.
 *
 * @param {string|null} imagingStudyId - The imaging study ID to poll for.
 * @param {number} [expectedImageCount] - Total images expected. When undefined
 *   or null the hook falls back to treating any non-empty thumbnail array as
 *   complete (preserving the legacy behaviour).
 * @returns {{ hasLoadedThumbnails: boolean, hasLoadedDicom: boolean, hasImageError: boolean, hasDicomError: boolean }}
 */
const useThumbnailPolling = (imagingStudyId, expectedImageCount) => {
  const dispatch = useDispatch();
  // useAlerts handles clearing alerts on unmount
  useAlerts(dispatch);

  const alertList = useSelector(state => state.mr.alerts?.alertList || []);
  const scdfImageThumbnails = useSelector(
    state => state.mr.labsAndTests.scdfImageThumbnails,
  );
  const scdfDicom = useSelector(state => state.mr.labsAndTests.scdfDicom);
  const scdfImageStudyId = useSelector(
    state => state.mr.labsAndTests.scdfImageStudyId,
  );

  const [thumbInterval, setThumbInterval] = useState(
    INITIAL_THUMB_POLL_INTERVAL,
  );
  const [dicomInterval, setDicomInterval] = useState(
    INITIAL_DICOM_POLL_INTERVAL,
  );
  const pollStartTime = useRef(null);
  const hasTimedOut = useRef({ thumbnails: false, dicom: false });

  const thumbCount = scdfImageThumbnails?.length ?? 0;
  const hasLoadedThumbnails =
    expectedImageCount === 0 ||
    (expectedImageCount > 0
      ? thumbCount >= expectedImageCount
      : thumbCount > 0);
  const hasLoadedDicom = !!scdfDicom;

  const hasImageError = alertList.some(
    a => a.isActive && a.type === ALERT_TYPE_IMAGE_THUMBNAIL_ERROR,
  );
  const hasDicomError = alertList.some(
    a => a.isActive && a.type === ALERT_TYPE_IMAGE_DICOM_ERROR,
  );

  const thumbnailsDone = hasLoadedThumbnails || hasImageError;
  const dicomDone = hasLoadedDicom || hasDicomError;

  const pollThumbnails = useCallback(
    () => {
      if (imagingStudyId) {
        dispatch(getImagingStudyThumbnails(imagingStudyId));
      }
    },
    [dispatch, imagingStudyId],
  );

  const pollDicom = useCallback(
    () => {
      if (imagingStudyId) {
        dispatch(getImagingStudyDicomZip(imagingStudyId));
      }
    },
    [dispatch, imagingStudyId],
  );

  // Initial fetch — clears stale cache when switching studies, skips fetch
  // when cached data already belongs to this study.
  useEffect(
    () => {
      if (!imagingStudyId) return;

      const isCacheStale =
        scdfImageStudyId != null && scdfImageStudyId !== imagingStudyId;
      if (isCacheStale) {
        dispatch({ type: Actions.LabsAndTests.CLEAR_IMAGING_CACHE });
      }

      setThumbInterval(INITIAL_THUMB_POLL_INTERVAL);
      setDicomInterval(INITIAL_DICOM_POLL_INTERVAL);
      pollStartTime.current = null;
      hasTimedOut.current = { thumbnails: false, dicom: false };

      const cacheMatchesStudy = scdfImageStudyId === imagingStudyId;
      if (!cacheMatchesStudy || !hasLoadedThumbnails) {
        dispatch(getImagingStudyThumbnails(imagingStudyId));
      }
      if (!cacheMatchesStudy || !hasLoadedDicom) {
        dispatch(getImagingStudyDicomZip(imagingStudyId));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, imagingStudyId],
  );

  // Helper: check if we've exceeded the max poll duration and fire timeout
  // alerts for any resource that hasn't finished yet.
  const checkTimeout = useCallback(
    () => {
      if (pollStartTime.current === null) {
        pollStartTime.current = Date.now();
      }
      if (Date.now() - pollStartTime.current < MAX_POLL_DURATION) {
        return false;
      }
      if (!hasTimedOut.current.thumbnails && !thumbnailsDone) {
        hasTimedOut.current.thumbnails = true;
        dispatch(
          addAlert(
            ALERT_TYPE_IMAGE_THUMBNAIL_ERROR,
            new Error('Thumbnail polling timed out'),
          ),
        );
      }
      if (!hasTimedOut.current.dicom && !dicomDone) {
        hasTimedOut.current.dicom = true;
        dispatch(
          addAlert(
            ALERT_TYPE_IMAGE_DICOM_ERROR,
            new Error('DICOM polling timed out'),
          ),
        );
      }
      return true;
    },
    [thumbnailsDone, dicomDone, dispatch],
  );

  // Thumbnail polling loop
  useEffect(
    () => {
      if (thumbnailsDone || !imagingStudyId) return undefined;
      if (checkTimeout()) return undefined;

      const timeoutId = setTimeout(() => {
        pollThumbnails();
        setThumbInterval(prev =>
          Math.min(prev * BACKOFF_FACTOR, MAX_POLL_INTERVAL),
        );
      }, thumbInterval);

      return () => clearTimeout(timeoutId);
    },
    [
      thumbnailsDone,
      thumbInterval,
      pollThumbnails,
      imagingStudyId,
      checkTimeout,
    ],
  );

  // DICOM polling loop
  useEffect(
    () => {
      if (dicomDone || !imagingStudyId) return undefined;
      if (checkTimeout()) return undefined;

      const timeoutId = setTimeout(() => {
        pollDicom();
        setDicomInterval(prev =>
          Math.min(prev * BACKOFF_FACTOR, MAX_POLL_INTERVAL),
        );
      }, dicomInterval);

      return () => clearTimeout(timeoutId);
    },
    [dicomDone, dicomInterval, pollDicom, imagingStudyId, checkTimeout],
  );

  return { hasLoadedThumbnails, hasLoadedDicom, hasImageError, hasDicomError };
};

export default useThumbnailPolling;
