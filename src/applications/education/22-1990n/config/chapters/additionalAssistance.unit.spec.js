import { expect } from 'chai';
import {
  additionalAssistanceUiSchema,
  additionalAssistanceSchema,
} from './additionalAssistance';

describe('config/chapters/additionalAssistance', () => {
  it('uiSchema has additionalAssistance with isSeniorROTCScholar', () => {
    expect(additionalAssistanceUiSchema).to.have.property(
      'additionalAssistance',
    );
    expect(
      additionalAssistanceUiSchema.additionalAssistance,
    ).to.have.property('isSeniorROTCScholar');
  });

  it('uiSchema has receivingFederalTuitionAssist with hideIf', () => {
    const field =
      additionalAssistanceUiSchema.additionalAssistance
        .receivingFederalTuitionAssist;
    expect(field['ui:options']).to.have.property('hideIf');
  });

  it('receivingFederalTuitionAssist hideIf returns true when not active duty', () => {
    const hideIf =
      additionalAssistanceUiSchema.additionalAssistance
        .receivingFederalTuitionAssist['ui:options'].hideIf;
    expect(
      hideIf({ serviceInformation: { isActiveDuty: false } }),
    ).to.equal(true);
    expect(
      hideIf({ serviceInformation: { isActiveDuty: true } }),
    ).to.equal(false);
  });

  it('agencyFundsSource hideIf hides when receivingAgencyFunds is not true', () => {
    const hideIf =
      additionalAssistanceUiSchema.additionalAssistance.agencyFundsSource[
        'ui:options'
      ].hideIf;
    expect(
      hideIf({ additionalAssistance: { receivingAgencyFunds: false } }),
    ).to.equal(true);
    expect(
      hideIf({ additionalAssistance: { receivingAgencyFunds: true } }),
    ).to.equal(false);
  });

  it('schema requires isSeniorROTCScholar', () => {
    const required =
      additionalAssistanceSchema.properties.additionalAssistance.required;
    expect(required).to.include('isSeniorROTCScholar');
  });

  it('agencyFundsSource schema has maxLength of 100', () => {
    const schema =
      additionalAssistanceSchema.properties.additionalAssistance.properties
        .agencyFundsSource;
    expect(schema.maxLength).to.equal(100);
  });
});