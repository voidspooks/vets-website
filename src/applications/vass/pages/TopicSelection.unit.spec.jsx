import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { waitFor } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom-v5-compat';
import { renderWithStoreAndRouterV6 } from 'platform/testing/unit/react-testing-library-helpers';
import {
  mockFetch,
  resetFetch,
  setFetchJSONResponse,
  setFetchJSONFailure,
} from 'platform/testing/unit/helpers';
import { $ } from 'platform/forms-system/src/js/utilities/ui';

import TopicSelection from './TopicSelection';
import { createDefaultTopics } from '../services/mocks/utils/topic';
import { createTopicsResponse } from '../services/mocks/utils/responses';
import { createVassApiError } from '../services/mocks/utils/errors';
import { getDefaultRenderOptions, LocationDisplay } from '../utils/test-utils';
import { URLS } from '../utils/constants';
import * as authUtils from '../utils/auth';

const defaultFormState = {
  obfuscatedEmail: 's****@email.com',
  uuid: 'c0ffee-1234-beef-5678',
  lastName: 'Smith',
  dob: '1935-04-07',
};

describe('VASS Component: TopicSelection', () => {
  let getVassTokenStub;

  beforeEach(() => {
    mockFetch();
    getVassTokenStub = sinon
      .stub(authUtils, 'getVassToken')
      .returns('mock-token');
  });

  afterEach(() => {
    resetFetch();
    getVassTokenStub.restore();
  });

  const setupTopicsResponse = (topics = createDefaultTopics()) => {
    setFetchJSONResponse(
      global.fetch.onCall(0),
      createTopicsResponse({ topics }),
    );
  };

  const renderComponent = (vassFormOverrides = {}) => {
    return renderWithStoreAndRouterV6(
      <>
        <Routes>
          <Route path={URLS.TOPIC_SELECTION} element={<TopicSelection />} />
          <Route
            path={URLS.REVIEW}
            element={<div data-testid="review-page">Review</div>}
          />
        </Routes>
        <LocationDisplay />
      </>,
      {
        ...getDefaultRenderOptions({
          ...defaultFormState,
          ...vassFormOverrides,
        }),
        initialEntries: [URLS.TOPIC_SELECTION],
      },
    );
  };

  it('should render the page correctly after topics load', async () => {
    const topics = createDefaultTopics();
    setupTopicsResponse(topics);

    const screen = renderComponent();

    expect(screen.getByTestId('loading-indicator')).to.exist;

    await waitFor(() => {
      expect(screen.getByTestId('topic-checkbox-group')).to.exist;
    });

    expect(screen.getByTestId('header')).to.exist;
    expect(screen.getByTestId('header').textContent).to.contain('(*Required)');
    expect(screen.getByTestId('back-link')).to.exist;
    expect(screen.getByTestId('button-pair')).to.exist;

    topics.forEach(({ topicId, topicName }) => {
      const testId = `topic-checkbox-${topicId
        .toLowerCase()
        .replace(/\s+/g, '-')}`;
      const checkbox = screen.getByTestId(testId);
      expect(checkbox).to.exist;
      expect(checkbox).to.have.attribute('label', topicName);
    });

    const checkboxes = screen.container.querySelectorAll(
      'va-checkbox[name="topic"]',
    );
    const labels = [...checkboxes].map(cb => cb.getAttribute('label'));
    const sortedLabels = [...labels].sort((a, b) => a.localeCompare(b));
    expect(labels).to.deep.equal(sortedLabels);
  });

  it('should render empty checkbox group when API returns no topics', async () => {
    setupTopicsResponse([]);

    const screen = renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('topic-checkbox-group')).to.exist;
    });

    expect(screen.getByTestId('button-pair')).to.exist;
  });

  it('should display error alert when API returns a server error', async () => {
    setFetchJSONFailure(global.fetch.onCall(0), createVassApiError());

    const screen = renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('api-error-alert')).to.exist;
    });

    expect(screen.queryByTestId('topic-checkbox-group')).to.not.exist;
    expect(screen.queryByTestId('back-link')).to.not.exist;
  });

  it('should show validation error when continue is clicked without selecting a topic', async () => {
    setupTopicsResponse();

    const { container, getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('topic-checkbox-group')).to.exist;
    });

    $('va-button-pair', container).__events.primaryClick();

    await waitFor(() => {
      expect(
        getByTestId('topic-checkbox-group').getAttribute('error'),
      ).to.equal('Choose a topic for your appointment');
    });
  });

  it('should add a topic to selected topics when a checkbox is checked', async () => {
    const topics = createDefaultTopics(3);
    setupTopicsResponse(topics);

    const { container, getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('topic-checkbox-group')).to.exist;
    });

    const firstTopic = topics[0];
    const testId = `topic-checkbox-${firstTopic.topicId
      .toLowerCase()
      .replace(/\s+/g, '-')}`;

    $(`va-checkbox[data-testid="${testId}"]`, container).__events.vaChange({
      target: { value: firstTopic.topicId },
      detail: { checked: true },
    });

    await waitFor(() => {
      expect(getByTestId(testId)).to.have.attribute('checked', 'true');
    });
  });

  it('should remove a topic from selected topics when a checkbox is unchecked', async () => {
    const topics = createDefaultTopics(3);
    setupTopicsResponse(topics);

    const firstTopic = topics[0];
    const { container, getByTestId } = renderComponent({
      selectedTopics: [firstTopic],
    });

    await waitFor(() => {
      expect(getByTestId('topic-checkbox-group')).to.exist;
    });

    const testId = `topic-checkbox-${firstTopic.topicId
      .toLowerCase()
      .replace(/\s+/g, '-')}`;

    $(`va-checkbox[data-testid="${testId}"]`, container).__events.vaChange({
      target: { value: firstTopic.topicId },
      detail: { checked: false },
    });

    await waitFor(() => {
      expect(getByTestId(testId).getAttribute('checked')).to.not.equal('true');
    });
  });

  it('should render pre-selected topics as checked', async () => {
    const topics = createDefaultTopics(3);
    setupTopicsResponse(topics);

    const preSelected = [topics[0], topics[2]];
    const screen = renderComponent({ selectedTopics: preSelected });

    await waitFor(() => {
      expect(screen.getByTestId('topic-checkbox-group')).to.exist;
    });

    preSelected.forEach(({ topicId }) => {
      const testId = `topic-checkbox-${topicId
        .toLowerCase()
        .replace(/\s+/g, '-')}`;
      expect(screen.getByTestId(testId)).to.have.attribute('checked', 'true');
    });

    const uncheckedTopic = topics[1];
    const uncheckedTestId = `topic-checkbox-${uncheckedTopic.topicId
      .toLowerCase()
      .replace(/\s+/g, '-')}`;
    expect(
      screen.getByTestId(uncheckedTestId).getAttribute('checked'),
    ).to.not.equal('true');
  });

  it('should navigate to review page when continue is clicked with topics selected', async () => {
    const topics = createDefaultTopics(3);
    setupTopicsResponse(topics);

    const { container, getByTestId } = renderComponent({
      selectedTopics: [topics[0]],
    });

    await waitFor(() => {
      expect(getByTestId('topic-checkbox-group')).to.exist;
    });

    $('va-button-pair', container).__events.primaryClick();

    await waitFor(() => {
      expect(getByTestId('location-display').textContent).to.equal(URLS.REVIEW);
    });
  });

  it('should not navigate when continue is clicked without topics selected', async () => {
    setupTopicsResponse();

    const { container, getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('topic-checkbox-group')).to.exist;
    });

    $('va-button-pair', container).__events.primaryClick();

    await waitFor(() => {
      expect(getByTestId('location-display').textContent).to.equal(
        URLS.TOPIC_SELECTION,
      );
    });
  });

  it('should clear validation error when a topic is selected after failed submit', async () => {
    const topics = createDefaultTopics(3);
    setupTopicsResponse(topics);

    const { container, getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('topic-checkbox-group')).to.exist;
    });

    $('va-button-pair', container).__events.primaryClick();

    await waitFor(() => {
      expect(
        getByTestId('topic-checkbox-group').getAttribute('error'),
      ).to.equal('Choose a topic for your appointment');
    });

    const firstTopic = topics[0];
    const testId = `topic-checkbox-${firstTopic.topicId
      .toLowerCase()
      .replace(/\s+/g, '-')}`;

    $(`va-checkbox[data-testid="${testId}"]`, container).__events.vaChange({
      target: { value: firstTopic.topicId },
      detail: { checked: true },
    });

    await waitFor(() => {
      expect(
        getByTestId('topic-checkbox-group').getAttribute('error'),
      ).to.equal('');
    });
  });

  it('should allow selecting multiple topics', async () => {
    const topics = createDefaultTopics(3);
    setupTopicsResponse(topics);

    const { container, getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('topic-checkbox-group')).to.exist;
    });

    topics.forEach(topic => {
      const testId = `topic-checkbox-${topic.topicId
        .toLowerCase()
        .replace(/\s+/g, '-')}`;
      $(`va-checkbox[data-testid="${testId}"]`, container).__events.vaChange({
        target: { value: topic.topicId },
        detail: { checked: true },
      });
    });

    await waitFor(() => {
      topics.forEach(({ topicId }) => {
        const testId = `topic-checkbox-${topicId
          .toLowerCase()
          .replace(/\s+/g, '-')}`;
        expect(getByTestId(testId)).to.have.attribute('checked', 'true');
      });
    });
  });
});
