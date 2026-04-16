import { expect } from 'chai';
import sinon from 'sinon';
import { VA_FORM_IDS } from '@department-of-veterans-affairs/platform-forms/constants';
import * as datadogRumAddActionModule from '../../utils/tracking/datadogRumAddAction';
import {
  trackBackButtonClick,
  trackContinueButtonClick,
  trackFormStarted,
  trackFormResumption,
} from '../../utils/tracking/datadogRumTracking';
import {
  TRACKING_526EZ_SIDENAV_BACK_BUTTON_CLICKS,
  TRACKING_526EZ_SIDENAV_CONTINUE_BUTTON_CLICKS,
  TRACKING_526EZ_SIDENAV_FEATURE_TOGGLE,
} from '../../constants';

describe('datadogRumTracking', () => {
  let addActionStub;

  beforeEach(() => {
    addActionStub = sinon.stub(
      datadogRumAddActionModule,
      'datadogRumAddAction',
    );
    sessionStorage.clear();
  });

  afterEach(() => {
    addActionStub.restore();
  });

  describe('trackBackButtonClick', () => {
    it('tracks back button clicks and increments the counter', () => {
      sessionStorage.setItem(TRACKING_526EZ_SIDENAV_FEATURE_TOGGLE, 'true');

      trackBackButtonClick();

      expect(
        sessionStorage.getItem(TRACKING_526EZ_SIDENAV_BACK_BUTTON_CLICKS),
      ).to.equal('1');
      expect(addActionStub.calledOnce).to.be.true;

      const [actionName, properties] = addActionStub.firstCall.args;
      expect(actionName).to.equal('Form navigation - Back button clicked');
      expect(properties).to.include({
        formId: VA_FORM_IDS.FORM_21_526EZ,
        backButtonClickCount: 1,
        sidenav526ezEnabled: true,
      });
      expect(properties.sourcePath).to.be.a('string');
    });

    it('increments counter on multiple clicks', () => {
      sessionStorage.setItem(TRACKING_526EZ_SIDENAV_FEATURE_TOGGLE, 'true');

      trackBackButtonClick();
      trackBackButtonClick();
      trackBackButtonClick();

      expect(
        sessionStorage.getItem(TRACKING_526EZ_SIDENAV_BACK_BUTTON_CLICKS),
      ).to.equal('3');
      expect(addActionStub.callCount).to.equal(3);

      const thirdCallProps = addActionStub.thirdCall.args[1];
      expect(thirdCallProps.backButtonClickCount).to.equal(3);
    });

    it('works when sidenav toggle is not set', () => {
      trackBackButtonClick();

      expect(addActionStub.calledOnce).to.be.true;
      const [, properties] = addActionStub.firstCall.args;
      expect(properties).to.not.have.property('sidenav526ezEnabled');
    });

    it('does not throw when sessionStorage is blocked', () => {
      const storageProto = Object.getPrototypeOf(sessionStorage);
      const setItemStub = sinon
        .stub(storageProto, 'setItem')
        .throws(new Error('QuotaExceededError'));
      const getItemStub = sinon
        .stub(storageProto, 'getItem')
        .throws(new Error('SecurityError'));

      try {
        expect(() => trackBackButtonClick()).to.not.throw();
        expect(addActionStub.calledOnce).to.be.true;

        const [, properties] = addActionStub.firstCall.args;
        expect(properties.formId).to.equal(VA_FORM_IDS.FORM_21_526EZ);
        expect(properties).to.not.have.property('backButtonClickCount');
      } finally {
        setItemStub.restore();
        getItemStub.restore();
      }
    });
  });

  describe('trackContinueButtonClick', () => {
    it('tracks continue button clicks and increments the counter', () => {
      sessionStorage.setItem(TRACKING_526EZ_SIDENAV_FEATURE_TOGGLE, 'false');

      trackContinueButtonClick();

      expect(
        sessionStorage.getItem(TRACKING_526EZ_SIDENAV_CONTINUE_BUTTON_CLICKS),
      ).to.equal('1');
      expect(addActionStub.calledOnce).to.be.true;

      const [actionName, properties] = addActionStub.firstCall.args;
      expect(actionName).to.equal('Form navigation - Continue button clicked');
      expect(properties).to.include({
        formId: VA_FORM_IDS.FORM_21_526EZ,
        continueButtonClickCount: 1,
        sidenav526ezEnabled: false,
      });
      expect(properties.sourcePath).to.be.a('string');
    });

    it('increments counter on multiple clicks', () => {
      trackContinueButtonClick();
      trackContinueButtonClick();

      expect(
        sessionStorage.getItem(TRACKING_526EZ_SIDENAV_CONTINUE_BUTTON_CLICKS),
      ).to.equal('2');

      const secondCallProps = addActionStub.secondCall.args[1];
      expect(secondCallProps.continueButtonClickCount).to.equal(2);
    });
  });

  describe('trackFormStarted', () => {
    it('tracks when form is started from introduction page', () => {
      sessionStorage.setItem(TRACKING_526EZ_SIDENAV_FEATURE_TOGGLE, 'true');

      trackFormStarted();

      expect(addActionStub.calledOnce).to.be.true;

      const [actionName, properties] = addActionStub.firstCall.args;
      expect(actionName).to.equal('21-526EZ_claimStarted');
      expect(properties).to.include({
        formId: VA_FORM_IDS.FORM_21_526EZ,
        sidenav526ezEnabled: true,
      });
      expect(properties.sourcePath).to.be.a('string');
      // Should not have click counts on first form start
      expect(properties).to.not.have.property('backButtonClickCount');
      expect(properties).to.not.have.property('continueButtonClickCount');
      expect(properties).to.not.have.property('sideNavClickCount');
    });

    it('does not throw when datadogRum.addAction fails', () => {
      addActionStub.throws(new Error('fail'));

      expect(() => trackFormStarted()).to.not.throw();
    });
  });

  describe('trackFormResumption', () => {
    it('tracks when form is resumed', () => {
      sessionStorage.setItem(TRACKING_526EZ_SIDENAV_FEATURE_TOGGLE, 'true');

      trackFormResumption();

      expect(addActionStub.calledOnce).to.be.true;

      const [actionName, properties] = addActionStub.firstCall.args;
      expect(actionName).to.equal('Form resumption - Saved form loaded');
      expect(properties).to.include({
        formId: VA_FORM_IDS.FORM_21_526EZ,
        sidenav526ezEnabled: true,
      });
      expect(properties.sourcePath).to.be.a('string');
    });

    it('works without sidenav toggle set', () => {
      trackFormResumption();

      const [, properties] = addActionStub.firstCall.args;
      expect(properties).to.not.have.property('sidenav526ezEnabled');
    });
  });

  describe('error handling', () => {
    it('continues silently when tracking fails', () => {
      addActionStub.throws(new Error('Tracking service unavailable'));

      expect(() => trackBackButtonClick()).to.not.throw();
      expect(() => trackContinueButtonClick()).to.not.throw();
      expect(() => trackFormStarted()).to.not.throw();
      expect(() => trackFormResumption()).to.not.throw();
    });
  });
});
