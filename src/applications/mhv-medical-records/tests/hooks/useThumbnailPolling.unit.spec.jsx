import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import sinon from 'sinon';
import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import useThumbnailPolling from '../../hooks/useThumbnailPolling';
import * as labsAndTestsActions from '../../actions/labsAndTests';
import * as alertsActions from '../../actions/alerts';
import { ALERT_TYPE_IMAGE_THUMBNAIL_ERROR } from '../../util/constants';

/**
 * Minimal harness component to exercise the hook and render its return values.
 */
function TestComponent({ imagingStudyId }) {
  const { hasLoadedThumbnails, hasImageError } = useThumbnailPolling(
    imagingStudyId,
  );
  return (
    <>
      <span data-testid="loaded">{String(hasLoadedThumbnails)}</span>
      <span data-testid="error">{String(hasImageError)}</span>
    </>
  );
}

TestComponent.propTypes = {
  imagingStudyId: PropTypes.string,
};

describe('useThumbnailPolling', () => {
  let clock;
  let getThumbnailsStub;
  let getDicomStub;
  let addAlertStub;
  let clearAlertsStub;

  const createMockStore = (overrides = {}) => ({
    getState: () => ({
      mr: {
        labsAndTests: {
          scdfImageThumbnails: overrides.scdfImageThumbnails || [],
        },
        alerts: {
          alertList: overrides.alertList || [],
        },
      },
    }),
    subscribe: () => () => {},
    dispatch: sinon.spy(action => action),
  });

  const renderWithHook = (imagingStudyId, storeOverrides = {}) => {
    const store = createMockStore(storeOverrides);
    return {
      store,
      ...render(
        <Provider store={store}>
          <TestComponent imagingStudyId={imagingStudyId} />
        </Provider>,
      ),
    };
  };

  beforeEach(() => {
    getThumbnailsStub = sinon
      .stub(labsAndTestsActions, 'getImagingStudyThumbnails')
      .callsFake(id => ({ type: 'GET_THUMBNAILS', id }));
    getDicomStub = sinon
      .stub(labsAndTestsActions, 'getImagingStudyDicomZip')
      .callsFake(id => ({ type: 'GET_DICOM', id }));
    addAlertStub = sinon
      .stub(alertsActions, 'addAlert')
      .callsFake((type, error) => ({
        type: 'ADD_ALERT',
        payload: { type, error },
      }));
    clearAlertsStub = sinon
      .stub(alertsActions, 'clearAlerts')
      .returns({ type: 'CLEAR_ALERTS' });
  });

  afterEach(() => {
    if (clock) {
      clock.restore();
      clock = null;
    }
    getThumbnailsStub.restore();
    getDicomStub.restore();
    addAlertStub.restore();
    clearAlertsStub.restore();
  });

  describe('initial behavior', () => {
    it('returns false for both values when imagingStudyId is null', () => {
      const { getByTestId } = renderWithHook(null);
      expect(getByTestId('loaded').textContent).to.equal('false');
      expect(getByTestId('error').textContent).to.equal('false');
    });

    it('does not dispatch fetch actions when imagingStudyId is null', () => {
      renderWithHook(null);
      expect(getThumbnailsStub.called).to.be.false;
      expect(getDicomStub.called).to.be.false;
    });

    it('dispatches initial fetch for thumbnails and DICOM', () => {
      renderWithHook('study-123');
      expect(getThumbnailsStub.calledWith('study-123')).to.be.true;
      expect(getDicomStub.calledWith('study-123')).to.be.true;
    });

    it('returns hasLoadedThumbnails=true when thumbnails exist in state', () => {
      const { getByTestId } = renderWithHook('study-123', {
        scdfImageThumbnails: [{ url: 'http://example.com/thumb.jpg' }],
      });
      expect(getByTestId('loaded').textContent).to.equal('true');
    });

    it('returns hasImageError=true when error alert is active', () => {
      const { getByTestId } = renderWithHook('study-123', {
        alertList: [
          {
            type: ALERT_TYPE_IMAGE_THUMBNAIL_ERROR,
            isActive: true,
            datestamp: Date.now(),
          },
        ],
      });
      expect(getByTestId('error').textContent).to.equal('true');
    });
  });

  describe('polling behavior', () => {
    beforeEach(() => {
      clock = sinon.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout', 'Date'],
      });
    });

    it('polls for thumbnails after the initial interval', () => {
      renderWithHook('study-123');
      const initialCallCount = getThumbnailsStub.callCount;

      act(() => {
        clock.tick(2100);
      });

      expect(getThumbnailsStub.callCount).to.be.greaterThan(initialCallCount);
    });

    it('does not poll when thumbnails are already loaded', () => {
      renderWithHook('study-123', {
        scdfImageThumbnails: [{ url: 'http://example.com/thumb.jpg' }],
      });
      const callCountAfterInit = getThumbnailsStub.callCount;

      act(() => {
        clock.tick(5000);
      });

      expect(getThumbnailsStub.callCount).to.equal(callCountAfterInit);
    });

    it('does not poll when error alert is active', () => {
      renderWithHook('study-123', {
        alertList: [
          {
            type: ALERT_TYPE_IMAGE_THUMBNAIL_ERROR,
            isActive: true,
            datestamp: 0,
          },
        ],
      });
      const callCountAfterInit = getThumbnailsStub.callCount;

      act(() => {
        clock.tick(5000);
      });

      expect(getThumbnailsStub.callCount).to.equal(callCountAfterInit);
    });
  });

  describe('timeout behavior', () => {
    beforeEach(() => {
      clock = sinon.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout', 'Date'],
      });
    });

    it('dispatches error alert after 60 seconds of polling', () => {
      renderWithHook('study-123');

      const tickAndFlush = () => act(() => clock.tick(2000));
      for (let i = 0; i < 35; i += 1) {
        tickAndFlush();
      }

      expect(addAlertStub.calledOnce).to.be.true;
      expect(addAlertStub.firstCall.args[0]).to.equal(
        ALERT_TYPE_IMAGE_THUMBNAIL_ERROR,
      );
      expect(addAlertStub.firstCall.args[1]).to.be.an.instanceOf(Error);
      expect(addAlertStub.firstCall.args[1].message).to.equal(
        'Thumbnail polling timed out',
      );
    });

    it('does not dispatch error alert before 60 seconds', () => {
      renderWithHook('study-123');

      const tickAndFlush = () => act(() => clock.tick(2000));
      // 25 * 2000 = 50000ms < 60000ms
      for (let i = 0; i < 25; i += 1) {
        tickAndFlush();
      }

      expect(addAlertStub.called).to.be.false;
    });

    it('does not dispatch multiple timeout alerts', () => {
      renderWithHook('study-123');

      const tickAndFlush = () => act(() => clock.tick(2000));
      for (let i = 0; i < 40; i += 1) {
        tickAndFlush();
      }

      expect(addAlertStub.calledOnce).to.be.true;
    });
  });

  describe('cleanup', () => {
    it('clears timeout on unmount', () => {
      clock = sinon.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout', 'Date'],
      });
      const clearTimeoutSpy = sinon.spy(global, 'clearTimeout');

      const { unmount } = renderWithHook('study-123');
      unmount();

      expect(clearTimeoutSpy.called).to.be.true;
      clearTimeoutSpy.restore();
    });

    it('stops polling after unmount', () => {
      clock = sinon.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout', 'Date'],
      });

      const { unmount } = renderWithHook('study-123');
      unmount();
      const callCountAtUnmount = getThumbnailsStub.callCount;

      act(() => {
        clock.tick(10000);
      });

      expect(getThumbnailsStub.callCount).to.equal(callCountAtUnmount);
    });
  });

  describe('imagingStudyId changes', () => {
    it('dispatches new fetches when imagingStudyId changes', () => {
      const store = createMockStore();

      const { rerender } = render(
        <Provider store={store}>
          <TestComponent imagingStudyId="study-1" />
        </Provider>,
      );

      expect(getThumbnailsStub.calledWith('study-1')).to.be.true;
      expect(getDicomStub.calledWith('study-1')).to.be.true;

      getThumbnailsStub.resetHistory();
      getDicomStub.resetHistory();

      rerender(
        <Provider store={store}>
          <TestComponent imagingStudyId="study-2" />
        </Provider>,
      );

      expect(getThumbnailsStub.calledWith('study-2')).to.be.true;
      expect(getDicomStub.calledWith('study-2')).to.be.true;
    });
  });
});
