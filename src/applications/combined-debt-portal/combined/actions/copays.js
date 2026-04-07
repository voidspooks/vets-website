import * as Sentry from '@sentry/browser';
import { apiRequest } from 'platform/utilities/api';
import { getMedicalCenterNameByID } from 'platform/utilities/medical-centers/medical-centers';
import environment from 'platform/utilities/environment';
import { showVHAPaymentHistory } from '../utils/helpers';

export const MCP_STATEMENTS_FETCH_INIT = 'MCP_STATEMENTS_FETCH_INIT';
export const MCP_STATEMENTS_FETCH_SUCCESS = 'MCP_STATEMENTS_FETCH_SUCCESS';
export const MCP_STATEMENTS_FETCH_FAILURE = 'MCP_STATEMENTS_FETCH_FAILURE';
export const MCP_DETAIL_FETCH_SUCCESS = 'MCP_DETAIL_FETCH_SUCCESS';
export const MCP_DETAIL_FETCH_FAILURE = 'MCP_DETAIL_FETCH_FAILURE';
export const MCP_DETAIL_FETCH_INIT = 'MCP_DETAIL_FETCH_INIT';

export const mcpStatementsFetchInit = () => ({
  type: MCP_STATEMENTS_FETCH_INIT,
});

const titleCase = str => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getTransformedStation = station => {
  if (!station) return station;

  const facilityName = station.facilitYNum
    ? getMedicalCenterNameByID(station.facilitYNum)
    : null;
  const city = titleCase(station.city);

  return {
    ...station,
    facilityName,
    city,
  };
};

const transform = data => {
  return data.map(statement => {
    if (!statement.station) {
      return statement;
    }
    return {
      ...statement,
      station: getTransformedStation(statement.station),
    };
  });
};

export const getAllCopayStatements = async dispatch => {
  dispatch({ type: MCP_STATEMENTS_FETCH_INIT });

  const dataUrl = `${environment.API_URL}/v0/medical_copays`;

  return apiRequest(dataUrl)
    .then(({ data }) => {
      // TODO: remove shouldUseLighthouseCopays when removing showVHAPaymentHistory
      return dispatch({
        type: MCP_STATEMENTS_FETCH_SUCCESS,
        response: transform(data),
        shouldUseLighthouseCopays: false,
      });
    })
    .catch(({ errors }) => {
      const [error] = errors;
      Sentry.withScope(scope => {
        scope.setExtra('error', error);
        Sentry.captureMessage(`medical_copays failed: ${error.detail}`);
      });
      return dispatch({
        type: MCP_STATEMENTS_FETCH_FAILURE,
        error,
      });
    });
};

export const getCopaySummaryStatements = () => async (dispatch, getState) => {
  dispatch({ type: MCP_STATEMENTS_FETCH_INIT });

  const dataUrl = `${environment.API_URL}/v1/medical_copays`;

  return apiRequest(dataUrl)
    .then(response => {
      const shouldUseLighthouseCopays =
        showVHAPaymentHistory(getState()) && !response.isCerner;
      const responseData = shouldUseLighthouseCopays
        ? response.data
        : transform(response.data);

      return dispatch({
        type: MCP_STATEMENTS_FETCH_SUCCESS,
        fullResponse: response,
        response: responseData,
        meta: response.meta,
        shouldUseLighthouseCopays,
      });
    })
    .catch(({ errors }) => {
      const [error] = errors;
      Sentry.withScope(scope => {
        scope.setExtra('error', error);
        Sentry.captureMessage(`medical_copays failed: ${error.detail}`);
      });
      return dispatch({
        type: MCP_STATEMENTS_FETCH_FAILURE,
        error,
      });
    });
};

export const getCopayDetailStatement = copayId => async (
  dispatch,
  getState,
) => {
  dispatch({ type: MCP_DETAIL_FETCH_INIT });

  const dataUrl = `${environment.API_URL}/v1/medical_copays/${copayId}`;

  return apiRequest(dataUrl)
    .then(response => {
      const shouldUseLighthouseCopays =
        showVHAPaymentHistory(getState()) && !response.isCerner;
      if (!shouldUseLighthouseCopays) {
        response.data = transform([response.data])[0];
      }

      return dispatch({
        type: MCP_DETAIL_FETCH_SUCCESS,
        response,
        shouldUseLighthouseCopays,
      });
    })
    .catch(({ errors }) => {
      const [error] = errors;
      return dispatch({
        type: MCP_DETAIL_FETCH_FAILURE,
        error,
      });
    });
};
