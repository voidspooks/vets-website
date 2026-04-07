import { fireEvent, render } from '@testing-library/react';
import { expect } from 'chai';
import React from 'react';
import sinon from 'sinon';

import ChatConversation, {
  SIMULATED_RESPONSE_DELAY_MS,
} from '../../../chatbot/components/chatbox/ChatConversation';

describe('ChatConversation', () => {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'Date'],
    });
  });

  afterEach(() => {
    clock.restore();
  });

  it('renders a welcome message', () => {
    const { getByText } = render(<ChatConversation />);

    expect(
      getByText(
        "Welcome to the VA chatbot. I'm here to help with general questions about VA benefits and services.",
      ),
    ).to.exist;
  });

  it('submits user message, shows typing indicator, and appends static response', () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <ChatConversation />,
    );

    const input = getByTestId('chat-composer-input');
    input.value = 'How do I get started?';
    fireEvent.input(input);
    fireEvent.submit(input.closest('form'));

    expect(getByText('How do I get started?')).to.exist;
    expect(getByTestId('chat-typing-indicator')).to.exist;
    expect(getByTestId('chat-composer-submit').disabled).to.be.true;

    clock.tick(SIMULATED_RESPONSE_DELAY_MS);

    expect(queryByTestId('chat-typing-indicator')).to.be.null;
    expect(
      getByText(
        'Thanks for your message. This is a static response while backend integration is still in progress.',
      ),
    ).to.exist;
    expect(getByTestId('chat-composer-submit').disabled).to.be.false;
  });
});
