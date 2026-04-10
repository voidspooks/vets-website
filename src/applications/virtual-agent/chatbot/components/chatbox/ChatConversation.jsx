import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  chatbotActions,
  REQUEST_STATUS,
  selectChatbotError,
  selectChatbotMessages,
  selectChatbotRequestStatus,
  selectChatbotThreadId,
} from '../../store';
import {
  useCreateThreadMutation,
  useRunThreadMutation,
} from '../../store/chatbotApi';
import ChatComposer from './ChatComposer';
import ChatMessageList from './ChatMessageList';
import ChatTypingIndicator from './ChatTypingIndicator';

const DEFAULT_ERROR_MESSAGE = 'We ran into a problem. Please try again.';

const getThreadIdFromPayload = payload => {
  return payload?.thread_id || payload?.threadId || payload?.id || null;
};

const extractAssistantMessages = data => {
  if (!data) {
    return [];
  }

  if (typeof data === 'string') {
    return [
      {
        options: [],
        text: data,
      },
    ];
  }

  if (Array.isArray(data.messages)) {
    const assistantMessages = data.messages
      .filter(
        message =>
          message?.role === 'assistant' ||
          message?.sender === 'va' ||
          message?.type === 'ai',
      )
      .map(message => {
        const text = message.text || message.content;
        if (typeof text !== 'string' || !text.trim()) {
          return null;
        }

        return {
          id: message.id,
          options: Array.isArray(message.buttons) ? message.buttons : [],
          text,
        };
      })
      .filter(Boolean);

    if (assistantMessages.length) {
      return assistantMessages;
    }
  }

  const simpleText =
    data.response ||
    data.message ||
    data.output_text ||
    data.content ||
    data.answer;

  if (typeof simpleText === 'string' && simpleText.trim()) {
    return [
      {
        options: [],
        text: simpleText,
      },
    ];
  }

  return [];
};

/**
 * Stateful chat conversation experience with message list, typing indicator, and composer.
 * @component
 * @returns {JSX.Element}
 */
export default function ChatConversation() {
  const dispatch = useDispatch();
  const messages = useSelector(selectChatbotMessages);
  const requestStatus = useSelector(selectChatbotRequestStatus);
  const errorMessage = useSelector(selectChatbotError);
  const threadId = useSelector(selectChatbotThreadId);

  const [createThread] = useCreateThreadMutation();
  const [runThread] = useRunThreadMutation();
  const hasInitializedConversationRef = React.useRef(false);

  const isTyping = requestStatus === REQUEST_STATUS.LOADING;

  const appendAssistantMessages = React.useCallback(
    runResponse => {
      const assistantMessages = extractAssistantMessages(runResponse);
      assistantMessages.forEach(assistantMessage => {
        dispatch(chatbotActions.addAssistantMessage(assistantMessage));
      });
    },
    [dispatch],
  );

  const ensureThreadId = React.useCallback(
    async () => {
      if (threadId) {
        return threadId;
      }

      const createThreadResponse = await createThread().unwrap();
      const createdThreadId = getThreadIdFromPayload(createThreadResponse);

      if (!createdThreadId) {
        throw new Error('Missing thread ID');
      }

      dispatch(chatbotActions.setChatThreadId(createdThreadId));
      return createdThreadId;
    },
    [createThread, dispatch, threadId],
  );

  const requestAssistantResponse = React.useCallback(
    async ({ includeUserMessage, messageText = '' }) => {
      const trimmedText = messageText?.trim();

      if (isTyping || (includeUserMessage && !trimmedText)) {
        return;
      }

      dispatch(chatbotActions.clearChatError());

      if (includeUserMessage) {
        dispatch(chatbotActions.addUserMessage(trimmedText));
      }

      dispatch(chatbotActions.setRequestStatus(REQUEST_STATUS.LOADING));

      try {
        const activeThreadId = await ensureThreadId();

        const runResponse = await runThread({
          message: includeUserMessage ? trimmedText : '',
          threadId: activeThreadId,
        }).unwrap();

        appendAssistantMessages(runResponse);
        dispatch(chatbotActions.setRequestStatus(REQUEST_STATUS.SUCCEEDED));
      } catch (error) {
        dispatch(chatbotActions.setRequestStatus(REQUEST_STATUS.FAILED));
        dispatch(chatbotActions.setChatError(DEFAULT_ERROR_MESSAGE));
      }
    },
    [appendAssistantMessages, dispatch, ensureThreadId, isTyping, runThread],
  );

  const handleSubmit = messageText =>
    requestAssistantResponse({
      includeUserMessage: true,
      messageText,
    });

  React.useEffect(
    () => {
      if (hasInitializedConversationRef.current) {
        return;
      }

      hasInitializedConversationRef.current = true;
      requestAssistantResponse({ includeUserMessage: false });
    },
    [requestAssistantResponse],
  );

  return (
    <div className="va-chatbot-chat-thread" data-testid="chat-conversation">
      <div className="va-chatbot-message-region">
        <ChatMessageList
          errorMessage={errorMessage}
          messages={messages}
          onOptionSelect={handleSubmit}
        />
        <ChatTypingIndicator isTyping={isTyping} />
      </div>
      <ChatComposer disabled={isTyping} onSubmit={handleSubmit} />
    </div>
  );
}
