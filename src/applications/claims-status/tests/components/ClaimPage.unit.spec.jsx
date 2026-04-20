import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { act, render } from '@testing-library/react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom-v5-compat';

import { ClaimPage } from '../../containers/ClaimPage';
import { renderWithReduxAndRouter } from '../utils';

const params = { id: 1 };

const props = {
  clearClaim: () => {},
  params,
};

const featureToggleName = 'cst_multi_claim_provider';

const initialState = {
  featureToggles: {
    loading: false,
    [featureToggleName]: false,
  },
};

describe('<ClaimPage>', () => {
  it('calls getClaim when it is rendered', () => {
    // Reset sinon spies / set up props
    props.getClaim = sinon.spy();

    renderWithReduxAndRouter(
      <ClaimPage {...props}>
        <div />
      </ClaimPage>,
      { initialState },
    );

    expect(props.getClaim.called).to.be.true;
  });

  it('calls clearClaim when it unmounts', () => {
    props.clearClaim = sinon.spy();

    const { unmount } = renderWithReduxAndRouter(
      <ClaimPage {...props}>
        <div />
      </ClaimPage>,
      { initialState },
    );

    unmount();
    expect(props.clearClaim.called).to.be.true;
  });

  it('does not call getClaim while feature toggles are still loading', () => {
    props.getClaim = sinon.spy();

    const loadingState = {
      featureToggles: {
        loading: true,
        [featureToggleName]: true,
      },
    };

    renderWithReduxAndRouter(
      <ClaimPage {...props}>
        <div />
      </ClaimPage>,
      { initialState: loadingState },
    );

    expect(props.getClaim.called).to.be.false;
  });

  it('calls getClaim once feature toggles finish loading', () => {
    props.getClaim = sinon.spy();

    const storeState = {
      featureToggles: { loading: true, [featureToggleName]: true },
    };
    const store = createStore((state = storeState, action) => {
      if (action.type === 'TEST_SET_TOGGLES') return action.payload;
      return state;
    }, storeState);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Routes>
            <Route
              index
              element={
                <ClaimPage {...props}>
                  <div />
                </ClaimPage>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(props.getClaim.called).to.be.false;

    act(() => {
      store.dispatch({
        type: 'TEST_SET_TOGGLES',
        payload: {
          featureToggles: { loading: false, [featureToggleName]: true },
        },
      });
    });

    expect(props.getClaim.called).to.be.true;
  });
});
