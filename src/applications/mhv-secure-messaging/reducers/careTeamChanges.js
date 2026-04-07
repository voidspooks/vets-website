import { Actions } from '../util/actionTypes';

const initialState = {
  changes: [],
  isLoading: false,
  error: null,
  messageId: null,
};

export const careTeamChangesReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.CareTeamChanges.GET:
      return { ...state, isLoading: true, error: null };
    case Actions.CareTeamChanges.GET_SUCCESS:
      return { ...state, isLoading: false, changes: action.response };
    case Actions.CareTeamChanges.GET_ERROR:
      return { ...state, isLoading: false, changes: [], error: action.error };
    case Actions.CareTeamChanges.SET_MESSAGE_ID:
      return { ...state, messageId: action.payload };
    default:
      return state;
  }
};
