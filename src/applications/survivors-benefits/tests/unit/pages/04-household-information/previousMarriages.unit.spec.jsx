import { expect } from 'chai';
import sinon from 'sinon';
import page from '../../../../config/chapters/04-household-information/spouseMarriages';
import { validations } from '../../../../config/validations';

const makeErrors = () => ({ addError: sinon.spy() });

describe('Previous marriages page', () => {
  const { uiSchema, schema, depends } = page;

  it('depends function returns true only for claimantRelationship === SURVIVING_SPOUSE', () => {
    expect(depends).to.be.a('function');
    expect(Boolean(depends({ claimantRelationship: 'SURVIVING_SPOUSE' }))).to.be
      .true;
    expect(Boolean(depends({ claimantRelationship: 'CHILD' }))).to.be.false;
    expect(Boolean(depends({}))).to.be.false;
  });

  it('uiSchema contains the expected previous marriages checklist', () => {
    expect(uiSchema).to.be.an('object');
    expect(uiSchema.recognizedAsSpouse, 'recognizedAsSpouse missing').to.exist;
    expect(uiSchema.hadPreviousMarriages, 'hadPreviousMarriages missing').to
      .exist;
    expect(uiSchema.hadPreviousMarriages.claimant).to.exist;
    expect(uiSchema.hadPreviousMarriages.veteran).to.exist;
    expect(uiSchema.hadPreviousMarriages.neither).to.exist;
  });

  it('schema requires recognizedAsSpouse and hadPreviousMarriages', () => {
    expect(schema).to.be.an('object');
    expect(schema.required).to.include('recognizedAsSpouse');
    expect(schema.required).to.include('hadPreviousMarriages');
  });

  it('uses the previous marriage selections validation', () => {
    const fieldValidations = uiSchema.hadPreviousMarriages['ui:validations'];

    expect(fieldValidations).to.include(validations.previousMarriageSelections);
  });

  it('does not allow neither to be selected with claimant or veteran', () => {
    const errors = makeErrors();

    validations.previousMarriageSelections(errors, {
      claimant: true,
      neither: true,
    });

    expect(errors.addError.calledOnce).to.be.true;
    expect(errors.addError.firstCall.args[0]).to.equal(
      'Select a previous marriage option or “We were never married before”, but not both.',
    );
  });

  it('allows valid previous marriage selections', () => {
    const errors = makeErrors();

    validations.previousMarriageSelections(errors, {
      veteran: true,
    });

    expect(errors.addError.called).to.be.false;
  });
});
