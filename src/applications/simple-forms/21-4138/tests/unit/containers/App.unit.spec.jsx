import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { render, cleanup } from '@testing-library/react';
import * as datadogModule from 'platform/monitoring/Datadog';
import App, { BROWSER_MONITORING_PROPS } from '../../../containers/App';

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
    expect(BROWSER_MONITORING_PROPS.service).to.equal('simple-forms-21-4138');
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
