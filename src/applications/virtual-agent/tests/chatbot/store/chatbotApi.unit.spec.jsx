import { configureStore } from '@reduxjs/toolkit';
import { expect } from 'chai';
import { server } from 'platform/testing/unit/mocha-setup';
import {
  createPostHandler,
  jsonResponse,
  textResponse,
} from 'platform/testing/unit/msw-adapter';

import { chatbotApi } from '../../../chatbot/store/chatbotApi';
import { getChatbotApiBaseUrl } from '../../../chatbot/utils/chatbotApiConfig';
import chatbotReducer from '../../../chatbot/store/chatbotSlice';

const CHATBOT_API_BASE_URL = getChatbotApiBaseUrl();

const getRequestUrl = request => {
  if (typeof request.url === 'string') {
    return request.url;
  }

  return request.url?.href || request.url?.toString?.() || '';
};

const readRequestBody = async request => {
  if (request.body !== undefined) {
    return request.body;
  }

  if (typeof request.json === 'function') {
    return request.json();
  }

  return {};
};

describe('chatbotApi', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        [chatbotApi.reducerPath]: chatbotApi.reducer,
        chatbot: chatbotReducer,
      },
      middleware: getDefaultMiddleware => {
        return getDefaultMiddleware().concat(chatbotApi.middleware);
      },
    });
  });

  it('createThread endpoint posts to /threads', async () => {
    let capturedRequest;
    server.use(
      createPostHandler(`${CHATBOT_API_BASE_URL}/threads`, ({ request }) => {
        capturedRequest = request;
        return jsonResponse({ thread_id: 'thread-1' }); // eslint-disable-line camelcase
      }),
    );

    await store.dispatch(chatbotApi.endpoints.createThread.initiate());
    expect(capturedRequest).to.exist;
    expect(getRequestUrl(capturedRequest)).to.match(/\/threads$/);
    expect(capturedRequest.method).to.equal('POST');
  });

  it('runThread endpoint posts message payload to /threads/:id/runs/stream', async () => {
    let capturedRequest;
    server.use(
      createPostHandler(
        `${CHATBOT_API_BASE_URL}/threads/:threadId/runs/stream`,
        ({ request }) => {
          capturedRequest = request;
          return textResponse(
            `event: values\ndata: {"messages":[{"id":"m1","type":"ai","content":"Streamed reply"}]}\n\n`,
            {
              headers: {
                'Content-Type': 'text/event-stream',
              },
              status: 200,
            },
          );
        },
      ),
    );

    const result = await store
      .dispatch(
        chatbotApi.endpoints.runThread.initiate({
          message: 'Hello',
          threadId: 'thread-abc',
        }),
      )
      .unwrap();
    expect(capturedRequest).to.exist;
    expect(getRequestUrl(capturedRequest)).to.match(
      /\/threads\/thread-abc\/runs\/stream$/,
    );
    expect(capturedRequest.method).to.equal('POST');
    expect(result.response).to.equal('Streamed reply');

    const requestBody = await readRequestBody(capturedRequest);
    expect(requestBody).to.deep.equal({
      config: {
        configurable: {},
      },
      input: {
        messages: [
          {
            content: 'Hello',
            type: 'human',
          },
        ],
      },
    });
  });

  it('runThread supports initialization payload without a user message', async () => {
    let capturedRequest;
    server.use(
      createPostHandler(
        `${CHATBOT_API_BASE_URL}/threads/:threadId/runs/stream`,
        ({ request }) => {
          capturedRequest = request;
          return textResponse('event: values\ndata: {"messages":[]}\n\n', {
            headers: {
              'Content-Type': 'text/event-stream',
            },
            status: 200,
          });
        },
      ),
    );

    await store
      .dispatch(
        chatbotApi.endpoints.runThread.initiate({
          message: '',
          threadId: 'thread-init',
        }),
      )
      .unwrap();

    const requestBody = await readRequestBody(capturedRequest);
    expect(requestBody).to.deep.equal({
      config: {
        configurable: {},
      },
      input: {
        messages: [],
      },
    });
  });

  it('runThread parses assistant buttons from SSE messages/complete events', async () => {
    server.use(
      createPostHandler(
        `${CHATBOT_API_BASE_URL}/threads/:threadId/runs/stream`,
        () => {
          return textResponse(
            'event: messages/complete\n' +
              'data: [{"id":"m2","type":"ai","content":"Pick one","additional_kwargs":{"buttons":["A","B"]}}]\n\n',
            {
              headers: {
                'Content-Type': 'text/event-stream',
              },
              status: 200,
            },
          );
        },
      ),
    );

    const result = await store
      .dispatch(
        chatbotApi.endpoints.runThread.initiate({
          message: 'help',
          threadId: 'thread-buttons',
        }),
      )
      .unwrap();

    expect(result.messages).to.deep.equal([
      {
        buttons: ['A', 'B'],
        content: 'Pick one',
        id: 'm2',
        type: 'ai',
      },
    ]);
    expect(result.response).to.equal('Pick one');
  });
});
