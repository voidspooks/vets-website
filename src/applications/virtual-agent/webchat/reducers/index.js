import { chatbotApi, chatbotReducer } from '../../chatbot/store';

export const ACCEPTED = 'ACCEPTED';

const initialState = {
  termsAccepted: false,
};

const virtualAgentReducer = (state = initialState, action) => {
  if (action.type === ACCEPTED) {
    return {
      ...state,
      termsAccepted: true,
    };
  }
  return {
    ...state,
  };
};

export default {
  [chatbotApi.reducerPath]: chatbotApi.reducer,
  chatbot: chatbotReducer,
  virtualAgentData: virtualAgentReducer,
};
