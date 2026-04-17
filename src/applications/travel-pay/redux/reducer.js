import { combineReducers } from 'redux';
import {
  CLEAR_UNSAVED_EXPENSE_CHANGES,
  CREATE_COMPLEX_CLAIM_FAILURE,
  CREATE_COMPLEX_CLAIM_STARTED,
  CREATE_COMPLEX_CLAIM_SUCCESS,
  CREATE_EXPENSE_FAILURE,
  CREATE_EXPENSE_STARTED,
  FETCH_EXPENSE_FAILURE,
  FETCH_EXPENSE_STARTED,
  FETCH_EXPENSE_SUCCESS,
  DELETE_DOCUMENT_FAILURE,
  DELETE_DOCUMENT_STARTED,
  DELETE_DOCUMENT_SUCCESS,
  DELETE_EXPENSE_DELETE_DOCUMENT_FAILURE,
  DELETE_EXPENSE_DELETE_DOCUMENT_STARTED,
  DELETE_EXPENSE_DELETE_DOCUMENT_SUCCESS,
  FETCH_APPOINTMENT_FAILURE,
  FETCH_APPOINTMENT_STARTED,
  FETCH_APPOINTMENT_SUCCESS,
  FETCH_APPOINTMENT_BY_DATE_FAILURE,
  FETCH_APPOINTMENT_BY_DATE_STARTED,
  FETCH_APPOINTMENT_BY_DATE_SUCCESS,
  FETCH_CLAIM_DETAILS_FAILURE,
  FETCH_CLAIM_DETAILS_STARTED,
  FETCH_CLAIM_DETAILS_SUCCESS,
  FETCH_COMPLEX_CLAIM_DETAILS_FAILURE,
  FETCH_COMPLEX_CLAIM_DETAILS_STARTED,
  FETCH_COMPLEX_CLAIM_DETAILS_SUCCESS,
  FETCH_TRAVEL_CLAIMS_FAILURE,
  FETCH_TRAVEL_CLAIMS_STARTED,
  FETCH_TRAVEL_CLAIMS_SUCCESS,
  SET_UNSAVED_EXPENSE_CHANGES,
  SUBMIT_CLAIM_FAILURE,
  SUBMIT_CLAIM_STARTED,
  SUBMIT_CLAIM_SUCCESS,
  SUBMIT_COMPLEX_CLAIM_FAILURE,
  SUBMIT_COMPLEX_CLAIM_STARTED,
  SUBMIT_COMPLEX_CLAIM_SUCCESS,
  UPDATE_EXPENSE_FAILURE,
  UPDATE_EXPENSE_STARTED,
  UPDATE_EXPENSE_SUCCESS,
  CREATE_EXPENSE_SUCCESS,
  SET_REVIEW_PAGE_ALERT,
  CLEAR_REVIEW_PAGE_ALERT,
  SET_EXPENSE_BACK_DESTINATION,
  UPLOAD_POA_STARTED,
  UPLOAD_POA_SUCCESS,
  UPLOAD_POA_FAILURE,
  SET_UNSAVED_CHANGES_MODAL_VISIBLE,
} from './actions';

// Helper function to merge expenses, avoiding duplicates
function mergeExpenses(existingExpenses, newExpenses) {
  // Create a map of existing expenses, filtering out any without valid IDs
  const existingExpensesMap = existingExpenses
    .filter(expense => expense && expense.id != null && expense.id !== '')
    .reduce(
      (map, expense) => ({
        ...map,
        [String(expense.id)]: expense,
      }),
      {},
    );

  // Merge new expenses with existing ones, preserving all properties
  const mergedExpensesMap = newExpenses
    .filter(expense => expense && expense.id != null && expense.id !== '')
    .reduce((map, newExpense) => {
      const key = String(newExpense.id);
      return {
        ...map,
        [key]: {
          // Merge existing expense properties with new ones
          ...(map[key] || {}),
          ...newExpense,
        },
      };
    }, existingExpensesMap);

  // Convert back to array
  return Object.values(mergedExpensesMap);
}

function transposeExpenses(expenses, documents) {
  return expenses.map(expense => {
    // there should only be one document associated with an expense
    // so grab the first.
    const expenseDocument = documents.find(doc => doc.expenseId === expense.id);

    if (expenseDocument) {
      return {
        ...expense,
        documentId: expenseDocument.documentId,
      };
    }

    return expense;
  });
}

const initialTravelClaimsState = {
  isLoading: false,
  claims: {},
};

const initialClaimDetailsState = {
  isLoading: false,
  error: null,
  data: {},
};

const initialAppointmentState = {
  isLoading: false,
  error: null,
  data: null,
};

const initialClaimSubmissionState = {
  isSubmitting: false,
  error: null,
  data: null,
};

const initialComplexClaimState = {
  claim: {
    creation: {
      isLoading: false,
      error: null,
    },
    submission: {
      id: '',
      isSubmitting: false,
      error: null,
      data: null,
    },
    fetch: {
      isLoading: false,
      error: null,
    },
    data: null,
  },
  expenses: {
    creation: {
      isLoading: false,
      error: null,
    },
    update: {
      id: '',
      isLoading: false,
      error: null,
    },
    delete: {
      id: '',
      isLoading: false,
      error: null,
    },
    fetch: {
      id: '',
      isLoading: false,
      error: null,
    },
    data: [],
    hasUnsavedChanges: false,
  },
  documentDelete: {
    id: '',
    isLoading: false,
    error: null,
  },
  expenseBackDestination: null,
  proofOfAttendance: {
    isLoading: false,
    error: null,
  },
  unsavedChangesModal: {
    visible: false,
    source: null,
  },
};

export const initialState = {
  travelClaims: initialTravelClaimsState,
  claimDetails: initialClaimDetailsState,
  appointment: initialAppointmentState,
  claimSubmission: initialClaimSubmissionState,
  reviewPageAlert: null,
  complexClaim: initialComplexClaimState,
};

// ── Top-level slice reducers ──────────────────────────────────────────────────

function travelClaimsReducer(state = initialTravelClaimsState, action) {
  switch (action.type) {
    case FETCH_TRAVEL_CLAIMS_STARTED:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_TRAVEL_CLAIMS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        claims: {
          ...state.claims,
          [action.dateRangeId]: {
            error: null,
            metadata: action.payload.metadata,
            data: action.payload.data,
          },
        },
      };
    case FETCH_TRAVEL_CLAIMS_FAILURE:
      return {
        ...state,
        isLoading: false,
        claims: {
          ...state.claims,
          [action.dateRangeId]: {
            error: action.error,
            metadata: {},
            data: [],
          },
        },
      };
    default:
      return state;
  }
}

function claimDetailsReducer(state = initialClaimDetailsState, action) {
  switch (action.type) {
    case FETCH_CLAIM_DETAILS_STARTED:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_CLAIM_DETAILS_SUCCESS:
      return {
        error: null,
        isLoading: false,
        data: {
          ...state.data,
          [action.id]: action.payload,
        },
      };
    case FETCH_CLAIM_DETAILS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };
    default:
      return state;
  }
}

function appointmentReducer(state = initialAppointmentState, action) {
  switch (action.type) {
    case FETCH_APPOINTMENT_STARTED:
    case FETCH_APPOINTMENT_BY_DATE_STARTED:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_APPOINTMENT_SUCCESS:
    case FETCH_APPOINTMENT_BY_DATE_SUCCESS:
      return {
        error: null,
        isLoading: false,
        data: action.payload,
      };
    case FETCH_APPOINTMENT_FAILURE:
    case FETCH_APPOINTMENT_BY_DATE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };
    default:
      return state;
  }
}

function claimSubmissionReducer(state = initialClaimSubmissionState, action) {
  switch (action.type) {
    case SUBMIT_CLAIM_STARTED:
      return {
        ...state,
        isSubmitting: true,
      };
    case SUBMIT_CLAIM_SUCCESS:
      return {
        error: null,
        isSubmitting: false,
        data: action.payload,
      };
    case SUBMIT_CLAIM_FAILURE:
      return {
        ...state,
        isSubmitting: false,
        error: action.error,
      };
    default:
      return state;
  }
}

function reviewPageAlertReducer(state = null, action) {
  switch (action.type) {
    case SET_REVIEW_PAGE_ALERT:
      return action.payload;
    case CLEAR_REVIEW_PAGE_ALERT:
      return null;
    default:
      return state;
  }
}

// ── complexClaim slice reducer ────────────────────────────────────────────────

function complexClaimReducer(state = initialComplexClaimState, action) {
  switch (action.type) {
    case SUBMIT_COMPLEX_CLAIM_STARTED:
      return {
        ...state,
        claim: {
          ...state.claim,
          submission: {
            ...state.claim.submission,
            isSubmitting: true,
            error: null,
          },
        },
      };
    case SUBMIT_COMPLEX_CLAIM_SUCCESS:
      return {
        ...state,
        claim: {
          ...state.claim,
          submission: {
            ...state.claim.submission,
            isSubmitting: false,
            error: null,
            data: action.payload,
          },
        },
      };
    case SUBMIT_COMPLEX_CLAIM_FAILURE:
      return {
        ...state,
        claim: {
          ...state.claim,
          submission: {
            ...state.claim.submission,
            isSubmitting: false,
            error: action.error,
          },
        },
      };
    case CREATE_COMPLEX_CLAIM_STARTED:
      return {
        ...state,
        claim: {
          ...state.claim,
          creation: {
            isLoading: true,
            error: null,
          },
        },
      };
    case CREATE_COMPLEX_CLAIM_SUCCESS:
      return {
        ...state,
        claim: {
          ...state.claim,
          creation: {
            error: null,
            isLoading: false,
            data: action.payload,
          },
          data: action.payload,
        },
      };
    case CREATE_COMPLEX_CLAIM_FAILURE:
      return {
        ...state,
        claim: {
          ...state.claim,
          creation: {
            isLoading: false,
            error: action.error,
          },
        },
      };
    case UPDATE_EXPENSE_STARTED:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          update: {
            id: action.expenseId,
            isLoading: true,
            error: null,
          },
        },
      };
    case FETCH_EXPENSE_STARTED:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          fetch: {
            id: action.expenseId,
            isLoading: true,
            error: null,
          },
        },
      };
    case UPDATE_EXPENSE_SUCCESS:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          update: {
            id: '',
            isLoading: false,
            error: null,
          },
        },
      };
    case FETCH_EXPENSE_SUCCESS:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          fetch: {
            id: action.expenseId,
            isLoading: false,
            error: null,
          },
        },
      };
    case UPDATE_EXPENSE_FAILURE:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          update: {
            id: action.expenseId,
            isLoading: false,
            error: action.error,
          },
        },
      };
    case FETCH_EXPENSE_FAILURE:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          fetch: {
            id: action.expenseId,
            isLoading: false,
            error: action.error,
          },
        },
      };
    case DELETE_EXPENSE_DELETE_DOCUMENT_STARTED:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          delete: {
            id: action.expenseId,
            isLoading: true,
            error: null,
          },
        },
      };
    case DELETE_EXPENSE_DELETE_DOCUMENT_FAILURE:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          delete: {
            id: action.expenseId,
            isLoading: false,
            error: action.error,
          },
        },
      };
    case CREATE_EXPENSE_STARTED:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          creation: {
            isLoading: true,
            error: null,
          },
        },
      };
    case CREATE_EXPENSE_SUCCESS:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          creation: {
            isLoading: false,
            error: null,
          },
        },
      };
    case CREATE_EXPENSE_FAILURE:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          creation: {
            isLoading: false,
            error: action.error,
          },
        },
      };
    case FETCH_COMPLEX_CLAIM_DETAILS_STARTED:
      return {
        ...state,
        claim: {
          ...state.claim,
          fetch: {
            isLoading: true,
            error: null,
          },
        },
      };
    case FETCH_COMPLEX_CLAIM_DETAILS_SUCCESS: {
      const existingExpenses = state.expenses.data || [];
      const claimDocuments = action.payload?.documents || [];
      const newExpenses = action.payload?.expenses || [];
      const mergedExpenses = mergeExpenses(existingExpenses, newExpenses);
      const transposedExpenses = transposeExpenses(
        mergedExpenses,
        claimDocuments,
      );

      return {
        ...state,
        claim: {
          ...state.claim,
          fetch: {
            isLoading: false,
            error: null,
          },
          data: action.payload,
        },
        expenses: {
          ...state.expenses,
          data: transposedExpenses,
        },
      };
    }
    case FETCH_COMPLEX_CLAIM_DETAILS_FAILURE:
      return {
        ...state,
        claim: {
          ...state.claim,
          fetch: {
            isLoading: false,
            error: action.error,
          },
        },
      };
    case DELETE_EXPENSE_DELETE_DOCUMENT_SUCCESS: {
      const claimDocuments = action.payload?.documents || [];
      const newExpenses = action.payload?.expenses || [];
      const transposedExpenses = transposeExpenses(newExpenses, claimDocuments);

      return {
        ...state,
        claim: {
          ...state.claim,
          data: action.payload,
        },
        expenses: {
          ...state.expenses,
          delete: {
            id: '',
            isLoading: false,
            error: null,
          },
          data: transposedExpenses,
        },
      };
    }
    case DELETE_DOCUMENT_STARTED:
      return {
        ...state,
        documentDelete: {
          id: action.documentId,
          isLoading: true,
          error: null,
        },
      };
    case DELETE_DOCUMENT_SUCCESS:
      return {
        ...state,
        documentDelete: {
          id: '',
          isLoading: false,
          error: null,
        },
      };
    case DELETE_DOCUMENT_FAILURE:
      return {
        ...state,
        documentDelete: {
          id: action.documentId,
          isLoading: false,
          error: action.error,
        },
      };
    case SET_UNSAVED_EXPENSE_CHANGES:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          hasUnsavedChanges: action.payload,
        },
      };
    case CLEAR_UNSAVED_EXPENSE_CHANGES:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          hasUnsavedChanges: false,
        },
      };
    case SET_EXPENSE_BACK_DESTINATION:
      return {
        ...state,
        expenseBackDestination: action.payload,
      };
    case SET_UNSAVED_CHANGES_MODAL_VISIBLE:
      return {
        ...state,
        unsavedChangesModal: {
          visible: action.payload.visible,
          source: action.payload.source,
        },
      };
    case UPLOAD_POA_STARTED:
      return {
        ...state,
        proofOfAttendance: {
          ...state.proofOfAttendance,
          isLoading: true,
          error: null,
        },
      };
    case UPLOAD_POA_SUCCESS:
      return {
        ...state,
        proofOfAttendance: {
          ...state.proofOfAttendance,
          isLoading: false,
          error: null,
        },
      };
    case UPLOAD_POA_FAILURE:
      return {
        ...state,
        proofOfAttendance: {
          ...state.proofOfAttendance,
          isLoading: false,
          error: action.error,
        },
      };
    default:
      return state;
  }
}

export default {
  travelPay: combineReducers({
    travelClaims: travelClaimsReducer,
    claimDetails: claimDetailsReducer,
    appointment: appointmentReducer,
    claimSubmission: claimSubmissionReducer,
    reviewPageAlert: reviewPageAlertReducer,
    complexClaim: complexClaimReducer,
  }),
};
