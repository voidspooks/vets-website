/* eslint-disable camelcase */
import { expect } from 'chai';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, waitFor, cleanup } from '@testing-library/react';
import {
  createGetHandler,
  jsonResponse,
} from 'platform/testing/unit/msw-adapter';
import { server } from 'platform/testing/unit/mocha-setup';
import { Router, Route, createMemoryHistory } from 'react-router';
import InboxPage from '../../containers/InboxPage';
import { ENDPOINTS } from '../../utils/api';

describe('<InboxPage />', () => {
  // TODO delete after new inbox goes live
  /**
   * @param {Object} props
   * @param {boolean} [props.togglesAreLoading]
   * @param {boolean} [props.useNewInbox]
   */
  function renderWithStore({ togglesAreLoading, useNewInbox } = {}) {
    /**
     * Custom type needed for v3 of History, since @types/history is v4
     * @type {{
     *   getCurrentLocation: () => { pathname: string, search: string, hash: string, state: any },
     *   push: (path: string) => void,
     *   replace: (path: string) => void,
     *   listen: (listener: Function) => Function,
     * }}
     * */
    const history = createMemoryHistory();
    history.push('/inbox');

    const store = configureStore({
      reducer: state => state,
      preloadedState: {
        featureToggles: {
          ask_va_enhanced_inbox: useNewInbox,
          loading: togglesAreLoading,
        },
      },
    });

    return {
      store,
      history,
      view: render(
        <Provider store={store}>
          <Router history={history}>
            <Route path="/inbox" component={InboxPage} />
            <Route path="/" render={() => <div>Mock homepage</div>} />
          </Router>
        </Provider>,
      ),
    };
  }

  beforeEach(() => {
    server.use(
      createGetHandler(ENDPOINTS.inquiries, () => {
        return jsonResponse(
          {
            data: [
              {
                id: '1',
                attributes: {
                  inquiryNumber: 'A-1',
                  status: 'In Progress',
                  categoryName: 'Benefits',
                  createdOn: '01/01/2024 12:00:00 PM',
                  lastUpdate: '01/01/2024 12:00:00 PM',
                  submitterQuestion: 'Personal question',
                  levelOfAuthentication: 'Personal',
                },
              },
            ],
          },
          { status: 200 },
        );
      }),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('shows a loading spinner when feature toggle is LOADING', async () => {
    const { view, history } = renderWithStore({ togglesAreLoading: true });

    expect(history.getCurrentLocation().pathname).to.equal('/inbox');

    await waitFor(() => {
      const inboxHeading = view.queryByRole('heading');
      expect(inboxHeading).to.not.exist;
      expect(view.container.querySelector('va-loading-indicator')).to.exist;
    });
  });

  // TODO delete after new inbox goes live
  it('redirects to landing page when feature toggle is OFF', async () => {
    const { view, history } = renderWithStore({
      togglesAreLoading: false,
      useNewInbox: false,
    });

    // Ideally, we'd be asserting what the UI renders, but until we move to v5 of React Router,
    // it's the only way I've found to assert that the route changed in v3.
    expect(history.getCurrentLocation().pathname).to.equal('/');
    await waitFor(() => {
      expect(
        view.queryByRole('heading', {
          name: /your ask va inbox/i,
        }),
      ).to.not.exist;
      expect(view.container.querySelector('va-loading-indicator')).to.not.exist;
    });
  });

  it('renders the new inbox when feature toggle is ON', async () => {
    const { view, history } = renderWithStore({
      togglesAreLoading: false,
      useNewInbox: true,
    });

    expect(history.getCurrentLocation().pathname).to.equal('/inbox');

    const heading = await view.findByRole('heading', {
      name: /your ask va inbox/i,
    });

    expect(heading.tagName).to.equal('H2');
  });
});
