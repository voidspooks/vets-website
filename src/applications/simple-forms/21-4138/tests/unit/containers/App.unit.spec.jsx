import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { render, cleanup, act } from '@testing-library/react';
import * as datadogModule from 'platform/monitoring/Datadog';
import App, { BROWSER_MONITORING_PROPS } from '../../../containers/App';
import { RUM_ACTIONS } from '../../../config/monitoring';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const createMockStore = (overrides = {}) =>
  createStore(() => ({
    featureToggles: {
      loading: true,
      form214138: true,
      form214138BrowserMonitoringEnabled: true,
      ...overrides.featureToggles,
    },
    user: {
      login: { currentlyLoggedIn: true },
      profile: { loading: false },
    },
    form: { loadedData: { metadata: {} }, pages: {}, data: {} },
    navigation: { showLoginModal: false },
    ...overrides,
  }));

const renderApp = (store = createMockStore()) =>
  render(
    <Provider store={store}>
      <App location={{ pathname: '/introduction' }}>
        <div data-testid="child" />
      </App>
    </Provider>,
  );

// ---------------------------------------------------------------------------
// BROWSER_MONITORING_PROPS shape
// ---------------------------------------------------------------------------

describe('BROWSER_MONITORING_PROPS', () => {
  it('has the correct toggleName', () => {
    expect(BROWSER_MONITORING_PROPS.toggleName).to.equal(
      'form214138BrowserMonitoringEnabled',
    );
  });

  it('has the correct service name', () => {
    expect(BROWSER_MONITORING_PROPS.service).to.equal('21-4138');
  });

  it('sets defaultPrivacyLevel to mask-user-input', () => {
    expect(BROWSER_MONITORING_PROPS.defaultPrivacyLevel).to.equal(
      'mask-user-input',
    );
  });

  it('sets sessionSampleRate to 100', () => {
    expect(BROWSER_MONITORING_PROPS.sessionSampleRate).to.equal(100);
  });

  it('enables all tracking flags', () => {
    expect(BROWSER_MONITORING_PROPS.trackUserInteractions).to.be.true;
    expect(BROWSER_MONITORING_PROPS.trackFrustrations).to.be.true;
    expect(BROWSER_MONITORING_PROPS.trackResources).to.be.true;
    expect(BROWSER_MONITORING_PROPS.trackLongTasks).to.be.true;
  });
});

// ---------------------------------------------------------------------------
// beforeSend hook
// ---------------------------------------------------------------------------

describe('BROWSER_MONITORING_PROPS.beforeSend', () => {
  const { beforeSend } = BROWSER_MONITORING_PROPS;

  it('anonymizes click action target names', () => {
    const action = { type: 'click', target: { name: 'John Doe' } };
    beforeSend({ action, type: 'action', resource: {} });
    expect(action.target.name).to.equal('Form item');
  });

  it('does not modify non-click action target names', () => {
    const action = { type: 'input', target: { name: 'John Doe' } };
    beforeSend({ action, type: 'action', resource: {} });
    expect(action.target.name).to.equal('John Doe');
  });

  it('returns false (drops) resource events for excluded domains', () => {
    const excluded = [
      'resource.digital.voice.va.gov',
      'browser-intake-ddog-gov.com',
      'google-analytics.com',
      'eauth.va.gov',
      'api.va.gov',
    ];
    excluded.forEach(domain => {
      const result = beforeSend({
        type: 'resource',
        resource: { url: `https://${domain}/path` },
        action: null,
      });
      expect(result, `expected ${domain} to be dropped`).to.be.false;
    });
  });

  it('returns true (keeps) resource events for non-excluded domains', () => {
    const result = beforeSend({
      type: 'resource',
      resource: { url: 'https://veteran.apps.va.gov/forms' },
      action: null,
    });
    expect(result).to.be.true;
  });

  it('returns true (keeps) non-resource events regardless of URL', () => {
    const result = beforeSend({
      type: 'error',
      resource: { url: 'https://api.va.gov/something' },
      action: null,
    });
    expect(result).to.be.true;
  });
});

describe('App — submission failure tracking', () => {
  let addActionSpy;
  let monitoringStub;

  const createMutableStore = (initialStatus = undefined) =>
    createStore(
      (state, action) => {
        if (action?.type === 'SET_STATUS') {
          return {
            ...state,
            form: {
              ...state.form,
              submission: { status: action.status },
            },
          };
        }
        return state;
      },
      {
        featureToggles: { loading: true },
        user: {
          login: { currentlyLoggedIn: false },
          profile: { loading: false },
        },
        form: {
          loadedData: { metadata: {} },
          pages: {},
          data: {},
          submission: { status: initialStatus },
        },
        navigation: { showLoginModal: false },
      },
    );

  beforeEach(() => {
    addActionSpy = sinon.spy();
    window.DD_RUM = { addAction: addActionSpy };
    monitoringStub = sinon.stub(datadogModule, 'useBrowserMonitoring');
  });

  afterEach(() => {
    delete window.DD_RUM;
    monitoringStub.restore();
    cleanup();
  });

  ['clientError', 'throttledError', 'serverError'].forEach(status => {
    it(`fires 4138_submission_failure with reason "${status}" on transition`, () => {
      const store = createMutableStore();
      render(
        <Provider store={store}>
          <App location={{ pathname: '/review-and-submit' }}>
            <div />
          </App>
        </Provider>,
      );

      act(() => {
        store.dispatch({ type: 'SET_STATUS', status });
      });

      expect(
        addActionSpy.calledWith(RUM_ACTIONS.SUBMISSION_FAILURE, {
          reason: status,
        }),
      ).to.be.true;
    });
  });

  it('fires 4138_submission_success on transition to applicationSubmitted', () => {
    const store = createMutableStore();
    render(
      <Provider store={store}>
        <App location={{ pathname: '/review-and-submit' }}>
          <div />
        </App>
      </Provider>,
    );

    act(() => {
      store.dispatch({ type: 'SET_STATUS', status: 'applicationSubmitted' });
    });

    expect(addActionSpy.calledWith(RUM_ACTIONS.SUBMISSION_SUCCESS)).to.be.true;
  });

  it('does not fire for untracked statuses like submitPending', () => {
    const store = createMutableStore();
    render(
      <Provider store={store}>
        <App location={{ pathname: '/review-and-submit' }}>
          <div />
        </App>
      </Provider>,
    );

    act(() => {
      store.dispatch({ type: 'SET_STATUS', status: 'submitPending' });
    });

    expect(addActionSpy.called).to.be.false;
  });

  it('does not throw when window.DD_RUM is undefined', () => {
    delete window.DD_RUM;
    const store = createMutableStore();
    expect(() => {
      render(
        <Provider store={store}>
          <App location={{ pathname: '/review-and-submit' }}>
            <div />
          </App>
        </Provider>,
      );
      act(() => {
        store.dispatch({ type: 'SET_STATUS', status: 'clientError' });
      });
    }).to.not.throw();
  });
});

// ---------------------------------------------------------------------------
// Hook wiring — useBrowserMonitoring is called from App
// ---------------------------------------------------------------------------

describe('App — browser monitoring hook wiring', () => {
  let stub;

  beforeEach(() => {
    stub = sinon.stub(datadogModule, 'useBrowserMonitoring');
  });

  afterEach(() => {
    stub.restore();
    cleanup();
  });

  it('calls useBrowserMonitoring on mount', () => {
    renderApp();
    expect(stub.calledOnce).to.be.true;
  });

  it('passes BROWSER_MONITORING_PROPS to useBrowserMonitoring', () => {
    renderApp();
    const [calledWith] = stub.firstCall.args;
    expect(calledWith.toggleName).to.equal(BROWSER_MONITORING_PROPS.toggleName);
    expect(calledWith.service).to.equal(BROWSER_MONITORING_PROPS.service);
    expect(calledWith.defaultPrivacyLevel).to.equal(
      BROWSER_MONITORING_PROPS.defaultPrivacyLevel,
    );
  });
});
