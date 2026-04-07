import React, { useEffect, useRef, useState } from 'react';

import ChatComposer from './ChatComposer';
import ChatMessageList from './ChatMessageList';
import ChatTypingIndicator from './ChatTypingIndicator';

export const SIMULATED_RESPONSE_DELAY_MS = 1500;

const STARTING_MESSAGES = [
  {
    id: 'welcome',
    sender: 'va',
    text:
      "Welcome to the VA chatbot. I'm here to help with general questions about VA benefits and services.",
  },
];

const SIMULATED_BOT_MESSAGE =
  'Thanks for your message. This is a static response while backend integration is still in progress.';

/**
 * Stateful chat conversation experience with message list, typing indicator, and composer.
 * @component
 * @returns {JSX.Element}
 */
export default function ChatConversation() {
  const [messages, setMessages] = useState(STARTING_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSubmit = messageText => {
    const timestamp = Date.now();

    setMessages(previousMessages => {
      return [
        ...previousMessages,
        {
          id: `user-${timestamp}`,
          sender: 'user',
          text: messageText,
        },
      ];
    });

    setIsTyping(true);

    timerRef.current = setTimeout(() => {
      setMessages(previousMessages => {
        return [
          ...previousMessages,
          {
            id: `va-${Date.now()}`,
            sender: 'va',
            text: SIMULATED_BOT_MESSAGE,
          },
        ];
      });
      setIsTyping(false);
    }, SIMULATED_RESPONSE_DELAY_MS);
  };

  return (
    <div className="va-chatbot-chat-thread" data-testid="chat-conversation">
      <div className="va-chatbot-message-region">
        <ChatMessageList messages={messages} />
        <ChatTypingIndicator isTyping={isTyping} />
      </div>
      <ChatComposer disabled={isTyping} onSubmit={handleSubmit} />
    </div>
  );
}
