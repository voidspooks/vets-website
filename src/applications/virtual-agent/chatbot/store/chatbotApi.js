import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getChatbotApiBaseUrl } from '../utils/chatbotApiConfig';

const extractAssistantMessages = payload => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .filter(
      message => message?.type === 'ai' && typeof message?.content === 'string',
    )
    .map(message => ({
      buttons: Array.isArray(message?.additional_kwargs?.buttons)
        ? message.additional_kwargs.buttons.filter(
            button => typeof button === 'string',
          )
        : [],
      content: message.content,
      id: message.id,
      type: message.type,
    }));
};

const parseRunStreamResponse = rawBody => {
  if (!rawBody || typeof rawBody !== 'string') {
    return {
      messages: [],
      response: null,
    };
  }

  const assistantMessages = [];
  const completeAssistantMessages = [];
  const seenMessageIds = new Set();

  const pushAssistantMessages = messages => {
    messages.forEach(message => {
      const messageKey = message.id || message.content;
      if (!messageKey || seenMessageIds.has(messageKey)) {
        return;
      }

      seenMessageIds.add(messageKey);
      assistantMessages.push(message);
    });
  };

  const eventBlocks = rawBody.split(/\n\n+/);

  eventBlocks.forEach(block => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) {
      return;
    }

    const lines = trimmedBlock.split('\n');
    const eventName = lines
      .find(line => line.startsWith('event:'))
      ?.replace(/^event:\s*/, '')
      .trim();

    const dataLines = lines
      .filter(line => line.startsWith('data:'))
      .map(line => line.replace(/^data:\s*/, ''));

    if (!dataLines.length) {
      return;
    }

    const jsonData = dataLines.join('\n');

    try {
      const parsed = JSON.parse(jsonData);

      if (eventName === 'values') {
        pushAssistantMessages(extractAssistantMessages(parsed?.messages));
      }

      if (eventName === 'messages/complete') {
        const completeMessages = extractAssistantMessages(parsed);
        completeAssistantMessages.push(...completeMessages);
        pushAssistantMessages(completeMessages);
      }
    } catch (error) {
      // Ignore malformed event payloads and continue parsing.
    }
  });

  if (!assistantMessages.length) {
    try {
      const parsed = JSON.parse(rawBody);
      const fallbackResponse =
        parsed?.response ||
        parsed?.message ||
        parsed?.output_text ||
        parsed?.content ||
        null;

      return {
        messages: extractAssistantMessages(parsed?.messages || []).slice(-1),
        response: fallbackResponse,
      };
    } catch (error) {
      // Ignore JSON fallback parsing errors.
    }
  }

  const dedupedCompleteMessages = completeAssistantMessages.filter(message => {
    const key = message.id || message.content;
    if (!key) {
      return false;
    }

    if (seenMessageIds.has(`complete:${key}`)) {
      return false;
    }

    seenMessageIds.add(`complete:${key}`);
    return true;
  });

  const parsedMessages = dedupedCompleteMessages.length
    ? dedupedCompleteMessages
    : assistantMessages.slice(-1);

  return {
    messages: parsedMessages,
    response: parsedMessages[parsedMessages.length - 1]?.content || null,
  };
};

export const chatbotApi = createApi({
  reducerPath: 'chatbotApi',
  baseQuery: fetchBaseQuery({ baseUrl: getChatbotApiBaseUrl() }),
  endpoints: builder => ({
    createThread: builder.mutation({
      query: () => ({
        method: 'POST',
        url: '/threads',
      }),
    }),
    runThread: builder.mutation({
      queryFn: async (
        { message, threadId },
        _api,
        _extraOptions,
        baseQuery,
      ) => {
        const normalizedMessage =
          typeof message === 'string' ? message.trim() : '';

        const result = await baseQuery({
          body: {
            config: {
              configurable: {},
            },
            input: {
              messages: normalizedMessage
                ? [
                    {
                      content: normalizedMessage,
                      type: 'human',
                    },
                  ]
                : [],
            },
          },
          method: 'POST',
          responseHandler: 'text',
          url: `/threads/${threadId}/runs/stream`,
        });

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: parseRunStreamResponse(result.data),
        };
      },
    }),
  }),
});

export const { useCreateThreadMutation, useRunThreadMutation } = chatbotApi;
