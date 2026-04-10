import { createSlice } from '@reduxjs/toolkit';
/* eslint-disable no-param-reassign */
// ^ we are using immer under the hood which allows us to "mutate" state so this is safe to disable
// https://redux-toolkit.js.org/usage/immer-reducers

export const REQUEST_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
};

const DEFAULT_ERROR_MESSAGE = 'We ran into a problem. Please try again.';

/**
 * @typedef {Object} ChatbotState
 * @property {boolean} hasAcceptedDisclaimer
 * @property {string | null} threadId
 * @property {{ id: string, sender: 'user' | 'va', text: string, options?: string[] }[]} messages
 * @property {'idle'|'loading'|'succeeded'|'failed'} requestStatus
 * @property {string | null} error
 */

/** @type {ChatbotState} */
const initialState = {
  hasAcceptedDisclaimer: false,
  threadId: null,
  messages: [],
  requestStatus: REQUEST_STATUS.IDLE,
  error: null,
};

const createMessageId = prefix => `${prefix}-${Date.now()}-${Math.random()}`;

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    acceptDisclaimer: state => {
      state.hasAcceptedDisclaimer = true;
    },
    addUserMessage: (state, action) => {
      state.messages.push({
        id: createMessageId('user'),
        sender: 'user',
        text: action.payload,
      });
    },
    addAssistantMessage: (state, action) => {
      if (!action.payload) {
        return;
      }

      const payload =
        typeof action.payload === 'string'
          ? {
              options: [],
              text: action.payload,
            }
          : action.payload;

      if (!payload?.text) {
        return;
      }

      state.messages.push({
        id: payload.id || createMessageId('va'),
        options: payload.options || [],
        sender: 'va',
        text: payload.text,
      });
    },
    setChatThreadId: (state, action) => {
      state.threadId = action.payload;
    },
    setRequestStatus: (state, action) => {
      state.requestStatus = action.payload;
    },
    setChatError: (state, action) => {
      state.error = action.payload || DEFAULT_ERROR_MESSAGE;
    },
    clearChatError: state => {
      state.error = null;
    },
  },
});

const selectChatbotState = state => state.chatbot || initialState;

export const selectChatbotHasAcceptedDisclaimer = state =>
  selectChatbotState(state).hasAcceptedDisclaimer;

export const selectChatbotMessages = state =>
  selectChatbotState(state).messages;

export const selectChatbotRequestStatus = state =>
  selectChatbotState(state).requestStatus;

export const selectChatbotError = state => selectChatbotState(state).error;

export const selectChatbotThreadId = state =>
  selectChatbotState(state).threadId;

export const chatbotActions = chatbotSlice.actions;

export default chatbotSlice.reducer;
