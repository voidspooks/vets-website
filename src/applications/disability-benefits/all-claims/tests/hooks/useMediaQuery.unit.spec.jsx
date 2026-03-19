import { expect } from 'chai';
import sinon from 'sinon';
import { act, renderHook } from '@testing-library/react-hooks';

import useMediaQuery from '../../hooks/useMediaQuery';

describe('useMediaQuery', () => {
  let originalMatchMedia;
  let matchMediaStub;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    if (matchMediaStub) {
      matchMediaStub.restore();
      matchMediaStub = null;
    }
    window.matchMedia = originalMatchMedia;
  });

  it('uses addEventListener/removeEventListener when available', () => {
    let savedHandler;

    const mediaQuery = {
      matches: true,
      addEventListener: sinon.spy((type, handler) => {
        if (type === 'change') {
          savedHandler = handler;
        }
      }),
      removeEventListener: sinon.spy(),
    };

    matchMediaStub = sinon.stub(window, 'matchMedia').returns(mediaQuery);

    const { result, unmount } = renderHook(() =>
      useMediaQuery('(min-width: 768px)'),
    );

    expect(result.current).to.equal(true);
    expect(mediaQuery.addEventListener.calledOnce).to.equal(true);

    act(() => {
      savedHandler({ matches: false });
    });

    expect(result.current).to.equal(false);

    unmount();

    expect(mediaQuery.removeEventListener.calledOnce).to.equal(true);
    expect(mediaQuery.removeEventListener.firstCall.args[0]).to.equal('change');
    expect(mediaQuery.removeEventListener.firstCall.args[1]).to.equal(
      savedHandler,
    );
  });

  it('falls back to addListener/removeListener when addEventListener is unavailable', () => {
    let savedHandler;

    const mediaQuery = {
      matches: false,
      addListener: sinon.spy(handler => {
        savedHandler = handler;
      }),
      removeListener: sinon.spy(),
    };

    matchMediaStub = sinon.stub(window, 'matchMedia').returns(mediaQuery);

    const { result, unmount } = renderHook(() =>
      useMediaQuery('(min-width: 768px)'),
    );

    expect(result.current).to.equal(false);
    expect(mediaQuery.addListener.calledOnce).to.equal(true);

    act(() => {
      savedHandler({ matches: true });
    });

    expect(result.current).to.equal(true);

    unmount();

    expect(mediaQuery.removeListener.calledOnce).to.equal(true);
    expect(mediaQuery.removeListener.firstCall.args[0]).to.equal(savedHandler);
  });
});
