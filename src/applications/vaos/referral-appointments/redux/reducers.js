import {
  SET_FORM_CURRENT_PAGE,
  SET_INIT_REFERRAL_FLOW,
  SET_PROVIDER_SLOTS_PARAMS,
  SET_SELECTED_PROVIDER_ID,
  SET_SELECTED_SLOT_START_TIME,
} from './actions';
import { FETCH_STATUS } from '../../utils/constants';

const initialState = {
  facility: null,
  sortProviderBy: '',
  currentPage: null,
  referrals: [],
  referralDetails: [],
  selectedSlotStartTime: '',
  selectedProviderId: null,
  providerSlotsParams: null,
  referralsFetchStatus: FETCH_STATUS.notStarted,
  referralFetchStatus: FETCH_STATUS.notStarted,
};

function ccAppointmentReducer(state = initialState, action) {
  switch (action.type) {
    case SET_FORM_CURRENT_PAGE:
      return {
        ...state,
        currentPage: action.payload,
      };
    case SET_SELECTED_SLOT_START_TIME:
      return {
        ...state,
        selectedSlotStartTime: action.payload,
      };
    case SET_SELECTED_PROVIDER_ID:
      return {
        ...state,
        selectedProviderId: action.payload,
      };
    case SET_PROVIDER_SLOTS_PARAMS:
      return {
        ...state,
        providerSlotsParams: action.payload,
      };
    case SET_INIT_REFERRAL_FLOW:
      return {
        ...state,
        provider: {},
        appointmentCreateStatus: FETCH_STATUS.notStarted,
        appointmentInfoTimeout: false,
        appointmentInfoError: false,
        appointmentInfoLoading: false,
        pollingRequestStart: null,
        referralAppointmentInfo: {},
        referralsFetchStatus: FETCH_STATUS.notStarted,
        referralFetchStatus: FETCH_STATUS.notStarted,
        selectedSlotStartTime: '',
        selectedProviderId: null,
        providerSlotsParams: null,
      };
    default:
      return state;
  }
}

export default ccAppointmentReducer;
