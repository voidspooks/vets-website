import { Actions } from '../util/actionTypes';
import {
  getLabsAndTests,
  getLabOrTest,
  getMhvRadiologyTests,
  getMhvRadiologyDetails,
  getImagingStudies,
  getAcceleratedLabsAndTests,
  getAcceleratedImagingStudies,
  getAcceleratedImagingStudyThumbnails,
  getAcceleratedImagingStudyDicomZip,
} from '../api/MrApi';
import * as Constants from '../util/constants';
import { addAlert } from './alerts';
import { getListWithRetry } from './common';
import {
  dispatchDetails,
  isRadiologyId,
  sendDatadogError,
} from '../util/helpers';
import { radiologyRecordHash } from '../util/radiologyUtil';

const lastDicomRequest = { id: null, time: 0 };
const DICOM_DEDUP_WINDOW_MS = 1500;

export const getLabsAndTestsList = (
  isCurrent = false,
  isAccelerating = false,
  timeFrame = {},
  mergeCvixWithScdf = false,
) => async dispatch => {
  dispatch({
    type: Actions.LabsAndTests.UPDATE_LIST_STATE,
    payload: Constants.loadStates.FETCHING,
  });
  try {
    const getList = () => {
      return getAcceleratedLabsAndTests(timeFrame);
    };
    if (isAccelerating) {
      const [rawLabsResponse, cvixRadiologyResponse] = await Promise.all([
        getListWithRetry(dispatch, getList),
        mergeCvixWithScdf ? getImagingStudies() : Promise.resolve(undefined),
      ]);

      const labsAndTestsResponse = Array.isArray(rawLabsResponse)
        ? rawLabsResponse
        : rawLabsResponse?.data || [];
      const warnings = Array.isArray(rawLabsResponse)
        ? []
        : rawLabsResponse?.meta?.warnings || [];

      dispatch({
        type: Actions.LabsAndTests.SET_WARNINGS,
        payload: warnings,
      });

      dispatch({
        type: Actions.LabsAndTests.GET_UNIFIED_LIST,
        labsAndTestsResponse,
        cvixRadiologyResponse,
        isCurrent,
      });
    } else {
      const [
        labsAndTestsResponse,
        radiologyResponse,
        cvixRadiologyResponse,
      ] = await Promise.all([
        getListWithRetry(dispatch, getLabsAndTests),
        getMhvRadiologyTests(),
        getImagingStudies(),
      ]);

      /** Helper function to hash radiology responses */
      const hashRadiologyResponses = async responses => {
        if (!Array.isArray(responses)) return [];

        return Promise.all(
          responses.map(async record => ({
            ...record,
            hash: await radiologyRecordHash(record),
          })),
        );
      };

      // Use the helper function for both responses
      const [
        hashedRadiologyResponse,
        hashedCvixRadiologyResponse,
      ] = await Promise.all([
        hashRadiologyResponses(radiologyResponse),
        hashRadiologyResponses(cvixRadiologyResponse),
      ]);

      dispatch({
        type: Actions.LabsAndTests.GET_LIST,
        labsAndTestsResponse,
        radiologyResponse: hashedRadiologyResponse,
        cvixRadiologyResponse: hashedCvixRadiologyResponse,
        isCurrent,
      });
    }
  } catch (error) {
    dispatch(addAlert(Constants.ALERT_TYPE_ERROR, error));
    sendDatadogError(error, 'actions_labsAndTests_getLabsAndTestsList');
  }
};

export const getLabsAndTestsDetails = (
  labId,
  labList,
  isAccelerating,
) => async dispatch => {
  try {
    /** Should be a temporary var while CVIX calls and SCDF calls coexist */
    const shouldAccelerate = isAccelerating && !isRadiologyId(labId);

    let getDetailsFunc = shouldAccelerate
      ? async () => {
          // Return a notfound response because the downstream API
          // does not support fetching a single lab or test
          return { data: { notFound: true } };
        }
      : getLabOrTest;

    if (isRadiologyId(labId)) {
      getDetailsFunc = getMhvRadiologyDetails;
    }

    await dispatchDetails(
      labId,
      labList,
      dispatch,
      getDetailsFunc,
      Actions.LabsAndTests.GET_FROM_LIST,
      shouldAccelerate
        ? Actions.LabsAndTests.GET_UNIFIED_ITEM_FROM_LIST
        : Actions.LabsAndTests.GET,
    );
  } catch (error) {
    dispatch(addAlert(Constants.ALERT_TYPE_ERROR, error));
    sendDatadogError(error, 'actions_labsAndTests_getLabsAndTestsDetails');
  }
};

/**
 * Merge SCDF imaging study data into the current labs-and-tests list.
 * Should be dispatched after both the labs list and the imaging studies
 * list have been fetched.
 */
export const mergeImagingStudies = () => async dispatch => {
  dispatch({ type: Actions.LabsAndTests.MERGE_IMAGING_STUDIES });
};

export const clearLabsAndTestDetails = () => async dispatch => {
  lastDicomRequest.id = null;
  lastDicomRequest.time = 0;
  dispatch({ type: Actions.LabsAndTests.CLEAR_DETAIL });
};

export const reloadRecords = () => async dispatch => {
  dispatch({ type: Actions.LabsAndTests.COPY_UPDATED_LIST });
};

export const updateLabsAndTestDateRange = (
  option,
  fromDate,
  toDate,
) => async dispatch => {
  dispatch({
    type: Actions.LabsAndTests.SET_DATE_RANGE,
    payload: {
      option,
      fromDate,
      toDate,
    },
  });
};

/**
 * Fetch accelerated imaging studies from the SCDF v2 endpoint.
 * Dispatches the response separately so it can be merged with the labs list
 * once both fetches are complete.
 *
 * @param {Object} timeFrame
 * @param {string} timeFrame.startDate - Start date in YYYY-MM-DD format
 * @param {string} timeFrame.endDate - End date in YYYY-MM-DD format
 */
export const getAcceleratedImagingStudiesList = (
  timeFrame = {},
) => async dispatch => {
  try {
    const response = await getAcceleratedImagingStudies(timeFrame);
    dispatch({
      type: Actions.LabsAndTests.GET_IMAGING_STUDIES,
      response,
    });
  } catch (error) {
    // TODO Until SCDF images are fully functional, don't error out if the fetch fails
    // dispatch(addAlert(Constants.ALERT_TYPE_ERROR, error));
    sendDatadogError(
      error,
      'actions_labsAndTests_getAcceleratedImagingStudiesList',
    );
  }
};

/**
 * Fetch thumbnail details (series/instance data with presigned URLs) for a
 * single accelerated imaging study.
 *
 * @param {string} id - The FHIR imaging study identifier
 */
export const getImagingStudyThumbnails = id => async dispatch => {
  try {
    const response = await getAcceleratedImagingStudyThumbnails({ id });
    dispatch({
      type: Actions.LabsAndTests.GET_IMAGING_STUDY_THUMBNAILS,
      response,
      id,
    });
  } catch (error) {
    dispatch(addAlert(Constants.ALERT_TYPE_IMAGE_THUMBNAIL_ERROR, error));
    sendDatadogError(error, 'actions_labsAndTests_getImagingStudyThumbnails');
  }
};

/**
 * Fetch the presigned DICOM zip download URL for a single accelerated
 * imaging study. Prevents duplicate requests for the same study within
 * a short window. For duplicate calls, return nothing as the original
 * request should still be in flight.
 *
 * @param {string} id - The FHIR imaging study identifier
 */
export const getImagingStudyDicomZip = id => async dispatch => {
  const now = Date.now();
  if (
    id === lastDicomRequest.id &&
    now - lastDicomRequest.time < DICOM_DEDUP_WINDOW_MS
  ) {
    return;
  }
  lastDicomRequest.id = id;
  lastDicomRequest.time = now;

  try {
    const response = await getAcceleratedImagingStudyDicomZip({ id });
    dispatch({
      type: Actions.LabsAndTests.GET_IMAGING_STUDY_DICOM,
      response,
      id,
    });
  } catch (error) {
    dispatch(addAlert(Constants.ALERT_TYPE_ERROR, error));
    sendDatadogError(error, 'actions_labsAndTests_getImagingStudyDicomZip');
  }
};
