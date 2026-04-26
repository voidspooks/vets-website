import { expect } from 'chai';
import {
  eligibilityScreenerUiSchema,
  eligibilityScreenerSchema,
} from './eligibilityScreener';

describe('chapters/eligibilityScreener', () => {
  describe('uiSchema', () => {
    it('exports a uiSchema object', () => {
      expect(eligibilityScreenerUiSchema).to.be.an('object');
    });

    it('has eligibilityScreener key', () => {
      expect(eligibilityScreenerUiSchema).to.have.property(
        'eligibilityScreener',
      );
    });

    it('has required radio fields for all three eligibility questions', () => {
      const screener = eligibilityScreenerUiSchema.eligibilityScreener;
      expect(screener.enteredServiceOnOrAfterOct2003).to.be.an('object');
      expect(screener.signedNCSContract).to.be.an('object');
      expect(screener.electedEducationIncentive).to.be.an('object');
    });

    it('enteredServiceOnOrAfterOct2003 has ui:required function that returns true', () => {
      const field =
        eligibilityScreenerUiSchema.eligibilityScreener
          .enteredServiceOnOrAfterOct2003;
      expect(field['ui:required']).to.be.a('function');
      expect(field['ui:required']()).to.be.true;
    });

    it('electedEducationIncentive has NOT_SURE as valid label', () => {
      const field =
        eligibilityScreenerUiSchema.eligibilityScreener
          .electedEducationIncentive;
      const labels = field['ui:options']?.labels || {};
      expect(labels).to.have.property('NOT_SURE');
    });
  });

  describe('schema', () => {
    it('exports a schema object', () => {
      expect(eligibilityScreenerSchema).to.be.an('object');
    });

    it('has required eligibilityScreener', () => {
      expect(eligibilityScreenerSchema.required).to.include(
        'eligibilityScreener',
      );
    });

    it('eligibilityScreener has required fields', () => {
      const innerSchema =
        eligibilityScreenerSchema.properties.eligibilityScreener;
      expect(innerSchema.required).to.include('enteredServiceOnOrAfterOct2003');
      expect(innerSchema.required).to.include('signedNCSContract');
      expect(innerSchema.required).to.include('electedEducationIncentive');
    });

    it('electedEducationIncentive has enum with YES, NO, NOT_SURE', () => {
      const enumField =
        eligibilityScreenerSchema.properties.eligibilityScreener.properties
          .electedEducationIncentive;
      expect(enumField.enum).to.include('YES');
      expect(enumField.enum).to.include('NO');
      expect(enumField.enum).to.include('NOT_SURE');
    });
  });
});