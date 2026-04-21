import { expect } from 'chai';
import sinon from 'sinon';
import formConfig from '../../../config/form';

describe('21-0788 form config', () => {
  it('exposes the expected identifiers', () => {
    expect(formConfig.formId).to.equal('21-0788');
    expect(formConfig.trackingPrefix).to.equal('ss-0788-');
    expect(formConfig.urlPrefix).to.equal('/');
    expect(formConfig.rootUrl).to.be.a('string');
    expect(formConfig.submitUrl).to.include(
      '/simple_forms_api/v1/simple_forms',
    );
  });

  it('wires up transformForSubmit and prefill', () => {
    expect(formConfig.transformForSubmit).to.be.a('function');
    expect(formConfig.prefillEnabled).to.equal(true);
  });

  it('defines saveInProgress, savedFormMessages, and preSubmitInfo', () => {
    expect(formConfig.saveInProgress.messages).to.include.keys(
      'inProgress',
      'expired',
      'saved',
    );
    expect(formConfig.savedFormMessages).to.include.keys('notFound', 'noAuth');
    expect(formConfig.preSubmitInfo.statementOfTruth.fullNamePath).to.equal(
      'claimant.fullName',
    );
  });

  it('hides the save link after nav buttons (pinned by design review)', () => {
    expect(formConfig.showSaveLinkAfterButtons).to.equal(false);
  });

  describe('chapters', () => {
    it('declares all five chapters in the expected order', () => {
      expect(Object.keys(formConfig.chapters)).to.deep.equal([
        'informationRequiredChapter',
        'veteranInformationChapter',
        'claimantInformationChapter',
        'apportionmentInformationChapter',
        'remarksCertificationChapter',
      ]);
    });

    it('defines a page object for every chapter key we expect', () => {
      expect(
        formConfig.chapters.informationRequiredChapter.pages
          .informationRequiredPage,
      ).to.be.an('object');
      expect(
        formConfig.chapters.veteranInformationChapter.pages
          .veteranInformationPage.path,
      ).to.equal('veteran-identification-information');
      expect(
        formConfig.chapters.claimantInformationChapter.pages
          .claimantInformationPage.path,
      ).to.equal('claimant-information');
      expect(
        formConfig.chapters.remarksCertificationChapter.pages
          .remarksCertificationPage.path,
      ).to.equal('remarks-and-certification');
    });

    it('spreads the requested-people and reason pages into the apportionment chapter', () => {
      const { pages } = formConfig.chapters.apportionmentInformationChapter;

      expect(pages).to.have.any.keys(
        'requestedApportionmentPeopleIntro',
        'requestedApportionmentPeopleSummary',
        'apportionmentReasonPage',
        'facilityInformationPage',
      );
    });
  });

  describe('onFormLoaded', () => {
    it('redirects to the intro when returnUrl is missing', () => {
      const router = { push: () => {} };
      const pushSpy = sinon.spy(router, 'push');

      formConfig.onFormLoaded({
        returnUrl: undefined,
        router,
        routes: [{ pageList: [] }],
        formData: {},
        formConfig: { urlPrefix: '/' },
      });

      expect(pushSpy.calledOnce).to.equal(true);
      expect(pushSpy.firstCall.args[0]).to.equal('/introduction');
    });

    it('keeps a valid returnUrl when the page list contains it', () => {
      const router = { push: () => {} };
      const pushSpy = sinon.spy(router, 'push');

      formConfig.onFormLoaded({
        returnUrl: '/veteran-identification-information',
        router,
        routes: [
          {
            pageList: [
              { path: '/introduction', pageKey: 'intro' },
              {
                path: '/veteran-identification-information',
                pageKey: 'veteran',
              },
            ],
          },
        ],
        formData: {},
        formConfig: { urlPrefix: '/' },
      });

      expect(pushSpy.calledOnce).to.equal(true);
      expect(pushSpy.firstCall.args[0]).to.equal(
        '/veteran-identification-information',
      );
    });

    it('falls back when returnUrl is not in the valid page list', () => {
      const router = { push: () => {} };
      const pushSpy = sinon.spy(router, 'push');

      formConfig.onFormLoaded({
        returnUrl: '/some/unknown/path',
        router,
        routes: [
          {
            pageList: [{ path: '/introduction', pageKey: 'intro' }],
          },
        ],
        formData: {},
        formConfig: { urlPrefix: '/' },
      });

      expect(pushSpy.calledOnce).to.equal(true);
      expect(pushSpy.firstCall.args[0]).to.equal('/introduction');
    });

    it('tolerates routes with no pageList', () => {
      const router = { push: () => {} };
      const pushSpy = sinon.spy(router, 'push');

      formConfig.onFormLoaded({
        returnUrl: undefined,
        router,
        routes: undefined,
        formData: {},
        formConfig: {},
      });

      expect(pushSpy.calledOnce).to.equal(true);
      expect(pushSpy.firstCall.args[0]).to.equal('/introduction');
    });
  });
});
