import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import sinon from 'sinon';
import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import useThumbnailPolling from '../../hooks/useThumbnailPolling';
import * as labsAndTestsActions from '../../actions/labsAndTests';
import * as alertsActions from '../../actions/alerts';
import {
  ALERT_TYPE_IMAGE_THUMBNAIL_ERROR,
  ALERT_TYPE_IMAGE_DICOM_ERROR,
} from '../../util/constants';

/**
 * Minimal harness component to exercise the hook and render its return values.
 */
function TestComponent({ imagingStudyId, expectedImageCount }) {
  const {
    hasLoadedThumbnails,
    hasLoadedDicom,
    hasImageError,
    hasDicomError,
  } = useThumbnailPolling(imagingStudyId, expectedImageCount);
  return (
    <>
      <span data-testid="loaded">{String(hasLoadedThumbnails)}</span>
      <span data-testid="dicom-loaded">{String(hasLoadedDicom)}</span>
      <span data-testid="error">{String(hasImageError)}</span>
      <span data-testid="dicom-error">{String(hasDicomError)}</span>
    </>
  );
}

TestComponent.propTypes = {
  imagingStudyId: PropTypes.string,
  expectedImageCount: PropTypes.number,
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
          scdfDicom: overrides.scdfDicom || null,
          scdfImageStudyId: overrides.scdfImageStudyId || null,
        },
        alerts: {
          alertList: overrides.alertList || [],
        },
      },
    }),
    subscribe: () => () => {},
    dispatch: sinon.spy(action => action),
  });

  const renderWithHook = (
    imagingStudyId,
    storeOverrides = {},
    expectedImageCount,
  ) => {
    const store = createMockStore(storeOverrides);
    return {
      store,
      ...render(
        <Provider store={store}>
          <TestComponent
            imagingStudyId={imagingStudyId}
            expectedImageCount={expectedImageCount}
          />
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
    it('returns false for all values when imagingStudyId is null', () => {
      const { getByTestId } = renderWithHook(null);
      expect(getByTestId('loaded').textContent).to.equal('false');
      expect(getByTestId('dicom-loaded').textContent).to.equal('false');
      expect(getByTestId('error').textContent).to.equal('false');
      expect(getByTestId('dicom-error').textContent).to.equal('false');
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

    it('returns hasLoadedDicom=true when DICOM URL exists in state', () => {
      const { getByTestId } = renderWithHook('study-123', {
        scdfDicom: 'http://example.com/dicom.zip',
      });
      expect(getByTestId('dicom-loaded').textContent).to.equal('true');
    });

    it('returns hasImageError=true when thumbnail error alert is active', () => {
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

    it('returns hasDicomError=true when DICOM error alert is active', () => {
      const { getByTestId } = renderWithHook('study-123', {
        alertList: [
          {
            type: ALERT_TYPE_IMAGE_DICOM_ERROR,
            isActive: true,
            datestamp: Date.now(),
          },
        ],
      });
      expect(getByTestId('dicom-error').textContent).to.equal('true');
    });
  });

  describe('polling behavior', () => {
    beforeEach(() => {
      clock = sinon.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout', 'Date'],
      });
    });

    it('polls for thumbnails after 2s and DICOM after 5s', () => {
      renderWithHook('study-123');
      const initialThumbCount = getThumbnailsStub.callCount;
      const initialDicomCount = getDicomStub.callCount;

      act(() => {
        clock.tick(2100);
      });

      expect(getThumbnailsStub.callCount).to.be.greaterThan(initialThumbCount);
      // DICOM starts at 5s, so no poll yet
      expect(getDicomStub.callCount).to.equal(initialDicomCount);

      act(() => {
        clock.tick(3000);
      });

      // Now past 5s, DICOM should have polled
      expect(getDicomStub.callCount).to.be.greaterThan(initialDicomCount);
    });

    it('does not poll when both thumbnails and DICOM are loaded', () => {
      renderWithHook('study-123', {
        scdfImageThumbnails: [{ url: 'http://example.com/thumb.jpg' }],
        scdfDicom: 'http://example.com/dicom.zip',
      });
      const thumbCount = getThumbnailsStub.callCount;
      const dicomCount = getDicomStub.callCount;

      act(() => {
        clock.tick(5000);
      });

      expect(getThumbnailsStub.callCount).to.equal(thumbCount);
      expect(getDicomStub.callCount).to.equal(dicomCount);
    });

    it('continues polling for DICOM when only thumbnails are loaded', () => {
      renderWithHook('study-123', {
        scdfImageThumbnails: [{ url: 'http://example.com/thumb.jpg' }],
      });
      const initialDicomCount = getDicomStub.callCount;

      act(() => {
        clock.tick(5100);
      });

      expect(getDicomStub.callCount).to.be.greaterThan(initialDicomCount);
    });

    it('continues polling for thumbnails when only DICOM is loaded', () => {
      renderWithHook('study-123', {
        scdfDicom: 'http://example.com/dicom.zip',
      });
      const initialThumbCount = getThumbnailsStub.callCount;

      act(() => {
        clock.tick(2100);
      });

      expect(getThumbnailsStub.callCount).to.be.greaterThan(initialThumbCount);
    });

    it('does not poll when both error alerts are active', () => {
      renderWithHook('study-123', {
        alertList: [
          {
            type: ALERT_TYPE_IMAGE_THUMBNAIL_ERROR,
            isActive: true,
            datestamp: 0,
          },
          {
            type: ALERT_TYPE_IMAGE_DICOM_ERROR,
            isActive: true,
            datestamp: 0,
          },
        ],
      });
      const thumbCount = getThumbnailsStub.callCount;
      const dicomCount = getDicomStub.callCount;

      act(() => {
        clock.tick(5000);
      });

      expect(getThumbnailsStub.callCount).to.equal(thumbCount);
      expect(getDicomStub.callCount).to.equal(dicomCount);
    });
  });

  describe('timeout behavior', () => {
    beforeEach(() => {
      clock = sinon.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout', 'Date'],
      });
    });

    it('dispatches error alerts for both resources after 60 seconds', () => {
      renderWithHook('study-123');

      const tickAndFlush = () => act(() => clock.tick(2000));
      for (let i = 0; i < 35; i += 1) {
        tickAndFlush();
      }

      expect(addAlertStub.calledTwice).to.be.true;

      const thumbAlert = addAlertStub
        .getCalls()
        .find(c => c.args[0] === ALERT_TYPE_IMAGE_THUMBNAIL_ERROR);
      expect(thumbAlert).to.exist;
      expect(thumbAlert.args[1]).to.be.an.instanceOf(Error);
      expect(thumbAlert.args[1].message).to.equal(
        'Thumbnail polling timed out',
      );

      const dicomAlert = addAlertStub
        .getCalls()
        .find(c => c.args[0] === ALERT_TYPE_IMAGE_DICOM_ERROR);
      expect(dicomAlert).to.exist;
      expect(dicomAlert.args[1]).to.be.an.instanceOf(Error);
      expect(dicomAlert.args[1].message).to.equal('DICOM polling timed out');
    });

    it('dispatches only thumbnail error when DICOM is already loaded', () => {
      renderWithHook('study-123', {
        scdfDicom: 'http://example.com/dicom.zip',
      });

      const tickAndFlush = () => act(() => clock.tick(2000));
      for (let i = 0; i < 35; i += 1) {
        tickAndFlush();
      }

      expect(addAlertStub.calledOnce).to.be.true;
      expect(addAlertStub.firstCall.args[0]).to.equal(
        ALERT_TYPE_IMAGE_THUMBNAIL_ERROR,
      );
    });

    it('dispatches only DICOM error when thumbnails are already loaded', () => {
      renderWithHook('study-123', {
        scdfImageThumbnails: [{ url: 'http://example.com/thumb.jpg' }],
      });

      const tickAndFlush = () => act(() => clock.tick(5000));
      for (let i = 0; i < 15; i += 1) {
        tickAndFlush();
      }

      expect(addAlertStub.calledOnce).to.be.true;
      expect(addAlertStub.firstCall.args[0]).to.equal(
        ALERT_TYPE_IMAGE_DICOM_ERROR,
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

    it('does not dispatch multiple timeout alerts per resource', () => {
      renderWithHook('study-123');

      const tickAndFlush = () => act(() => clock.tick(2000));
      for (let i = 0; i < 40; i += 1) {
        tickAndFlush();
      }

      // One for thumbnails, one for DICOM — no duplicates
      expect(addAlertStub.calledTwice).to.be.true;
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

  describe('expectedImageCount', () => {
    beforeEach(() => {
      clock = sinon.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout', 'Date'],
      });
    });

    it('treats partial thumbnails as incomplete when expectedImageCount is provided', () => {
      // 1 thumbnail loaded but 3 expected — should still poll
      const { getByTestId } = renderWithHook(
        'study-123',
        { scdfImageThumbnails: ['http://example.com/1.jpg'] },
        3,
      );
      expect(getByTestId('loaded').textContent).to.equal('false');

      const initialThumbCount = getThumbnailsStub.callCount;
      act(() => {
        clock.tick(2100);
      });
      expect(getThumbnailsStub.callCount).to.be.greaterThan(initialThumbCount);
    });

    it('marks thumbnails loaded when count meets expectedImageCount', () => {
      const { getByTestId } = renderWithHook(
        'study-123',
        {
          scdfImageThumbnails: [
            'http://example.com/1.jpg',
            'http://example.com/2.jpg',
            'http://example.com/3.jpg',
          ],
        },
        3,
      );
      expect(getByTestId('loaded').textContent).to.equal('true');
    });

    it('falls back to length > 0 when expectedImageCount is not provided', () => {
      const { getByTestId } = renderWithHook('study-123', {
        scdfImageThumbnails: ['http://example.com/1.jpg'],
      });
      expect(getByTestId('loaded').textContent).to.equal('true');
    });
  });

  describe('initial fetch guard', () => {
    it('skips initial DICOM fetch when cached for same study', () => {
      renderWithHook('study-123', {
        scdfDicom: 'http://example.com/dicom.zip',
        scdfImageStudyId: 'study-123',
      });
      expect(getDicomStub.called).to.be.false;
      expect(getThumbnailsStub.calledWith('study-123')).to.be.true;
    });

    it('skips initial thumbnail fetch when all thumbnails cached for same study', () => {
      renderWithHook(
        'study-123',
        {
          scdfImageThumbnails: [
            'http://example.com/1.jpg',
            'http://example.com/2.jpg',
          ],
          scdfImageStudyId: 'study-123',
        },
        2,
      );
      expect(getThumbnailsStub.called).to.be.false;
      expect(getDicomStub.calledWith('study-123')).to.be.true;
    });

    it('skips both initial fetches when both cached for same study', () => {
      renderWithHook(
        'study-123',
        {
          scdfImageThumbnails: ['http://example.com/1.jpg'],
          scdfDicom: 'http://example.com/dicom.zip',
          scdfImageStudyId: 'study-123',
        },
        1,
      );
      expect(getThumbnailsStub.called).to.be.false;
      expect(getDicomStub.called).to.be.false;
    });

    it('re-fetches when cached data belongs to a different study', () => {
      const { store } = renderWithHook(
        'study-456',
        {
          scdfImageThumbnails: ['http://example.com/1.jpg'],
          scdfDicom: 'http://example.com/dicom.zip',
          scdfImageStudyId: 'study-123',
        },
        1,
      );
      // Should clear stale cache
      const clearAction = store.dispatch
        .getCalls()
        .find(c => c.args[0]?.type === 'MR_LABS_AND_TESTS_CLEAR_IMAGING_CACHE');
      expect(clearAction).to.exist;
      // Should fetch for the new study
      expect(getThumbnailsStub.calledWith('study-456')).to.be.true;
      expect(getDicomStub.calledWith('study-456')).to.be.true;
    });
  });
});
