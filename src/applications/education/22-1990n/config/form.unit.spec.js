import { expect } from 'chai';
import formConfig from './form';

describe('config/form', () => {
  it('has required top-level properties', () => {
    expect(formConfig).to.be.an('object');
    expect(formConfig.formId).to.equal('22-1990N');
    expect(formConfig.title).to.be.a('string');
    expect(formConfig.chapters).to.be.an('object');
    expect(formConfig.introduction).to.be.a('function');
    expect(formConfig.confirmation).to.be.a('function');
    expect(formConfig.trackingPrefix).to.equal('edu-1990n-');
  });

  it('has saveInProgress messages', () => {
    expect(formConfig.saveInProgress).to.be.an('object');
    expect(formConfig.saveInProgress.messages).to.be.an('object');
    expect(formConfig.saveInProgress.messages.inProgress).to.be.a('string');
    expect(formConfig.saveInProgress.messages.expired).to.be.a('string');
    expect(formConfig.saveInProgress.messages.saved).to.be.a('string');
  });

  it('has prefillEnabled set to true', () => {
    expect(formConfig.prefillEnabled).to.be.true;
  });

  it('has rootUrl', () => {
    expect(formConfig.rootUrl).to.be.a('string');
    expect(formConfig.rootUrl).to.include('1990n');
  });

  it('has submitUrl', () => {
    expect(formConfig.submitUrl).to.be.a('string');
    expect(formConfig.submitUrl).to.include('1990n');
  });

  describe('chapters', () => {
    it('has all expected chapters', () => {
      const chapterKeys = Object.keys(formConfig.chapters);
      expect(chapterKeys).to.include('eligibilityChapter');
      expect(chapterKeys).to.include('applicantInformationChapter');
      expect(chapterKeys).to.include('trainingProgramChapter');
      expect(chapterKeys).to.include('serviceInformationChapter');
      expect(chapterKeys).to.include('additionalAssistanceChapter');
      expect(chapterKeys).to.include('supportingDocumentsChapter');
    });

    it('every page has path, title, uiSchema, and schema', () => {
      Object.values(formConfig.chapters).forEach(chapter => {
        Object.values(chapter.pages).forEach(page => {
          expect(page.path, `page.path for ${page.title}`).to.be.a('string');
          expect(page.title, `page.title for ${page.path}`).to.be.a('string');
          expect(page.uiSchema, `page.uiSchema for ${page.path}`).to.be.an(
            'object',
          );
          expect(page.schema, `page.schema for ${page.path}`).to.be.an(
            'object',
          );
        });
      });
    });

    describe('flightTrainingRequirements depends function', () => {
      const flightPage =
        formConfig.chapters.trainingProgramChapter.pages
          .flightTrainingRequirements;

      it('returns true when vocationalFlightTraining is true', () => {
        const formData = {
          trainingProgram: {
            trainingType: { vocationalFlightTraining: true },
          },
        };
        expect(() => flightPage.depends(formData)).to.not.throw();
        expect(flightPage.depends(formData)).to.be.true;
      });

      it('returns false when vocationalFlightTraining is false', () => {
        const formData = {
          trainingProgram: {
            trainingType: { vocationalFlightTraining: false },
          },
        };
        expect(flightPage.depends(formData)).to.be.false;
      });

      it('returns false when trainingProgram is undefined', () => {
        expect(() => flightPage.depends({})).to.not.throw();
        expect(flightPage.depends({})).to.be.false;
      });

      it('returns false when formData is null', () => {
        expect(() => flightPage.depends(null)).to.not.throw();
        expect(flightPage.depends(null)).to.be.false;
      });
    });

    describe('uploadVoidedCheck depends function', () => {
      const voidedCheckPage =
        formConfig.chapters.supportingDocumentsChapter.pages.uploadVoidedCheck;

      it('returns true when directDeposit.enrolling is true', () => {
        const formData = {
          contactInformation: {
            directDeposit: { enrolling: true },
          },
        };
        expect(() => voidedCheckPage.depends(formData)).to.not.throw();
        expect(voidedCheckPage.depends(formData)).to.be.true;
      });

      it('returns false when directDeposit.enrolling is false', () => {
        const formData = {
          contactInformation: {
            directDeposit: { enrolling: false },
          },
        };
        expect(voidedCheckPage.depends(formData)).to.be.false;
      });

      it('returns false when contactInformation is undefined', () => {
        expect(() => voidedCheckPage.depends({})).to.not.throw();
        expect(voidedCheckPage.depends({})).to.be.false;
      });

      it('returns false when formData is null', () => {
        expect(() => voidedCheckPage.depends(null)).to.not.throw();
        expect(voidedCheckPage.depends(null)).to.be.false;
      });
    });
  });
});