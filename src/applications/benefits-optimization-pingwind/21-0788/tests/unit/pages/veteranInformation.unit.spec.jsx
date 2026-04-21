import { expect } from 'chai';
import veteranInformation from '../../../pages/veteranInformation';
import {
  veteranFields,
  veteranInformationText,
} from '../../../definitions/constants';

describe('21-0788 veteranInformation page', () => {
  const { schema, uiSchema } = veteranInformation;
  const veteranSchema = schema.properties[veteranFields.parentObject];
  const veteranUiSchema = uiSchema[veteranFields.parentObject];
  const dobValidation =
    veteranUiSchema[veteranFields.dateOfBirth]['ui:validations'][0];

  const captureErrors = () => {
    const collected = [];
    return {
      errors: { addError: value => collected.push(value) },
      collected,
    };
  };

  it('exposes the veteran parent object and required fields', () => {
    expect(schema.properties).to.have.property(veteranFields.parentObject);
    expect(veteranSchema.required).to.include.members([
      veteranFields.fullName,
      veteranFields.dateOfBirth,
      veteranFields.ssn,
    ]);
  });

  it('defines every veteran-info field in the schema', () => {
    expect(veteranSchema.properties[veteranFields.fullName]).to.exist;
    expect(veteranSchema.properties[veteranFields.dateOfBirth]).to.exist;
    expect(veteranSchema.properties[veteranFields.ssn]).to.exist;
    expect(veteranSchema.properties[veteranFields.vaFileNumber]).to.exist;
  });

  it('uses no suffix and a 1-char middle initial limit', () => {
    const fullNameSchema = veteranSchema.properties[veteranFields.fullName];
    expect(fullNameSchema.properties.first).to.exist;
    expect(fullNameSchema.properties.middle.maxLength).to.equal(1);
    expect(fullNameSchema.properties.last).to.exist;
    expect(fullNameSchema.properties.suffix).to.not.exist;
  });

  it('uses the DOB error messages and hint from constants', () => {
    const dobUi = veteranUiSchema[veteranFields.dateOfBirth];
    expect(dobUi['ui:options'].hint).to.equal(
      veteranInformationText.dateOfBirthHint,
    );
    expect(dobUi['ui:errorMessages'].required).to.equal(
      veteranInformationText.dateOfBirthRequiredError,
    );
    expect(dobUi['ui:errorMessages'].pattern).to.equal(
      veteranInformationText.dateOfBirthPatternError,
    );
    expect(dobUi['ui:validations']).to.have.lengthOf(1);
  });

  it('uses the SSN error messages from constants', () => {
    const ssnUi = veteranUiSchema[veteranFields.ssn];
    expect(ssnUi['ui:errorMessages'].required).to.equal(
      veteranInformationText.ssnRequiredError,
    );
    expect(ssnUi['ui:errorMessages'].pattern).to.equal(
      veteranInformationText.ssnPatternError,
    );
  });

  it('hides empty VA file number in review', () => {
    const fileNumberUi = veteranUiSchema[veteranFields.vaFileNumber];
    expect(fileNumberUi['ui:options'].hideEmptyValueInReview).to.equal(true);
  });

  describe('validateDateOfBirth branches', () => {
    it('flags an empty value as required', () => {
      const { errors, collected } = captureErrors();
      dobValidation(errors, '');
      expect(collected).to.deep.equal([
        veteranInformationText.dateOfBirthRequiredError,
      ]);
    });

    it('flags an undefined value as required', () => {
      const { errors, collected } = captureErrors();
      dobValidation(errors, undefined);
      expect(collected).to.deep.equal([
        veteranInformationText.dateOfBirthRequiredError,
      ]);
    });

    it('flags a partial date string as incomplete', () => {
      const { errors, collected } = captureErrors();
      dobValidation(errors, '2000-01-XX'); // day is non-numeric -> missing
      expect(collected).to.deep.equal([
        veteranInformationText.dateOfBirthIncompleteError,
      ]);
    });

    it('flags an impossibly-old year as invalid pattern', () => {
      const { errors, collected } = captureErrors();
      dobValidation(errors, '1800-01-01');
      expect(collected).to.deep.equal([
        veteranInformationText.dateOfBirthPatternError,
      ]);
    });

    it('flags a future year as invalid pattern', () => {
      const { errors, collected } = captureErrors();
      dobValidation(errors, '2999-01-01');
      expect(collected).to.deep.equal([
        veteranInformationText.dateOfBirthPatternError,
      ]);
    });

    it('flags a nonexistent calendar date as invalid', () => {
      const { errors, collected } = captureErrors();
      dobValidation(errors, '2000-02-30');
      expect(collected).to.deep.equal([
        veteranInformationText.dateOfBirthPatternError,
      ]);
    });

    it('accepts a valid in-range date without adding errors', () => {
      const { errors, collected } = captureErrors();
      dobValidation(errors, '2000-01-15');
      expect(collected).to.deep.equal([]);
    });
  });
});
