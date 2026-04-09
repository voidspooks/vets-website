import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { renderHook, act } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as tooltipActions from '../../actions/tooltip';
import useTooltipLifecycle from '../../hooks/useTooltipLifecycle';

const mockStore = configureStore([thunk]);

const buildWrapper = (initialState = { sm: {} }) => {
  const store = mockStore(initialState);
  return {
    store,
    wrapper: ({ children }) =>
      React.createElement(Provider, { store }, children),
  };
};

describe('useTooltipLifecycle', () => {
  let sandbox;
  let getTooltipByNameStub;
  let createNewTooltipStub;
  let incrementTooltipStub;
  let updateTooltipVisibilityStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    getTooltipByNameStub = sandbox.stub(tooltipActions, 'getTooltipByName');
    createNewTooltipStub = sandbox.stub(tooltipActions, 'createNewTooltip');
    incrementTooltipStub = sandbox
      .stub(tooltipActions, 'incrementTooltip')
      .callsFake(id => ({ type: 'TEST_INCREMENT_TOOLTIP', payload: id }));
    updateTooltipVisibilityStub = sandbox
      .stub(tooltipActions, 'updateTooltipVisibility')
      .callsFake(id => ({
        type: 'TEST_UPDATE_TOOLTIP_VISIBILITY',
        payload: id,
      }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('returns initial tooltip state as hidden with no id', () => {
    const { wrapper } = buildWrapper();

    getTooltipByNameStub.callsFake(() => () => Promise.resolve(undefined));
    createNewTooltipStub.callsFake(() => () => Promise.resolve(undefined));

    const { result } = renderHook(
      () => useTooltipLifecycle('test-tooltip-name'),
      { wrapper },
    );

    expect(result.current.tooltipVisible).to.equal(false);
    expect(result.current.tooltipId).to.equal(undefined);
    expect(result.current.dismiss).to.be.a('function');
  });

  it('fetches existing visible tooltip and increments counter when under max views', async () => {
    const existing = { id: '123', hidden: false, counter: 1 };
    getTooltipByNameStub.callsFake(() => () => Promise.resolve(existing));
    createNewTooltipStub.callsFake(() => () => Promise.resolve(undefined));

    const { wrapper } = buildWrapper();

    const { result } = renderHook(
      () => useTooltipLifecycle('inbox-alert-tooltip'),
      { wrapper },
    );

    await waitFor(() => {
      expect(getTooltipByNameStub.calledOnce).to.be.true;
      expect(getTooltipByNameStub.calledWith('inbox-alert-tooltip')).to.be.true;
      expect(result.current.tooltipVisible).to.equal(true);
      expect(result.current.tooltipId).to.equal('123');
      expect(incrementTooltipStub.calledOnce).to.be.true;
      expect(incrementTooltipStub.calledWith('123')).to.be.true;
      expect(updateTooltipVisibilityStub.called).to.be.false;
    });
  });

  it('fetches existing hidden tooltip and does not increment counter', async () => {
    const existing = { id: '123', hidden: true, counter: 1 };
    getTooltipByNameStub.callsFake(() => () => Promise.resolve(existing));
    createNewTooltipStub.callsFake(() => () => Promise.resolve(undefined));

    const { wrapper } = buildWrapper();

    const { result } = renderHook(
      () => useTooltipLifecycle('inbox-alert-tooltip'),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.tooltipVisible).to.equal(false);
      expect(result.current.tooltipId).to.equal('123');
      expect(incrementTooltipStub.called).to.be.false;
      expect(updateTooltipVisibilityStub.called).to.be.false;
    });
  });

  it('hides tooltip when existing tooltip has reached max views', async () => {
    const existing = { id: '123', hidden: false, counter: 3 };
    getTooltipByNameStub.callsFake(() => () => Promise.resolve(existing));
    createNewTooltipStub.callsFake(() => () => Promise.resolve(undefined));

    const { wrapper } = buildWrapper();

    const { result } = renderHook(
      () => useTooltipLifecycle('inbox-alert-tooltip'),
      { wrapper },
    );

    await waitFor(() => {
      expect(updateTooltipVisibilityStub.calledOnce).to.be.true;
      expect(updateTooltipVisibilityStub.calledWith('123')).to.be.true;
      expect(result.current.tooltipVisible).to.equal(false);
      expect(incrementTooltipStub.called).to.be.false;
    });
  });

  it('does not call updateTooltipVisibility when tooltip is already hidden and counter is at max views', async () => {
    const existing = { id: '123', hidden: true, counter: 3 };
    getTooltipByNameStub.callsFake(() => () => Promise.resolve(existing));
    createNewTooltipStub.callsFake(() => () => Promise.resolve(undefined));

    const { wrapper } = buildWrapper();

    const { result } = renderHook(
      () => useTooltipLifecycle('inbox-alert-tooltip'),
      { wrapper },
    );

    await waitFor(() => {
      expect(updateTooltipVisibilityStub.called).to.be.false;
      expect(result.current.tooltipVisible).to.equal(false);
      expect(result.current.tooltipId).to.equal('123');
      expect(incrementTooltipStub.called).to.be.false;
    });
  });

  it('respects a custom maxViews option', async () => {
    const existing = { id: '123', hidden: false, counter: 5 };
    getTooltipByNameStub.callsFake(() => () => Promise.resolve(existing));
    createNewTooltipStub.callsFake(() => () => Promise.resolve(undefined));

    const { wrapper } = buildWrapper();

    const { result } = renderHook(
      () => useTooltipLifecycle('inbox-alert-tooltip', { maxViews: 10 }),
      { wrapper },
    );

    await waitFor(() => {
      expect(updateTooltipVisibilityStub.called).to.be.false;
      expect(result.current.tooltipVisible).to.equal(true);
      expect(result.current.tooltipId).to.equal('123');
      expect(incrementTooltipStub.calledWith('123')).to.be.true;
    });
  });

  it('creates a tooltip when none exists and increments when created visible', async () => {
    const created = { id: 'new-id', hidden: false };
    getTooltipByNameStub.callsFake(() => () => Promise.resolve(undefined));
    createNewTooltipStub.callsFake(() => () => Promise.resolve(created));

    const { wrapper } = buildWrapper();

    const { result } = renderHook(
      () => useTooltipLifecycle('inbox-alert-tooltip'),
      { wrapper },
    );

    await waitFor(() => {
      expect(createNewTooltipStub.calledOnce).to.be.true;
      expect(createNewTooltipStub.calledWith('inbox-alert-tooltip')).to.be.true;
      expect(result.current.tooltipVisible).to.equal(true);
      expect(result.current.tooltipId).to.equal('new-id');
      expect(incrementTooltipStub.calledOnce).to.be.true;
      expect(incrementTooltipStub.calledWith('new-id')).to.be.true;
    });
  });

  it('skips fetch/create work when skip is true', async () => {
    const { wrapper } = buildWrapper();

    const { result } = renderHook(
      () => useTooltipLifecycle('inbox-alert-tooltip', { skip: true }),
      { wrapper },
    );

    await waitFor(() => {
      expect(getTooltipByNameStub.called).to.be.false;
      expect(createNewTooltipStub.called).to.be.false;
      expect(incrementTooltipStub.called).to.be.false;
      expect(updateTooltipVisibilityStub.called).to.be.false;
      expect(result.current.tooltipVisible).to.equal(false);
      expect(result.current.tooltipId).to.equal(undefined);
    });
  });

  it('dismiss dispatches visibility update and hides tooltip locally when tooltipId exists', async () => {
    const existing = { id: 'dismiss-id', hidden: false, counter: 1 };
    getTooltipByNameStub.callsFake(() => () => Promise.resolve(existing));
    createNewTooltipStub.callsFake(() => () => Promise.resolve(undefined));

    const { wrapper } = buildWrapper();

    const { result } = renderHook(() => useTooltipLifecycle('test-tooltip'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.tooltipId).to.equal('dismiss-id');
    });

    act(() => {
      result.current.dismiss();
    });

    expect(updateTooltipVisibilityStub.calledWith('dismiss-id')).to.be.true;
    expect(result.current.tooltipVisible).to.equal(false);
  });

  it('dismiss is a no-op when tooltipId is missing', async () => {
    getTooltipByNameStub.callsFake(() => () => Promise.resolve(undefined));
    createNewTooltipStub.callsFake(() => () => Promise.resolve(undefined));

    const { wrapper } = buildWrapper();

    const { result } = renderHook(() => useTooltipLifecycle('test-tooltip'), {
      wrapper,
    });

    act(() => {
      result.current.dismiss();
    });

    expect(updateTooltipVisibilityStub.called).to.be.false;
  });
});
