import { expect } from 'chai';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { I18nextProvider } from 'react-i18next';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import i18nCombinedDebtPortal from '../../../i18n';
import eng from '../../../eng.json';
import ResolvePage from '../../containers/ResolvePage';

const RESOLVE_PAGE_ERROR = eng['combined-debt-portal'].mcp['resolve-page'];

/**
 * Container tests: ResolvePage wiring (route + Redux → whether a copay detail
 * request is triggered on mount). For `getCopayDetailStatement` API/init/success/failure,
 * see combined/tests/unit/actionsCopays.unit.spec.jsx.
 */
const registerMockElement = name => {
  class MockWebComponent extends HTMLElement {}
  if (!window.customElements.get(name)) {
    window.customElements.define(name, MockWebComponent);
  }
};

const renderWithStore = (component, initialState) => {
  const store = createStore(
    combineReducers({
      combinedPortal: (state = initialState.combinedPortal || {}) => state,
      user: (state = initialState.user || {}) => state,
      featureToggles: (
        state = initialState.featureToggles || { loading: false },
      ) => state,
    }),
    applyMiddleware(thunk),
  );
  const dispatchSpy = sinon.spy(store, 'dispatch');

  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
    dispatchSpy,
  };
};

describe('ResolvePage (container)', () => {
  before(() => {
    registerMockElement('va-breadcrumbs');
    registerMockElement('va-loading-indicator');
    registerMockElement('va-alert');
    registerMockElement('va-on-this-page');
  });

  const initialState = {
    combinedPortal: {
      mcp: {
        selectedStatement: {},
        isCopayDetailLoading: false,
        detailFetchError: null,
        statements: {
          data: [],
          meta: {},
        },
        shouldUseLighthouseCopays: true,
      },
      debtLetters: { debts: [], errors: [] },
    },
    user: {
      profile: {
        userFullName: { first: 'Jane', last: 'Doe' },
      },
    },
    featureToggles: {
      loading: false,
      [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
    },
  };

  describe('copay detail request on mount', () => {
    const match = { params: { id: '4-1abZUKu7xIvIw6' } };

    it('requests copay statement detail once when VHA payment history is enabled and the store has no matching statement', async () => {
      const { dispatchSpy } = renderWithStore(
        <ResolvePage match={match} />,
        initialState,
      );

      await waitFor(() => {
        const thunkCalls = dispatchSpy
          .getCalls()
          .filter(call => typeof call.args[0] === 'function');
        expect(thunkCalls.length).to.equal(1);
      });
    });

    it('does not request copay statement detail when VHA payment history is disabled', async () => {
      const stateVhaOff = {
        ...initialState,
        featureToggles: {
          loading: false,
          [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: false,
        },
      };

      const { dispatchSpy } = renderWithStore(
        <ResolvePage match={match} />,
        stateVhaOff,
      );

      await waitFor(() => {
        const thunkCalls = dispatchSpy
          .getCalls()
          .filter(call => typeof call.args[0] === 'function');
        expect(thunkCalls.length).to.equal(0);
      });
    });

    it('does not request copay statement detail again when a prior detail request failed and the store still has no statement id', async () => {
      const stateBlocked = {
        ...initialState,
        combinedPortal: {
          ...initialState.combinedPortal,
          mcp: {
            ...initialState.combinedPortal.mcp,
            selectedStatement: {},
            detailFetchError: {
              title: 'Not found',
              detail: 'No statement',
            },
          },
        },
      };

      const { dispatchSpy } = renderWithStore(
        <ResolvePage match={match} />,
        stateBlocked,
      );

      await waitFor(() => {
        const thunkCalls = dispatchSpy
          .getCalls()
          .filter(call => typeof call.args[0] === 'function');
        expect(thunkCalls.length).to.equal(0);
      });
    });

    it('shows the translated copay detail error when detailFetchError is set and the store has no statement id', () => {
      const state = {
        ...initialState,
        combinedPortal: {
          ...initialState.combinedPortal,
          mcp: {
            ...initialState.combinedPortal.mcp,
            selectedStatement: {},
            detailFetchError: {
              title: 'Record not found',
              detail: 'No copay matches this id.',
            },
          },
        },
      };

      const store = createStore(
        combineReducers({
          combinedPortal: (s = state.combinedPortal || {}) => s,
          user: (s = state.user || {}) => s,
          featureToggles: (s = state.featureToggles || { loading: false }) => s,
        }),
        applyMiddleware(thunk),
      );

      const { container } = render(
        <I18nextProvider i18n={i18nCombinedDebtPortal}>
          <Provider store={store}>
            <ResolvePage match={match} />
          </Provider>
        </I18nextProvider>,
      );

      expect(container.textContent).to.include(
        RESOLVE_PAGE_ERROR['error-title'],
      );
      expect(container.textContent).to.include(
        RESOLVE_PAGE_ERROR['error-body'],
      );
    });
  });
});
