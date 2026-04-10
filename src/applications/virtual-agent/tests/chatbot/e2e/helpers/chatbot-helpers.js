/**
 * E2E test helpers for the VA Virtual Agent Chatbot
 */

import featureToggles from '../fixtures/mocks/feature-toggles.json';

/**
 * Mocks the feature toggles required for the virtual agent chatbot.
 * Call this in beforeEach() before visiting the page.
 *
 * @returns {void}
 *
 * @example
 * beforeEach(() => {
 *   mockFeatureToggles();
 * });
 */
export const mockFeatureToggles = () => {
  cy.intercept('GET', '/v0/feature_toggles*', featureToggles).as(
    'mockFeatures',
  );
};

/**
 * Mocks chatbot thread and response endpoints for v2 chatbot interactions.
 * @param {Object} [options]
 * @param {Record<string, { body: string, isStream?: boolean, statusCode?: number, delay?: number }>} [options.userResponsesByMessage]
 * @returns {void}
 */
export const mockChatbotApi = (options = {}) => {
  const { userResponsesByMessage = {} } = options;

  cy.intercept('POST', '/threads', {
    body: {
      // eslint-disable-next-line camelcase
      thread_id: 'thread-e2e-1',
    },
    statusCode: 200,
  }).as('createThread');

  cy.intercept('POST', '/threads/*/runs/stream', req => {
    const requestMessages = req.body?.input?.messages || [];

    expect(req.body?.config?.configurable).to.deep.equal({});

    if (requestMessages.length === 0) {
      req.alias = 'runThreadInit';

      req.reply({
        body:
          'event: messages/complete\n' +
          'data: [{"id":"init-e2e-1","type":"ai","content":"Welcome to the VA chatbot."}]\n\n',
        headers: {
          'content-type': 'text/event-stream',
        },
        statusCode: 200,
      });
      return;
    }

    req.alias = 'runThreadUser';
    expect(requestMessages).to.have.length(1);
    expect(requestMessages[0]?.type).to.equal('human');
    expect(requestMessages[0]?.content).to.be.a('string');
    expect(requestMessages[0]?.content?.trim()).to.not.equal('');

    const userMessage = requestMessages[0].content;
    const configuredUserResponse = userResponsesByMessage[userMessage];

    if (configuredUserResponse) {
      req.reply({
        body: configuredUserResponse.body,
        delay: configuredUserResponse.delay ?? 250,
        headers: configuredUserResponse.isStream
          ? {
              'content-type': 'text/event-stream',
            }
          : undefined,
        statusCode: configuredUserResponse.statusCode ?? 200,
      });
      return;
    }

    req.reply({
      body: {
        response: 'This is an e2e mocked chatbot response.',
      },
      delay: 250,
      statusCode: 200,
    });
  });
};
