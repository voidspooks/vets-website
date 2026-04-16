import { expect } from 'chai';
import sinon from 'sinon';
import { VA_FORM_IDS } from '@department-of-veterans-affairs/platform-forms/constants';
import * as datadogRumAddActionModule from '../../utils/tracking/datadogRumAddAction';
import {
  trackSideNavChapterClick,
  trackMobileAccordionClick,
} from '../../utils/tracking/sideNavRumTracking';
import { TRACKING_526EZ_SIDENAV_CLICKS } from '../../constants';

describe('sideNavRumTracking', () => {
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

  describe('trackSideNavChapterClick', () => {
    it('tracks side nav chapter clicks', () => {
      const pageData = {
        label: 'Veteran details',
        key: 'veteran-info',
        path: '/veteran-information',
      };
      const pathname = '/disabilities/conditions';

      trackSideNavChapterClick({ pageData, pathname });

      expect(addActionStub.calledOnce).to.be.true;
      expect(sessionStorage.getItem(TRACKING_526EZ_SIDENAV_CLICKS)).to.equal(
        '1',
      );

      const [actionName, properties] = addActionStub.firstCall.args;
      expect(actionName).to.equal('Side navigation - Chapter clicked');
      expect(properties).to.deep.include({
        formId: VA_FORM_IDS.FORM_21_526EZ,
        chapterTitle: 'Veteran details',
        sourcePath: '/disabilities/conditions',
        sideNavClickCount: 1,
      });
    });

    it('increments click counter across multiple chapter clicks', () => {
      const pageData1 = { label: 'Chapter 1' };
      const pageData2 = { label: 'Chapter 2' };
      const pathname = '/test-path';

      trackSideNavChapterClick({ pageData: pageData1, pathname });
      trackSideNavChapterClick({ pageData: pageData2, pathname });

      expect(sessionStorage.getItem(TRACKING_526EZ_SIDENAV_CLICKS)).to.equal(
        '2',
      );

      const secondCallProps = addActionStub.secondCall.args[1];
      expect(secondCallProps.sideNavClickCount).to.equal(2);
      expect(secondCallProps.chapterTitle).to.equal('Chapter 2');
    });

    it('does not throw with missing params and tracks with defaults', () => {
      expect(() => trackSideNavChapterClick()).to.not.throw();

      expect(addActionStub.calledOnce).to.be.true;
      const [, properties] = addActionStub.firstCall.args;
      expect(properties.chapterTitle).to.equal('');
      expect(properties.sourcePath).to.equal('');
    });
  });

  describe('trackMobileAccordionClick', () => {
    it('tracks mobile accordion expand', () => {
      const params = {
        pathname: '/veteran-information',
        state: 'expanded',
        accordionTitle: 'Form steps',
      };

      trackMobileAccordionClick(params);

      expect(addActionStub.calledOnce).to.be.true;
      expect(sessionStorage.getItem(TRACKING_526EZ_SIDENAV_CLICKS)).to.equal(
        '1',
      );

      const [actionName, properties] = addActionStub.firstCall.args;
      expect(actionName).to.equal('Side navigation - Mobile accordion clicked');
      expect(properties).to.deep.include({
        formId: VA_FORM_IDS.FORM_21_526EZ,
        state: 'expanded',
        accordionTitle: 'Form steps',
        sourcePath: '/veteran-information',
        sideNavClickCount: 1,
      });
    });

    it('tracks mobile accordion collapse', () => {
      const params = {
        pathname: '/disabilities/conditions',
        state: 'collapsed',
        accordionTitle: 'Form steps',
      };

      trackMobileAccordionClick(params);

      const [, properties] = addActionStub.firstCall.args;
      expect(properties.state).to.equal('collapsed');
    });

    it('shares click counter with chapter clicks', () => {
      const pageData = { label: 'Test Chapter' };
      const pathname = '/test';

      trackSideNavChapterClick({ pageData, pathname });
      trackMobileAccordionClick({
        pathname,
        state: 'expanded',
        accordionTitle: 'Steps',
      });

      expect(sessionStorage.getItem(TRACKING_526EZ_SIDENAV_CLICKS)).to.equal(
        '2',
      );

      const secondCallProps = addActionStub.secondCall.args[1];
      expect(secondCallProps.sideNavClickCount).to.equal(2);
    });

    it('does not throw with missing params and tracks with defaults', () => {
      expect(() => trackMobileAccordionClick()).to.not.throw();

      expect(addActionStub.calledOnce).to.be.true;
      const [, properties] = addActionStub.firstCall.args;
      expect(properties.sourcePath).to.equal('');
      expect(properties.state).to.equal('');
      expect(properties.accordionTitle).to.equal('');
    });
  });

  describe('error handling', () => {
    it('continues silently when tracking fails', () => {
      addActionStub.restore();
      addActionStub = sinon
        .stub(datadogRumAddActionModule, 'datadogRumAddAction')
        .throws(new Error('Tracking service unavailable'));

      expect(() =>
        trackSideNavChapterClick({
          pageData: { label: 'Test' },
          pathname: '/test',
        }),
      ).to.not.throw();
      expect(() =>
        trackMobileAccordionClick({
          pathname: '/test',
          state: 'expanded',
          accordionTitle: 'Test',
        }),
      ).to.not.throw();
    });
  });
});
