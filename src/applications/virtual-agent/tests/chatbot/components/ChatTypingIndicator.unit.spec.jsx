import { render } from '@testing-library/react';
import { expect } from 'chai';
import React from 'react';

import ChatTypingIndicator from '../../../chatbot/components/chatbox/ChatTypingIndicator';

describe('ChatTypingIndicator', () => {
  it('does not render when isTyping is false', () => {
    const { queryByTestId } = render(<ChatTypingIndicator isTyping={false} />);

    expect(queryByTestId('chat-typing-indicator')).to.be.null;
  });

  it('renders typing status and dots when isTyping is true', () => {
    const { getByTestId, getByText } = render(
      <ChatTypingIndicator isTyping label="Assistant typing" />,
    );

    expect(getByTestId('chat-typing-indicator')).to.exist;
    expect(getByText('Assistant typing')).to.exist;
  });
});
