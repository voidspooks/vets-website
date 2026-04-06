import React from 'react';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import sinon from 'sinon';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom-v5-compat';
import * as api from '@department-of-veterans-affairs/platform-utilities/api';

import intentsToFileReducer from '../../reducers/intents-to-file';
import IntentToFilePage from '../../containers/IntentToFilePage';
import { LINKS } from '../../constants';

const expectVaLink = (container, text, href) => {
  const link = Array.from(container.querySelectorAll('va-link')).find(
    el => el.getAttribute('text') === text,
  );
  expect(link, `va-link with text "${text}"`).to.exist;
  expect(link).to.have.attr('href', href);
  expect(link).to.not.have.attr('external');
};

const getStore = (cstIntentsToFileEnabled = true) =>
  createStore(
    combineReducers({
      featureToggles: () => ({
        // eslint-disable-next-line camelcase
        cst_intents_to_file: cstIntentsToFileEnabled,
      }),
      disability: combineReducers({
        status: combineReducers({
          intentsToFile: intentsToFileReducer,
        }),
      }),
    }),
    applyMiddleware(thunk),
  );

const renderWithRouterAtPath = (store, path = '/your-claims/intent-to-file') =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="your-claims/intent-to-file"
            element={<IntentToFilePage />}
          />
          <Route
            path="/your-claims"
            element={<div data-testid="claims-index">Claims Index</div>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

describe('<IntentToFilePage>', () => {
  let apiStub;

  beforeEach(() => {
    apiStub = sinon.stub(api, 'apiRequest');
  });

  afterEach(() => {
    apiStub.restore();
  });

  context('when cstIntentsToFile feature toggle is enabled', () => {
    context('with empty ITF response', () => {
      beforeEach(() => {
        apiStub.resolves({ data: [] });
      });

      it('should render the page heading and empty state', async () => {
        const screen = renderWithRouterAtPath(getStore(true));

        screen.getByRole('heading', {
          level: 1,
          name: 'Your intents to file',
        });
        screen.getByText(
          'If you have active intents to file (ITF) a claim for VA benefits, you can review them here.',
        );

        await waitFor(() => {
          screen.getByTestId('itf-empty-state');
        });
      });

      it('should render the "Start a new intent to file" section', async () => {
        const screen = renderWithRouterAtPath(getStore(true));

        await waitFor(() => {
          screen.getByText('Start a new intent to file');
        });

        screen.getByText(
          'You can create an intent to file if you plan to file a claim for these types of benefits:',
        );
        screen.getByText(/Disability compensation/);
        screen.getByText(/Veterans pension/);
        screen.getByText(/Dependency and Indemnity Compensation \(DIC\)/);
        screen.getByText(
          'For any of these benefits, you can submit a separate form to let us know that you intend to file a claim.',
        );
        screen.getByText(
          'If you have an accredited representative, they may also create an intent to file for you.',
        );
      });

      it('should render the informational sections', async () => {
        const screen = renderWithRouterAtPath(getStore(true));

        await waitFor(() => {
          screen.getByText(/Why can’t I find my intent to file\?/);
        });

        screen.getByText(
          /An intent to file expires 1 year after it’s recorded\./,
        );
        screen.getByText('What is an intent to file?');
        expect(screen.container.querySelector('va-need-help')).to.exist;
      });

      it('should render va-link elements with correct hrefs', async () => {
        const screen = renderWithRouterAtPath(getStore(true));

        await waitFor(() => {
          expect(screen.container.querySelectorAll('va-link')).to.have.length(
            5,
          );
        });

        expectVaLink(
          screen.container,
          'Start a claim for disability compensation online',
          LINKS.disabilityCompensationClaimIntro,
        );
        expectVaLink(
          screen.container,
          'Start an application for Veterans Pension online',
          LINKS.veteransPensionOnlineIntro,
        );
        expectVaLink(
          screen.container,
          'Submit an intent to file online',
          LINKS.intentToFileForm0966,
        );
        expectVaLink(
          screen.container,
          'Submit an intent to file (VA Form 21-0966) online',
          LINKS.intentToFileForm0966,
        );
        expectVaLink(
          screen.container,
          'Learn more about an intent to file a claim',
          LINKS.intentToFileAboutClaim,
        );
      });

      it('should render breadcrumbs', async () => {
        const screen = renderWithRouterAtPath(getStore(true));

        await waitFor(() => {
          expect(screen.container.querySelector('va-breadcrumbs')).to.exist;
        });
      });
    });

    context('with populated ITF response', () => {
      const mockItfs = [
        {
          id: '2',
          type: 'pension',
          creationDate: '2025-06-01T12:00:00.000+00:00',
          expirationDate: '2026-06-01T12:00:00.000+00:00',
          status: 'active',
        },
        {
          id: '1',
          type: 'compensation',
          creationDate: '2025-04-01T12:00:00.000+00:00',
          expirationDate: '2026-04-01T12:00:00.000+00:00',
          status: 'active',
        },
      ];

      beforeEach(() => {
        apiStub.resolves({ data: mockItfs });
      });

      it('should render ITF cards', async () => {
        const screen = renderWithRouterAtPath(getStore(true));

        await waitFor(() => {
          screen.getByTestId('itf-card-compensation');
        });
        screen.getByTestId('itf-card-pension');
      });

      it('should sort ITF cards by creation date (oldest first)', async () => {
        const screen = renderWithRouterAtPath(getStore(true));

        await waitFor(() => {
          const cards = screen.container.querySelectorAll('va-card');
          expect(cards).to.have.length(2);
        });

        const cards = screen.container.querySelectorAll('va-card');
        expect(cards[0]).to.contain.text('Disability compensation');
        expect(cards[1]).to.contain.text('Pension');
      });

      it('should not render the empty state', async () => {
        const screen = renderWithRouterAtPath(getStore(true));

        await waitFor(() => {
          screen.getByText('Disability compensation');
        });

        expect(screen.queryByTestId('itf-empty-state')).to.not.exist;
      });
    });

    context('with server error', () => {
      beforeEach(() => {
        apiStub.rejects(new Error('500'));
      });

      it('should render the error alert', async () => {
        const screen = renderWithRouterAtPath(getStore(true));

        await waitFor(() => {
          screen.getByTestId('itf-error-alert');
        });
      });

      it('should not render the empty state or cards', async () => {
        const screen = renderWithRouterAtPath(getStore(true));

        await waitFor(() => {
          screen.getByTestId('itf-error-alert');
        });

        expect(screen.queryByTestId('itf-empty-state')).to.not.exist;
        expect(screen.container.querySelectorAll('va-card')).to.have.length(0);
      });
    });
  });

  context('when cstIntentsToFile feature toggle is disabled', () => {
    beforeEach(() => {
      apiStub.resolves({ data: [] });
    });

    it('should redirect to the claims index page', () => {
      const screen = renderWithRouterAtPath(getStore(false));
      expect(screen.queryByText('Your intents to file')).to.be.null;
      screen.getByTestId('claims-index');
    });
  });
});
