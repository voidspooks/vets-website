import {
  FETCH_INTENTS_TO_FILE_ERROR,
  FETCH_INTENTS_TO_FILE_PENDING,
  FETCH_INTENTS_TO_FILE_SUCCESS,
} from '../actions/types';

const initialState = {
  data: [],
  loading: true,
  error: null,
};

export default function intentsToFileReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_INTENTS_TO_FILE_PENDING: {
      return {
        ...state,
        loading: true,
        data: [],
        error: null,
      };
    }
    case FETCH_INTENTS_TO_FILE_SUCCESS: {
      return {
        ...state,
        loading: false,
        data: action.data,
        error: null,
      };
    }
    case FETCH_INTENTS_TO_FILE_ERROR: {
      return {
        ...state,
        loading: false,
        data: [],
        error: true,
      };
    }
    default:
      return state;
  }
}
