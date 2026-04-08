import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getImagingStudyThumbnails,
  getImagingStudyDicomZip,
} from '../actions/labsAndTests';
import { addAlert } from '../actions/alerts';
import { ALERT_TYPE_IMAGE_THUMBNAIL_ERROR } from '../util/constants';
import useAlerts from './use-alerts';

const INITIAL_POLL_INTERVAL = 2000;
const BACKOFF_FACTOR = 1.05;
const MAX_POLL_INTERVAL = 30000;
const MAX_POLL_DURATION = 60000;

/**
 * Custom hook that polls for imaging study thumbnails with exponential backoff.
 * Dispatches an initial fetch for both thumbnails and DICOM, then continues
 * polling for thumbnails until they arrive, an error occurs, or 60 seconds
 * elapse — whichever comes first.
 *
 * @param {string|null} imagingStudyId - The imaging study ID to poll for.
 * @returns {{ hasLoadedThumbnails: boolean, hasImageError: boolean }}
 */
const useThumbnailPolling = imagingStudyId => {
  const dispatch = useDispatch();
  const activeAlert = useAlerts(dispatch);

  const scdfImageThumbnails = useSelector(
    state => state.mr.labsAndTests.scdfImageThumbnails,
  );

  const [pollInterval, setPollInterval] = useState(INITIAL_POLL_INTERVAL);
  const pollStartTime = useRef(null);
  const hasTimedOut = useRef(false);

  const hasLoadedThumbnails = scdfImageThumbnails?.length > 0;
  const hasImageError = activeAlert?.type === ALERT_TYPE_IMAGE_THUMBNAIL_ERROR;

  const pollThumbnails = useCallback(
    () => {
      if (imagingStudyId) {
        dispatch(getImagingStudyThumbnails(imagingStudyId));
      }
    },
    [dispatch, imagingStudyId],
  );

  // Initial fetch for thumbnails and DICOM
  useEffect(
    () => {
      if (imagingStudyId) {
        setPollInterval(INITIAL_POLL_INTERVAL);
        pollStartTime.current = null;
        hasTimedOut.current = false;
        dispatch(getImagingStudyThumbnails(imagingStudyId));
        dispatch(getImagingStudyDicomZip(imagingStudyId));
      }
    },
    [dispatch, imagingStudyId],
  );

  // Poll thumbnails with exponential backoff until URLs arrive, error, or timeout
  useEffect(
    () => {
      if (hasLoadedThumbnails || hasImageError || !imagingStudyId) {
        return undefined;
      }

      if (!pollStartTime.current) {
        pollStartTime.current = Date.now();
      }

      if (Date.now() - pollStartTime.current >= MAX_POLL_DURATION) {
        if (!hasTimedOut.current) {
          hasTimedOut.current = true;
          dispatch(
            addAlert(
              ALERT_TYPE_IMAGE_THUMBNAIL_ERROR,
              new Error('Thumbnail polling timed out'),
            ),
          );
        }
        return undefined;
      }

      const timeoutId = setTimeout(() => {
        pollThumbnails();
        setPollInterval(prev =>
          Math.min(prev * BACKOFF_FACTOR, MAX_POLL_INTERVAL),
        );
      }, pollInterval);

      return () => clearTimeout(timeoutId);
    },
    [
      hasLoadedThumbnails,
      hasImageError,
      pollInterval,
      pollThumbnails,
      imagingStudyId,
      dispatch,
    ],
  );

  return { hasLoadedThumbnails, hasImageError };
};

export default useThumbnailPolling;
