export const RUM_ACTIONS = {
  STATEMENT_TYPE_SELECTED: '4138_statement_type_selected',
  SUBMISSION_ATTEMPT: '4138_submission_attempt',
  SUBMISSION_SUCCESS: '4138_submission_success',
  SUBMISSION_FAILURE: '4138_submission_failure',
};

export const SUBMISSION_ERROR_STATUSES = new Set([
  'clientError',
  'throttledError',
  'serverError',
]);
