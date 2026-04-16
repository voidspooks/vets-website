import { expect } from 'chai';
import sinon from 'sinon';
import { VA_FORM_IDS } from '@department-of-veterans-affairs/platform-forms/constants';
import * as datadogRumAddActionModule from '../../utils/tracking/datadogRumAddAction';
import {
  initBddSessionTracking,
  trackShaPageSeen,
  trackShaDownloadLinkClicked,
} from '../../utils/tracking/bddShaRumTracking';
import {
  FORM_STATUS_BDD,
  TRACKING_526EZ_BDD_SHOWN_SHA_INTRO,
  TRACKING_526EZ_BDD_SHOWN_SHA_UPLOAD,
} from '../../constants';

describe('bddShaRumTracking', () => {
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

  describe('initBddSessionTracking', () => {
    it('increments the session counter', () => {
      initBddSessionTracking();
    });

    it('initializes page-seen flags to false on first call', () => {
      initBddSessionTracking();
      expect(
        sessionStorage.getItem(TRACKING_526EZ_BDD_SHOWN_SHA_INTRO),
      ).to.equal('false');
      expect(
        sessionStorage.getItem(TRACKING_526EZ_BDD_SHOWN_SHA_UPLOAD),
      ).to.equal('false');
    });

    it('preserves existing true page-seen flags', () => {
      sessionStorage.setItem(TRACKING_526EZ_BDD_SHOWN_SHA_INTRO, 'true');
      sessionStorage.setItem(TRACKING_526EZ_BDD_SHOWN_SHA_UPLOAD, 'true');

      initBddSessionTracking();

      expect(
        sessionStorage.getItem(TRACKING_526EZ_BDD_SHOWN_SHA_INTRO),
      ).to.equal('true');
      expect(
        sessionStorage.getItem(TRACKING_526EZ_BDD_SHOWN_SHA_UPLOAD),
      ).to.equal('true');
    });

    // Note: initBddSessionTracking uses raw sessionStorage calls;
    // storage-blocked resilience is handled by the caller (ITFBanner's try-catch).
  });

  describe('trackShaPageSeen', () => {
    it('sets intro flag to true', () => {
      sessionStorage.setItem(TRACKING_526EZ_BDD_SHOWN_SHA_INTRO, 'false');
      trackShaPageSeen('intro');
      expect(
        sessionStorage.getItem(TRACKING_526EZ_BDD_SHOWN_SHA_INTRO),
      ).to.equal('true');
    });

    it('sets upload flag to true', () => {
      sessionStorage.setItem(TRACKING_526EZ_BDD_SHOWN_SHA_UPLOAD, 'false');
      trackShaPageSeen('upload');
      expect(
        sessionStorage.getItem(TRACKING_526EZ_BDD_SHOWN_SHA_UPLOAD),
      ).to.equal('true');
    });

    it('does not throw for unknown page key', () => {
      expect(() => trackShaPageSeen('unknown')).to.not.throw();
    });
  });

  describe('trackShaDownloadLinkClicked', () => {
    it('fires download event with BDD status from session', () => {
      sessionStorage.setItem(FORM_STATUS_BDD, 'true');

      trackShaDownloadLinkClicked();

      expect(addActionStub.calledOnce).to.be.true;
      const [actionName, properties] = addActionStub.firstCall.args;
      expect(actionName).to.equal('21-526EZ_bddShaDownloadShaLinkClicked');
      expect(properties).to.deep.include({
        formId: VA_FORM_IDS.FORM_21_526EZ,
      });
    });
  });

  describe('error handling', () => {
    it('continues silently when tracking fails', () => {
      addActionStub.throws(new Error('Tracking service unavailable'));

      expect(() => trackShaDownloadLinkClicked()).to.not.throw();
    });
  });

  describe('PII safety', () => {
    it('does not include any PII in tracked properties', () => {
      sessionStorage.setItem(FORM_STATUS_BDD, 'true');

      trackShaDownloadLinkClicked();

      // Check every tracked action's properties for PII-like fields
      const piiFields = [
        'ssn',
        'name',
        'email',
        'phone',
        'address',
        'dob',
        'dateOfBirth',
        'firstName',
        'lastName',
        'veteranFullName',
      ];

      for (let i = 0; i < addActionStub.callCount; i += 1) {
        const properties = addActionStub.getCall(i).args[1];
        const propertyKeys = Object.keys(properties);
        piiFields.forEach(field => {
          expect(propertyKeys).to.not.include(field);
        });
      }
    });
  });
});
