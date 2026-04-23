import { apiRequest } from 'platform/utilities/api';
import environment from 'platform/utilities/environment';

export const CLAIMANT_INFO_ENDPOINT = `${
  environment.API_URL
}/meb_api/v0/forms_claimant_info?type=Chapter35`;

export const FETCH_PERSONAL_INFORMATION = 'FETCH_PERSONAL_INFORMATION';
export const FETCH_PERSONAL_INFORMATION_SUCCESS =
  'FETCH_PERSONAL_INFORMATION_SUCCESS';
export const FETCH_PERSONAL_INFORMATION_FAILED =
  'FETCH_PERSONAL_INFORMATION_FAILED';

export const DUPLICATE_CONTACT_INFO_ENDPOINT = `${
  environment.API_URL
}/meb_api/v0/duplicate_contact_info`;
export const FETCH_DUPLICATE_CONTACT = 'FETCH_DUPLICATE_CONTACT';
export const FETCH_DUPLICATE_CONTACT_INFO_SUCCESS =
  'FETCH_DUPLICATE_CONTACT_INFO_SUCCESS';
export const FETCH_DUPLICATE_CONTACT_INFO_FAILURE =
  'FETCH_DUPLICATE_CONTACT_INFO_FAILURE';
export const UPDATE_GLOBAL_EMAIL = 'UPDATE_GLOBAL_EMAIL';
export const UPDATE_GLOBAL_PHONE_NUMBER = 'UPDATE_GLOBAL_PHONE_NUMBER';
export const ACKNOWLEDGE_DUPLICATE = 'ACKNOWLEDGE_DUPLICATE';
export const TOGGLE_MODAL = 'TOGGLE_MODAL';

export const FETCH_DIRECT_DEPOSIT = 'FETCH_DIRECT_DEPOSIT';
export const FETCH_DIRECT_DEPOSIT_SUCCESS = 'FETCH_DIRECT_DEPOSIT_SUCCESS';
export const FETCH_DIRECT_DEPOSIT_FAILED = 'FETCH_DIRECT_DEPOSIT_FAILED';
export const FETCH_DIRECT_DEPOSIT_ENDPOINT = `${
  environment.API_URL
}/v0/profile/direct_deposits`;

export const CLAIM_STATUS_ENDPOINT = `${
  environment.API_URL
}/meb_api/v0/forms_claim_status`;
export const CLAIM_STATUS_RESPONSE_IN_PROGRESS = 'INPROGRESS';
export const CLAIM_STATUS_RESPONSE_ELIGIBLE = 'ELIGIBLE';
export const CLAIM_STATUS_RESPONSE_DENIED = 'DENIED';
export const CLAIM_STATUS_RESPONSE_ERROR = 'ERROR';
export const FETCH_CLAIM_STATUS = 'FETCH_CLAIM_STATUS';
export const FETCH_CLAIM_STATUS_SUCCESS = 'FETCH_CLAIM_STATUS_SUCCESS';
export const FETCH_CLAIM_STATUS_FAILURE = 'FETCH_CLAIM_STATUS_FAILURE';

export const CONFIRMATION_ENDPOINT = `${
  environment.API_URL
}/meb_api/v0/send_confirmation_email`;
export const SEND_CONFIRMATION = 'SEND_CONFIRMATION';
export const SEND_CONFIRMATION_SUCCESS = 'SEND_CONFIRMATION_SUCCESS';
export const SEND_CONFIRMATION_FAILURE = 'SEND_CONFIRMATION_FAILURE';

const FIVE_SECONDS = 5000;
const ONE_MINUTE_IN_THE_FUTURE = () =>
  new Date(new Date().getTime() + FIVE_SECONDS * 12);

function getNowDate() {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

const poll = ({
  endpoint,
  validate = response => response && response.data,
  interval = FIVE_SECONDS,
  endTime = ONE_MINUTE_IN_THE_FUTURE(),
  dispatch,
  timeoutResponse,
  successDispatchType,
  failureDispatchType,
}) => {
  const executePoll = async (resolve, reject) => {
    try {
      const response = await apiRequest(endpoint);

      if (validate(response)) {
        resolve(response.data); // Resolve with response data if valid
        return;
      }

      if (new Date() >= endTime) {
        resolve(timeoutResponse); // Resolve with timeout response if end time reached
        return;
      }

      // Continue polling if conditions are not met
      setTimeout(() => executePoll(resolve, reject), interval);
    } catch (error) {
      // Continue polling through errors until timeout
      if (new Date() >= endTime) {
        resolve(timeoutResponse); // Return INPROGRESS on timeout
        return;
      }
      setTimeout(() => executePoll(resolve, reject), interval);
    }
  };

  // Return the promise and handle dispatch based on resolution
  return new Promise(executePoll)
    .then(response => {
      dispatch({ type: successDispatchType, response });
    })
    .catch(errors => {
      dispatch({ type: failureDispatchType, errors });
    });
};

export function fetchPersonalInformation() {
  return async dispatch => {
    dispatch({ type: FETCH_PERSONAL_INFORMATION });
    try {
      const response = await apiRequest(CLAIMANT_INFO_ENDPOINT);
      dispatch({ type: FETCH_PERSONAL_INFORMATION_SUCCESS, response });
    } catch (errors) {
      dispatch({ type: FETCH_PERSONAL_INFORMATION_FAILED, errors });
    }
  };
}

export function fetchDuplicateContactInfo(email, phoneNumber) {
  return async dispatch => {
    dispatch({ type: FETCH_DUPLICATE_CONTACT });
    try {
      const response = await apiRequest(DUPLICATE_CONTACT_INFO_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ emails: email, phones: phoneNumber }),
        headers: { 'Content-Type': 'application/json' },
      });
      dispatch({ type: FETCH_DUPLICATE_CONTACT_INFO_SUCCESS, response });
    } catch (errors) {
      dispatch({ type: FETCH_DUPLICATE_CONTACT_INFO_FAILURE, errors });
    }
  };
}

export function updateGlobalEmail(email) {
  return {
    type: UPDATE_GLOBAL_EMAIL,
    email,
  };
}

export function updateGlobalPhoneNumber(mobilePhone) {
  return {
    type: UPDATE_GLOBAL_PHONE_NUMBER,
    mobilePhone,
  };
}

export function acknowledgeDuplicate(contactInfo) {
  return {
    type: ACKNOWLEDGE_DUPLICATE,
    contactInfo,
  };
}

export function toggleModal(toggle) {
  return {
    type: TOGGLE_MODAL,
    toggle,
  };
}

export function fetchClaimStatus(selectedChapter) {
  return async dispatch => {
    dispatch({ type: FETCH_CLAIM_STATUS });
    const timeoutResponse = {
      attributes: {
        claimStatus: CLAIM_STATUS_RESPONSE_IN_PROGRESS,
        receivedDate: getNowDate(),
      },
    };

    // Return the poll promise directly to ensure consistent return
    return poll({
      endpoint: `${CLAIM_STATUS_ENDPOINT}?type=${selectedChapter}`,
      validate: response =>
        response?.data?.attributes?.claimStatus &&
        response.data.attributes.claimStatus !==
          CLAIM_STATUS_RESPONSE_IN_PROGRESS,
      dispatch,
      timeoutResponse,
      successDispatchType: FETCH_CLAIM_STATUS_SUCCESS,
      failureDispatchType: FETCH_CLAIM_STATUS_FAILURE,
    });
  };
}

export function fetchDirectDeposit() {
  return async dispatch => {
    dispatch({ type: FETCH_DIRECT_DEPOSIT });
    return apiRequest(FETCH_DIRECT_DEPOSIT_ENDPOINT)
      .then(response => {
        dispatch({
          type: FETCH_DIRECT_DEPOSIT_SUCCESS,
          response,
        });
      })
      .catch(errors => {
        dispatch({
          type: FETCH_DIRECT_DEPOSIT_FAILED,
          errors,
        });
      });
  };
}

// Helper function to convert camelCase to snake_case
const toSnakeCase = obj => {
  const result = {};
  Object.keys(obj).forEach(key => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    result[snakeKey] = obj[key];
  });
  return result;
};

export function sendConfirmation(params) {
  return async dispatch => {
    dispatch({ type: SEND_CONFIRMATION });
    const snakeCaseParams = toSnakeCase(params);
    return apiRequest(CONFIRMATION_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(snakeCaseParams),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response =>
        dispatch({
          type: SEND_CONFIRMATION_SUCCESS,
          response,
        }),
      )
      .catch(errors =>
        dispatch({
          type: SEND_CONFIRMATION_FAILURE,
          errors,
        }),
      );
  };
}
