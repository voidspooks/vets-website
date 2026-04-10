import { fireEvent, render, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { expect } from 'chai';
import { server } from 'platform/testing/unit/mocha-setup';
import {
  createPostHandler,
  jsonResponse,
  networkError,
  textResponse,
} from 'platform/testing/unit/msw-adapter';
import React from 'react';
import { Provider } from 'react-redux';

import ChatConversation from '../../../chatbot/components/chatbox/ChatConversation';
import { chatbotApi } from '../../../chatbot/store/chatbotApi';
import chatbotReducer from '../../../chatbot/store/chatbotSlice';
import { getChatbotApiBaseUrl } from '../../../chatbot/utils/chatbotApiConfig';

const CHATBOT_API_BASE_URL = getChatbotApiBaseUrl();

const streamResponse = body => {
  return textResponse(body, {
    headers: {
      'Content-Type': 'text/event-stream',
    },
    status: 200,
  });
};

const renderWithStore = ui => {
  const store = configureStore({
    reducer: {
      [chatbotApi.reducerPath]: chatbotApi.reducer,
      chatbot: chatbotReducer,
    },
    middleware: getDefaultMiddleware => {
      return getDefaultMiddleware().concat(chatbotApi.middleware);
    },
  });

  const view = render(<Provider store={store}>{ui}</Provider>);
  return {
    ...view,
    store,
  };
};

describe('ChatConversation', () => {
  it('loads the initial welcome content from the api', async () => {
    server.use(
      createPostHandler(`${CHATBOT_API_BASE_URL}/threads`, () => {
        return jsonResponse({ thread_id: 'thread-init-1' }); // eslint-disable-line camelcase
      }),
    );
    server.use(
      createPostHandler(
        `${CHATBOT_API_BASE_URL}/threads/:threadId/runs/stream`,
        () => {
          return streamResponse(
            'event: messages/complete\n' +
              'data: [{"id":"init-1","type":"ai","content":"Welcome to the VA chatbot."}]\n\n',
          );
        },
      ),
    );

    const { getByText } = renderWithStore(<ChatConversation />);

    await waitFor(() => {
      expect(getByText('Welcome to the VA chatbot.')).to.exist;
    });
  });

  it('submits a user message and appends server response', async () => {
    let runRequestCount = 0;
    server.use(
      createPostHandler(`${CHATBOT_API_BASE_URL}/threads`, () => {
        return jsonResponse({ thread_id: 'thread-111' }); // eslint-disable-line camelcase
      }),
    );
    server.use(
      createPostHandler(
        `${CHATBOT_API_BASE_URL}/threads/:threadId/runs/stream`,
        () => {
          runRequestCount += 1;
          if (runRequestCount === 1) {
            return streamResponse(
              'event: messages/complete\n' +
                'data: [{"id":"init-2","type":"ai","content":"Welcome to the VA chatbot."}]\n\n',
            );
          }

          return streamResponse(
            'event: messages/complete\n' +
              'data: [{"id":"resp-1","type":"ai","content":"You can start by signing in to VA.gov."}]\n\n',
          );
        },
      ),
    );

    const { getByTestId, getByText, queryByTestId } = renderWithStore(
      <ChatConversation />,
    );

    await waitFor(() => {
      expect(getByText('Welcome to the VA chatbot.')).to.exist;
    });

    const input = getByTestId('chat-composer-input');
    input.value = 'How do I get started?';
    fireEvent.input(input);
    fireEvent.submit(input.closest('form'));

    expect(getByText('How do I get started?')).to.exist;

    await waitFor(() => {
      expect(getByTestId('chat-typing-indicator')).to.exist;
    });

    await waitFor(() => {
      expect(getByText('You can start by signing in to VA.gov.')).to.exist;
    });

    expect(queryByTestId('chat-typing-indicator')).to.be.null;
    expect(getByTestId('chat-composer-submit').disabled).to.be.false;
  });

  it('shows an error message when server request fails', async () => {
    let runRequestCount = 0;
    server.use(
      createPostHandler(`${CHATBOT_API_BASE_URL}/threads`, () => {
        return jsonResponse({ thread_id: 'thread-222' }); // eslint-disable-line camelcase
      }),
    );
    server.use(
      createPostHandler(
        `${CHATBOT_API_BASE_URL}/threads/:threadId/runs/stream`,
        () => {
          runRequestCount += 1;
          if (runRequestCount === 1) {
            return streamResponse(
              'event: messages/complete\n' +
                'data: [{"id":"init-3","type":"ai","content":"Welcome to the VA chatbot."}]\n\n',
            );
          }

          return networkError('Network failure');
        },
      ),
    );

    const { getByTestId, getByText } = renderWithStore(<ChatConversation />);

    await waitFor(() => {
      expect(getByText('Welcome to the VA chatbot.')).to.exist;
    });

    const input = getByTestId('chat-composer-input');
    input.value = 'Need help with benefits';
    fireEvent.input(input);
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(getByText('We ran into a problem. Please try again.')).to.exist;
    });
  });

  it('renders assistant option buttons and submits selected option', async () => {
    let runRequestCount = 0;
    server.use(
      createPostHandler(`${CHATBOT_API_BASE_URL}/threads`, () => {
        return jsonResponse({ thread_id: 'thread-333' }); // eslint-disable-line camelcase
      }),
    );
    server.use(
      createPostHandler(
        `${CHATBOT_API_BASE_URL}/threads/:threadId/runs/stream`,
        () => {
          runRequestCount += 1;
          if (runRequestCount === 1) {
            return streamResponse(
              'event: messages/complete\n' +
                'data: [{"id":"msg-1","type":"ai","content":"Select from options","additional_kwargs":{"buttons":["Home Loan COE","Education COE"]}}]\n\n',
            );
          }

          return streamResponse(
            'event: messages/complete\n' +
              'data: [{"id":"msg-2","type":"ai","content":"Great, let\\u2019s talk about Home Loan COE."}]\n\n',
          );
        },
      ),
    );

    const { container, getByText } = renderWithStore(<ChatConversation />);

    await waitFor(() => {
      expect(getByText('Select from options')).to.exist;
    });

    const buttonPair = container.querySelector('va-button-pair');
    expect(buttonPair).to.exist;
    buttonPair.__events.primaryClick();

    await waitFor(() => {
      expect(getByText('Great, let\u2019s talk about Home Loan COE.')).to.exist;
    });

    expect(runRequestCount).to.equal(2);
  });
});
