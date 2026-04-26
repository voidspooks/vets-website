import { expect } from 'chai';
import {
  additionalAssistanceUiSchema,
  additionalAssistanceSchema,
} from './additionalAssistance';

describe('chapters/additionalAssistance', () => {
  describe('uiSchema', () => {
    it('exports a uiSchema object', () => {
      expect(additionalAssistanceUiSchema).to.be.an('object');
    });

    it('has all required fields', () => {
      const aa = additionalAssistanceUiSchema.additionalAssistance;
      expect(aa.isSeniorROTCScholar).to.be.an('object');
      expect(aa.isCivilianGovEmployee).to.be.an('object');
      expect(aa.receivingFederalTuitionAssist).to.be.an('object');
      expect(aa.receivingAgencyFunds).to.be.an('object');
      expect(aa.agencyFundsSource).to.be.an('object');
    });

    it('isSeniorROTCScholar has ui:required returning true', () => {
      const aa = additionalAssistanceUiSchema.additionalAssistance;
      expect(aa.isSeniorROTCScholar['ui:required']).to.be.a('function');
      expect(aa.isSeniorROTCScholar['ui:required']()).to.be.true;
    });
  });

  describe('schema', () => {
    it('exports a schema object', () => {
      expect(additionalAssistanceSchema).to.be.an('object');
    });

    it('additionalAssistance is required', () => {
      expect(additionalAssistanceSchema.required).to.include(
        'additionalAssistance',
      );
    });

    it('isSeniorROTCScholar and isCivilianGovEmployee are required', () => {
      const aa =
        additionalAssistanceSchema.properties.additionalAssistance;
      expect(aa.required).to.include('isSeniorROTCScholar');
      expect(aa.required).to.include('isCivilianGovEmployee');
    });

    it('agencyFundsSource has maxLength 100', () => {
      const afs =
        additionalAssistanceSchema.properties.additionalAssistance.properties
          .agencyFundsSource;
      expect(afs.maxLength).to.equal(100);
    });
  });
});