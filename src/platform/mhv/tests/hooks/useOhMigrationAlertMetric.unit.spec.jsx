import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { renderHook } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import useOhMigrationAlertMetric from 'platform/mhv/hooks/useOhMigrationAlertMetric';

const mockStore = (facilities = []) => ({
  getState: () => ({
    user: { profile: { facilities } },
  }),
  subscribe: () => () => {},
  dispatch: () => {},
});

const wrapper = (store = mockStore()) => ({ children }) => (
  <Provider store={store}>{children}</Provider>
);

describe('useOhMigrationAlertMetric hook', () => {
  let logSpy;
  let originalDDLogs;

  beforeEach(() => {
    logSpy = sinon.spy();
    originalDDLogs = window.DD_LOGS;
    window.DD_LOGS = { logger: { log: logSpy } };
  });

  afterEach(() => {
    window.DD_LOGS = originalDDLogs;
  });

  it('logs once when isVisible is true on initial render', () => {
    const store = mockStore([{ facilityId: '983' }]);
    renderHook(
      () =>
        useOhMigrationAlertMetric({
          alertName: 'TestAlert',
          isVisible: true,
        }),
      { wrapper: wrapper(store) },
    );

    expect(logSpy.calledOnce).to.be.true;
    expect(logSpy.firstCall.args[0]).to.equal(
      'OH Migration Alert Rendered: TestAlert',
    );
    expect(logSpy.firstCall.args[1]).to.deep.equal({
      alertName: 'TestAlert',
      facilityIds: ['983'],
    });
    expect(logSpy.firstCall.args[2]).to.equal('info');
  });

  it('does not log when isVisible is false', () => {
    renderHook(
      () =>
        useOhMigrationAlertMetric({
          alertName: 'TestAlert',
          isVisible: false,
        }),
      { wrapper: wrapper() },
    );

    expect(logSpy.called).to.be.false;
  });

  it('does not log again on re-renders when isVisible stays true', () => {
    const { rerender } = renderHook(
      () =>
        useOhMigrationAlertMetric({
          alertName: 'TestAlert',
          isVisible: true,
        }),
      { wrapper: wrapper() },
    );

    rerender();
    rerender();

    expect(logSpy.calledOnce).to.be.true;
  });

  it('logs when isVisible transitions from false to true', () => {
    const { rerender } = renderHook(
      ({ visible }) =>
        useOhMigrationAlertMetric({
          alertName: 'TestAlert',
          isVisible: visible,
        }),
      { initialProps: { visible: false }, wrapper: wrapper() },
    );

    expect(logSpy.called).to.be.false;

    rerender({ visible: true });

    expect(logSpy.calledOnce).to.be.true;
  });

  it('does not log a second time if isVisible toggles back to false and then true', () => {
    const { rerender } = renderHook(
      ({ visible }) =>
        useOhMigrationAlertMetric({
          alertName: 'TestAlert',
          isVisible: visible,
        }),
      { initialProps: { visible: true }, wrapper: wrapper() },
    );

    expect(logSpy.calledOnce).to.be.true;

    rerender({ visible: false });
    rerender({ visible: true });

    // Still only one call due to the ref guard
    expect(logSpy.calledOnce).to.be.true;
  });

  it('uses the correct alertName in the log message', () => {
    renderHook(
      () =>
        useOhMigrationAlertMetric({
          alertName: 'CernerFacilityAlert-Inbox',
          isVisible: true,
        }),
      { wrapper: wrapper() },
    );

    expect(logSpy.firstCall.args[0]).to.equal(
      'OH Migration Alert Rendered: CernerFacilityAlert-Inbox',
    );
    expect(logSpy.firstCall.args[1]).to.deep.include({
      alertName: 'CernerFacilityAlert-Inbox',
    });
  });

  it('includes facilityIds from user profile', () => {
    const store = mockStore([{ facilityId: '983' }, { facilityId: '984' }]);
    renderHook(
      () =>
        useOhMigrationAlertMetric({
          alertName: 'TestAlert',
          isVisible: true,
        }),
      { wrapper: wrapper(store) },
    );

    expect(logSpy.firstCall.args[1].facilityIds).to.deep.equal(['983', '984']);
  });

  it('includes stationNumber when provided', () => {
    const store = mockStore([{ facilityId: '983' }]);
    renderHook(
      () =>
        useOhMigrationAlertMetric({
          alertName: 'TestAlert',
          isVisible: true,
          stationNumber: '442',
        }),
      { wrapper: wrapper(store) },
    );

    expect(logSpy.firstCall.args[1]).to.deep.equal({
      alertName: 'TestAlert',
      facilityIds: ['983'],
      stationNumber: '442',
    });
  });

  it('omits stationNumber when not provided', () => {
    renderHook(
      () =>
        useOhMigrationAlertMetric({
          alertName: 'TestAlert',
          isVisible: true,
        }),
      { wrapper: wrapper() },
    );

    expect(logSpy.firstCall.args[1]).to.not.have.property('stationNumber');
  });

  it('handles empty facilities array gracefully', () => {
    const store = mockStore([]);
    renderHook(
      () =>
        useOhMigrationAlertMetric({
          alertName: 'TestAlert',
          isVisible: true,
        }),
      { wrapper: wrapper(store) },
    );

    expect(logSpy.firstCall.args[1].facilityIds).to.deep.equal([]);
  });

  it('includes currentPhase when provided', () => {
    const store = mockStore([{ facilityId: '983' }]);
    renderHook(
      () =>
        useOhMigrationAlertMetric({
          alertName: 'TestAlert',
          isVisible: true,
          currentPhase: 'p1',
        }),
      { wrapper: wrapper(store) },
    );

    expect(logSpy.firstCall.args[1]).to.deep.equal({
      alertName: 'TestAlert',
      facilityIds: ['983'],
      currentPhase: 'p1',
    });
  });

  it('omits currentPhase when not provided', () => {
    renderHook(
      () =>
        useOhMigrationAlertMetric({
          alertName: 'TestAlert',
          isVisible: true,
        }),
      { wrapper: wrapper() },
    );

    expect(logSpy.firstCall.args[1]).to.not.have.property('currentPhase');
  });

  it('includes both stationNumber and currentPhase when both are provided', () => {
    const store = mockStore([{ facilityId: '983' }]);
    renderHook(
      () =>
        useOhMigrationAlertMetric({
          alertName: 'TestAlert',
          isVisible: true,
          stationNumber: '442',
          currentPhase: 'p4',
        }),
      { wrapper: wrapper(store) },
    );

    expect(logSpy.firstCall.args[1]).to.deep.equal({
      alertName: 'TestAlert',
      facilityIds: ['983'],
      stationNumber: '442',
      currentPhase: 'p4',
    });
  });
});
