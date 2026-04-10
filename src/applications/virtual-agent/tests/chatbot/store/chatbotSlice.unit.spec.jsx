import { expect } from 'chai';

import chatbotReducer, {
  chatbotActions,
  REQUEST_STATUS,
  selectChatbotError,
  selectChatbotHasAcceptedDisclaimer,
  selectChatbotMessages,
  selectChatbotRequestStatus,
  selectChatbotThreadId,
} from '../../../chatbot/store/chatbotSlice';

describe('chatbotSlice', () => {
  it('returns the initial state when state is undefined', () => {
    const state = chatbotReducer(undefined, { type: 'UNKNOWN' });

    expect(state.hasAcceptedDisclaimer).to.equal(false);
    expect(state.threadId).to.equal(null);
    expect(state.requestStatus).to.equal(REQUEST_STATUS.IDLE);
    expect(state.error).to.equal(null);
    expect(state.messages).to.have.lengthOf(0);
  });

  it('sets hasAcceptedDisclaimer to true when acceptDisclaimer is dispatched', () => {
    const state = chatbotReducer(undefined, chatbotActions.acceptDisclaimer());

    expect(state.hasAcceptedDisclaimer).to.equal(true);
  });

  it('adds user and assistant messages', () => {
    let state = chatbotReducer(
      undefined,
      chatbotActions.addUserMessage('Hello'),
    );
    state = chatbotReducer(
      state,
      chatbotActions.addAssistantMessage('Hi there'),
    );

    expect(state.messages).to.have.lengthOf(2);
    expect(state.messages[0].sender).to.equal('user');
    expect(state.messages[0].text).to.equal('Hello');
    expect(state.messages[1].sender).to.equal('va');
    expect(state.messages[1].text).to.equal('Hi there');
  });

  it('sets and clears request status / error / thread id', () => {
    let state = chatbotReducer(
      undefined,
      chatbotActions.setRequestStatus(REQUEST_STATUS.LOADING),
    );
    state = chatbotReducer(state, chatbotActions.setChatError('Oops'));
    state = chatbotReducer(state, chatbotActions.setChatThreadId('thread-1'));

    expect(state.requestStatus).to.equal(REQUEST_STATUS.LOADING);
    expect(state.error).to.equal('Oops');
    expect(state.threadId).to.equal('thread-1');

    state = chatbotReducer(state, chatbotActions.clearChatError());
    expect(state.error).to.equal(null);
  });

  it('selectors return fallback values when state is missing', () => {
    const state = {};

    expect(selectChatbotHasAcceptedDisclaimer(state)).to.equal(false);
    expect(selectChatbotThreadId(state)).to.equal(null);
    expect(selectChatbotRequestStatus(state)).to.equal(REQUEST_STATUS.IDLE);
    expect(selectChatbotError(state)).to.equal(null);
    expect(selectChatbotMessages(state)).to.have.lengthOf(0);
  });
});
