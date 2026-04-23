import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { cleanup, waitFor } from '@testing-library/react';
import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import reducer from '../../../reducers';
import TrackedSpinner from '../../../components/shared/TrackedSpinner';

describe('TrackedSpinner', () => {
  afterEach(() => {
    cleanup();
  });

  const renderSpinner = (props = {}) => {
    return renderWithStoreAndRouter(
      <TrackedSpinner id="test-spinner" message="Loading..." {...props} />,
      {
        initialState: {
          user: { profile: { accountUuid: 'test-uuid' } },
        },
        reducers: reducer,
      },
    );
  };

  it('renders va-loading-indicator with passed props', () => {
    const { container } = renderSpinner();

    const loadingIndicator = container.querySelector('va-loading-indicator');
    expect(loadingIndicator).to.exist;
    expect(loadingIndicator.getAttribute('message')).to.equal('Loading...');
  });

  it('calls onTimeout with correct payload including id when timeout fires', async () => {
    const onTimeoutSpy = sinon.spy();
    renderSpinner({
      id: 'my-custom-spinner',
      timeout: 50, // Short timeout for test
      onTimeout: onTimeoutSpy,
    });

    await waitFor(
      () => {
        expect(onTimeoutSpy.calledOnce).to.be.true;
      },
      { timeout: 200 },
    );

    const payload = onTimeoutSpy.firstCall.args[0];
    expect(payload.id).to.equal('my-custom-spinner');
    expect(payload.duration).to.be.a('number');
    expect(payload.userId).to.equal('test-uuid');
  });

  it('does not call onTimeout when unmounted before timeout fires', async () => {
    const onTimeoutSpy = sinon.spy();
    const { unmount } = renderSpinner({
      timeout: 100,
      onTimeout: onTimeoutSpy,
    });

    // Unmount immediately before timeout can fire
    unmount();

    // Wait longer than timeout would have been
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(onTimeoutSpy.called).to.be.false;
  });
});
