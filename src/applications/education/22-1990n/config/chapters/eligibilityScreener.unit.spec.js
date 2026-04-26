import { expect } from 'chai';
import {
  eligibilityScreenerUiSchema,
  eligibilityScreenerSchema,
} from './eligibilityScreener';

describe('config/chapters/eligibilityScreener', () => {
  it('uiSchema has eligibilityScreener nested keys', () => {
    expect(eligibilityScreenerUiSchema).to.have.property(
      'eligibilityScreener',
    );
    expect(
      eligibilityScreenerUiSchema.eligibilityScreener,
    ).to.have.property('enteredServiceOnOrAfterOct2003');
    expect(
      eligibilityScreenerUiSchema.eligibilityScreener,
    ).to.have.property('signedNCSContract');
    expect(
      eligibilityScreenerUiSchema.eligibilityScreener,
    ).to.have.property('electedEducationIncentive');
  });

  it('schema has correct structure', () => {
    expect(eligibilityScreenerSchema.type).to.equal('object');
    expect(eligibilityScreenerSchema.properties).to.have.property(
      'eligibilityScreener',
    );
  });

  it('electedEducationIncentive schema includes NOT_SURE option', () => {
    const enumValues =
      eligibilityScreenerSchema.properties.eligibilityScreener.properties
        .electedEducationIncentive.enum;
    expect(enumValues).to.include('NOT_SURE');
    expect(enumValues).to.include('YES');
    expect(enumValues).to.include('NO');
  });

  it('required fields are listed in schema', () => {
    const required =
      eligibilityScreenerSchema.properties.eligibilityScreener.required;
    expect(required).to.include('enteredServiceOnOrAfterOct2003');
    expect(required).to.include('signedNCSContract');
    expect(required).to.include('electedEducationIncentive');
  });
});