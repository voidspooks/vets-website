import { expect } from 'chai';
import formConfig from './form';

describe('config/form', () => {
  it('has required top-level properties', () => {
    expect(formConfig).to.have.property('formId');
    expect(formConfig).to.have.property('title');
    expect(formConfig).to.have.property('chapters');
    expect(formConfig).to.have.property('introduction');
    expect(formConfig).to.have.property('confirmation');
    expect(formConfig).to.have.property('saveInProgress');
    expect(formConfig).to.have.property('trackingPrefix');
  });

  it('has saveInProgress messages', () => {
    expect(formConfig.saveInProgress.messages).to.have.property(
      'inProgress',
    );
    expect(formConfig.saveInProgress.messages).to.have.property('expired');
    expect(formConfig.saveInProgress.messages).to.have.property('saved');
  });

  it('has trackingPrefix starting with "edu-1990n"', () => {
    expect(formConfig.trackingPrefix).to.include('edu-1990n');
  });

  it('has prefillEnabled set to true', () => {
    expect(formConfig.prefillEnabled).to.equal(true);
  });

  it('has expected chapters', () => {
    const chapterKeys = Object.keys(formConfig.chapters);
    expect(chapterKeys).to.include('eligibilityChapter');
    expect(chapterKeys).to.include('applicantInformationChapter');
    expect(chapterKeys).to.include('trainingProgramChapter');
    expect(chapterKeys).to.include('serviceInformationChapter');
    expect(chapterKeys).to.include('additionalAssistanceChapter');
    expect(chapterKeys).to.include('supportingDocumentsChapter');
  });

  it('every page has required path, title, uiSchema, schema', () => {
    Object.entries(formConfig.chapters).forEach(([, chapter]) => {
      Object.entries(chapter.pages).forEach(([, page]) => {
        expect(page, `page ${page.path}`).to.have.property('path');
        expect(page, `page ${page.path}`).to.have.property('title');
        expect(page, `page ${page.path}`).to.have.property('uiSchema');
        expect(page, `page ${page.path}`).to.have.property('schema');
      });
    });
  });

  it('flightTrainingRequirements page has a depends function', () => {
    const page =
      formConfig.chapters.trainingProgramChapter.pages
        .flightTrainingRequirements;
    expect(page.depends).to.be.a('function');
  });

  it('flightTrainingRequirements depends returns true when vocationalFlightTraining is true', () => {
    const { depends } =
      formConfig.chapters.trainingProgramChapter.pages
        .flightTrainingRequirements;
    const result = depends({
      trainingProgram: { trainingType: { vocationalFlightTraining: true } },
    });
    expect(result).to.equal(true);
  });

  it('flightTrainingRequirements depends returns false when vocationalFlightTraining is false', () => {
    const { depends } =
      formConfig.chapters.trainingProgramChapter.pages
        .flightTrainingRequirements;
    const result = depends({
      trainingProgram: { trainingType: { vocationalFlightTraining: false } },
    });
    expect(result).to.equal(false);
  });

  it('flightTrainingRequirements depends returns false when formData is null', () => {
    const { depends } =
      formConfig.chapters.trainingProgramChapter.pages
        .flightTrainingRequirements;
    expect(() => depends(null)).to.not.throw();
    expect(depends(null)).to.equal(false);
  });

  it('uploadVoidedCheck page has a depends function', () => {
    const page =
      formConfig.chapters.supportingDocumentsChapter.pages.uploadVoidedCheck;
    expect(page.depends).to.be.a('function');
  });

  it('uploadVoidedCheck depends returns true when directDepositEnrolling is true', () => {
    const { depends } =
      formConfig.chapters.supportingDocumentsChapter.pages.uploadVoidedCheck;
    expect(depends({ directDepositEnrolling: true })).to.equal(true);
  });

  it('uploadVoidedCheck depends returns false when directDepositEnrolling is false', () => {
    const { depends } =
      formConfig.chapters.supportingDocumentsChapter.pages.uploadVoidedCheck;
    expect(depends({ directDepositEnrolling: false })).to.equal(false);
  });

  it('uploadVoidedCheck depends handles null input without throwing', () => {
    const { depends } =
      formConfig.chapters.supportingDocumentsChapter.pages.uploadVoidedCheck;
    expect(() => depends(null)).to.not.throw();
  });

  it('submitUrl points to the 1990n endpoint', () => {
    expect(formConfig.submitUrl).to.include('1990n');
  });
});