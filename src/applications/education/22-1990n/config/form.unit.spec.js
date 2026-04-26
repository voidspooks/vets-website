import { expect } from 'chai';
import formConfig from './form';

describe('formConfig', () => {
  it('has required top-level properties', () => {
    expect(formConfig).to.have.property('formId');
    expect(formConfig).to.have.property('title');
    expect(formConfig).to.have.property('chapters');
    expect(formConfig).to.have.property('introduction');
    expect(formConfig).to.have.property('confirmation');
    expect(formConfig).to.have.property('transformForSubmit');
    expect(formConfig).to.have.property('trackingPrefix');
  });

  it('has saveInProgress messages', () => {
    expect(formConfig.saveInProgress).to.have.property('messages');
    expect(formConfig.saveInProgress.messages).to.have.property('inProgress');
    expect(formConfig.saveInProgress.messages).to.have.property('expired');
    expect(formConfig.saveInProgress.messages).to.have.property('saved');
  });

  it('has correct formId', () => {
    expect(formConfig.formId).to.be.a('string');
    expect(formConfig.formId.toLowerCase()).to.include('1990n');
  });

  it('has prefillEnabled true', () => {
    expect(formConfig.prefillEnabled).to.equal(true);
  });

  it('has rootUrl matching manifest', () => {
    expect(formConfig.rootUrl).to.include('1990n');
  });

  it('has all required chapters', () => {
    const chapters = Object.keys(formConfig.chapters);
    expect(chapters).to.include('applicantInformation');
    expect(chapters).to.include('educationTraining');
    expect(chapters).to.include('serviceInformation');
    expect(chapters).to.include('concurrentBenefits');
    expect(chapters).to.include('directDeposit');
  });

  it('every page has path, title, uiSchema, and schema', () => {
    Object.entries(formConfig.chapters).forEach(([chapterName, chapter]) => {
      Object.entries(chapter.pages).forEach(([pageName, page]) => {
        expect(page, `${chapterName}.${pageName} missing path`).to.have.property('path');
        expect(page, `${chapterName}.${pageName} missing title`).to.have.property('title');
        expect(page, `${chapterName}.${pageName} missing uiSchema`).to.have.property('uiSchema');
        expect(page, `${chapterName}.${pageName} missing schema`).to.have.property('schema');
      });
    });
  });

  describe('depends functions', () => {
    it('flightTrainingRequirements depends: returns true when vocationalFlightTraining selected', () => {
      const page = formConfig.chapters.educationTraining.pages.flightTrainingRequirements;
      expect(page.depends).to.be.a('function');
      expect(() =>
        page.depends({ typeOfEducation: ['vocationalFlightTraining'] }),
      ).to.not.throw();
      expect(
        page.depends({ typeOfEducation: ['vocationalFlightTraining'] }),
      ).to.equal(true);
    });

    it('flightTrainingRequirements depends: returns false when not selected', () => {
      const page = formConfig.chapters.educationTraining.pages.flightTrainingRequirements;
      expect(page.depends({ typeOfEducation: ['collegeOrOtherSchool'] })).to.equal(false);
    });

    it('flightTrainingRequirements depends: returns false for null/undefined', () => {
      const page = formConfig.chapters.educationTraining.pages.flightTrainingRequirements;
      expect(() => page.depends({})).to.not.throw();
      expect(page.depends({})).to.equal(false);
      expect(() => page.depends({ typeOfEducation: null })).to.not.throw();
    });

    it('federalTuitionAssistance depends: returns true when activeDuty is true', () => {
      const page = formConfig.chapters.concurrentBenefits.pages.federalTuitionAssistance;
      expect(page.depends).to.be.a('function');
      expect(() => page.depends({ activeDuty: true })).to.not.throw();
      expect(page.depends({ activeDuty: true })).to.equal(true);
    });

    it('federalTuitionAssistance depends: returns false when activeDuty is false', () => {
      const page = formConfig.chapters.concurrentBenefits.pages.federalTuitionAssistance;
      expect(page.depends({ activeDuty: false })).to.equal(false);
    });

    it('federalTuitionAssistance depends: handles null gracefully', () => {
      const page = formConfig.chapters.concurrentBenefits.pages.federalTuitionAssistance;
      expect(() => page.depends({})).to.not.throw();
      expect(() => page.depends(null)).to.not.throw();
    });

    it('uploadBankDocument depends: returns true when bankAccount with routing and no opt-out', () => {
      const page = formConfig.chapters.directDeposit.pages.uploadBankDocument;
      expect(page.depends).to.be.a('function');
      expect(() =>
        page.depends({
          directDeposit: {
            bankAccount: { routingNumber: '123456789' },
            noDirectDeposit: {},
          },
        }),
      ).to.not.throw();
      expect(
        page.depends({
          directDeposit: {
            bankAccount: { routingNumber: '123456789' },
            noDirectDeposit: {},
          },
        }),
      ).to.equal(true);
    });

    it('uploadBankDocument depends: returns false when opted out', () => {
      const page = formConfig.chapters.directDeposit.pages.uploadBankDocument;
      expect(
        page.depends({
          directDeposit: {
            bankAccount: { routingNumber: '123456789' },
            noDirectDeposit: { declined: true },
          },
        }),
      ).to.equal(false);
    });

    it('uploadBankDocument depends: returns false when no bankAccount', () => {
      const page = formConfig.chapters.directDeposit.pages.uploadBankDocument;
      expect(page.depends({})).to.equal(false);
      expect(page.depends({ directDeposit: {} })).to.equal(false);
    });
  });
});