import React from 'react';
import { expect } from 'chai';
import { cleanup, fireEvent } from '@testing-library/react';
import { waitForElementToBeRemoved, waitFor } from '@testing-library/dom';
import sinon from 'sinon';
import environment from '@department-of-veterans-affairs/platform-utilities/environment';
import {
  createGetHandler,
  jsonResponse,
} from 'platform/testing/unit/msw-adapter';
import { server } from 'platform/testing/unit/mocha-setup';
import ProviderSelection from './ProviderSelection';
import {
  renderWithStoreAndRouter,
  createTestStore,
} from '../../tests/mocks/setup';
import { createReferralById } from '../utils/referrals';
import { createMockProvidersResponse } from '../utils/mocks';
import { vaosApi } from '../../redux/api/vaosApi';

describe('VAOS Page: ProviderSelection', () => {
  const referral = createReferralById('2024-09-09', 'test-uuid-123');
  const referralId = referral.attributes.uuid;
  const page1Response = createMockProvidersResponse({
    page: 1,
    perPage: 5,
    totalEntries: 8,
  });

  const initialState = {
    featureToggles: {
      vaOnlineSchedulingCCDirectScheduling: true,
    },
  };

  const providersUrl = `${
    environment.API_URL
  }/vaos/v2/referrals/${referralId}/providers`;

  beforeEach(() => {
    global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();
    server.use(
      createGetHandler(providersUrl, () => jsonResponse(page1Response)),
    );
  });

  afterEach(async () => {
    await cleanup();
    server.resetHandlers();
    vaosApi.util.resetApiState();
  });

  it('should render the heading', async () => {
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(
      <ProviderSelection currentReferral={referral} />,
      { store },
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId('loading-container'),
    );
    expect(screen.getByTestId('referral-layout-heading')).to.exist;
    expect(screen.getByTestId('referral-layout-heading').textContent).to.equal(
      'Which provider do you want to schedule with?',
    );
  });

  it('should render the eyebrow text', async () => {
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(
      <ProviderSelection currentReferral={referral} />,
      { store },
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId('loading-container'),
    );
    expect(screen.getByText('New Appointment')).to.exist;
  });

  it('should render provider cards from API data', async () => {
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(
      <ProviderSelection currentReferral={referral} />,
      { store },
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId('loading-container'),
    );
    const cards = screen.getAllByTestId('provider-selection-card');
    expect(cards.length).to.equal(5);
  });

  it('should render the show more providers button with correct remaining count', async () => {
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(
      <ProviderSelection currentReferral={referral} />,
      { store },
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId('loading-container'),
    );
    const button = screen.getByTestId('show-more-providers-button');
    expect(button).to.exist;
    expect(button.getAttribute('text')).to.equal('Show 3 more providers');
  });

  it('should fetch next page and append providers on show more click', async () => {
    const page2Response = createMockProvidersResponse({
      page: 2,
      perPage: 5,
      totalEntries: 8,
    });

    let requestCount = 0;
    server.resetHandlers();
    server.use(
      createGetHandler(providersUrl, () => {
        requestCount += 1;
        if (requestCount <= 1) {
          return jsonResponse(page1Response);
        }
        return jsonResponse(page2Response);
      }),
    );

    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(
      <ProviderSelection currentReferral={referral} />,
      { store },
    );

    await waitForElementToBeRemoved(() =>
      screen.queryByTestId('loading-container'),
    );

    const button = screen.getByTestId('show-more-providers-button');
    fireEvent.click(button);

    await waitFor(() => {
      const cards = screen.getAllByTestId('provider-selection-card');
      expect(cards.length).to.equal(8);
    });
  });

  it('should hide show more button when all providers are loaded', async () => {
    const allLoadedResponse = createMockProvidersResponse({
      page: 1,
      perPage: 5,
      totalEntries: 5,
    });

    server.resetHandlers();
    server.use(
      createGetHandler(providersUrl, () => jsonResponse(allLoadedResponse)),
    );

    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(
      <ProviderSelection currentReferral={referral} />,
      { store },
    );

    await waitForElementToBeRemoved(() =>
      screen.queryByTestId('loading-container'),
    );

    expect(screen.queryByTestId('show-more-providers-button')).to.be.null;
  });

  it('should render the "different provider" section', async () => {
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(
      <ProviderSelection currentReferral={referral} />,
      { store },
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId('loading-container'),
    );
    expect(screen.getByTestId('different-provider-section')).to.exist;
    expect(screen.getByTestId('referral-community-care-office')).to.exist;
  });

  it('should show loading state while fetching providers', () => {
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(
      <ProviderSelection currentReferral={referral} />,
      { store },
    );
    expect(screen.getByTestId('loading-container')).to.exist;
  });

  it('should show error state when API fails', async () => {
    server.resetHandlers();
    server.use(
      createGetHandler(providersUrl, () =>
        jsonResponse(
          { error: { status: 500, message: 'Server error' } },
          { status: 500 },
        ),
      ),
    );

    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(
      <ProviderSelection currentReferral={referral} />,
      { store },
    );

    await waitForElementToBeRemoved(() =>
      screen.queryByTestId('loading-container'),
    );

    expect(screen.getByTestId('error')).to.exist;
  });

  it('should call API with page and perPage params and render providers on success', async () => {
    let capturedUrl = null;

    server.resetHandlers();
    server.use(
      createGetHandler(providersUrl, ({ request }) => {
        capturedUrl = request.url || request.path;
        return jsonResponse(page1Response);
      }),
    );

    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(
      <ProviderSelection currentReferral={referral} />,
      { store },
    );

    await waitForElementToBeRemoved(() =>
      screen.queryByTestId('loading-container'),
    );

    const cards = screen.getAllByTestId('provider-selection-card');
    expect(cards.length).to.equal(5);
    const urlString = String(capturedUrl);
    expect(urlString).to.include('page=1');
    expect(urlString).to.include('perPage=5');
  });

  it('should display facility contact info from referral data', async () => {
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(
      <ProviderSelection currentReferral={referral} />,
      { store },
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId('loading-container'),
    );
    expect(
      screen.getByTestId('different-provider-section').textContent,
    ).to.include('(585) 297-1000');
  });
});
