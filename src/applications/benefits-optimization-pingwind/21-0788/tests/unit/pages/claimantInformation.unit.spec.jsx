import { expect } from 'chai';
import claimantInformation from '../../../pages/claimantInformation';
import {
  claimantFields,
  claimantInformationText,
  POSTAL_CODE_ERROR_MESSAGES,
  relationshipOptions,
} from '../../../definitions/constants';

describe('21-0788 claimantInformation page', () => {
  const { schema, uiSchema } = claimantInformation;
  const claimantSchema = schema.properties[claimantFields.parentObject];
  const claimantUiSchema = uiSchema[claimantFields.parentObject];

  it('includes the claimant parent object', () => {
    expect(schema.properties).to.have.property(claimantFields.parentObject);
  });

  it('requires key claimant fields', () => {
    expect(claimantSchema.required).to.include.members([
      claimantFields.fullName,
      claimantFields.relationshipType,
      claimantFields.address,
      claimantFields.phone,
      claimantFields.email,
    ]);
  });

  it('defines expected claimant fields', () => {
    expect(claimantSchema.properties[claimantFields.fullName]).to.exist;
    expect(claimantSchema.properties[claimantFields.relationshipType]).to.exist;
    expect(
      claimantSchema.properties[claimantFields.otherRelationshipDescription],
    ).to.exist;
    expect(claimantSchema.properties[claimantFields.address]).to.exist;
    expect(claimantSchema.properties[claimantFields.phone]).to.exist;
    expect(claimantSchema.properties[claimantFields.email]).to.exist;
  });

  it('uses full name schema without suffix and with 1-character middle max length', () => {
    const fullNameSchema = claimantSchema.properties[claimantFields.fullName];

    expect(fullNameSchema.properties.first).to.exist;
    expect(fullNameSchema.properties.middle).to.exist;
    expect(fullNameSchema.properties.last).to.exist;
    expect(fullNameSchema.properties.suffix).to.not.exist;
    expect(fullNameSchema.properties.middle.maxLength).to.equal(1);
  });

  it('uses custom full name titles and required messages', () => {
    const fullNameUi = claimantUiSchema[claimantFields.fullName];

    expect(fullNameUi.first['ui:title']).to.equal(
      claimantInformationText.firstNameTitle,
    );
    expect(fullNameUi.first['ui:errorMessages'].required).to.equal(
      claimantInformationText.firstNameError,
    );
    expect(fullNameUi.middle['ui:title']).to.equal(
      claimantInformationText.middleInitialTitle,
    );
    expect(fullNameUi.last['ui:title']).to.equal(
      claimantInformationText.lastNameTitle,
    );
    expect(fullNameUi.last['ui:errorMessages'].required).to.equal(
      claimantInformationText.lastNameError,
    );
  });

  it('defines relationship options from relationshipOptions', () => {
    const relationshipSchema =
      claimantSchema.properties[claimantFields.relationshipType];

    expect(relationshipSchema.enum).to.deep.equal(
      Object.keys(relationshipOptions),
    );
  });

  it('shows other relationship only when relationshipType is other', () => {
    const otherRelationshipUi =
      claimantUiSchema[claimantFields.otherRelationshipDescription];
    const { hideIf } = otherRelationshipUi['ui:options'];

    expect(hideIf({ claimant: { relationshipType: 'spouse' } })).to.equal(true);
    expect(
      hideIf({ claimant: { relationshipType: relationshipOptions.other } }),
    ).to.equal(false);
    expect(hideIf({ claimant: { relationshipType: 'other' } })).to.equal(false);
  });

  it('uses custom address labels and street required message', () => {
    const addressUi = claimantUiSchema[claimantFields.address];

    expect(addressUi.street).to.exist;
    expect(addressUi.street['ui:errorMessages'].required).to.equal(
      claimantInformationText.streetRequiredError,
    );

    expect(addressUi.street2).to.exist;
    expect(addressUi.city).to.exist;
    expect(addressUi.state).to.exist;
  });

  it('sets postal code error messages for USA, CAN, MEX, missing country, and other countries', () => {
    const addressUi = claimantUiSchema[claimantFields.address];
    const { replaceSchema } = addressUi.postalCode['ui:options'];

    const runReplace = country => {
      const targetUiSchema = {};
      replaceSchema(
        { claimant: { address: { country } } },
        {},
        targetUiSchema,
        0,
        ['claimant', 'address', 'postalCode'],
      );
      return targetUiSchema['ui:errorMessages'];
    };

    expect(runReplace('USA')).to.deep.equal(POSTAL_CODE_ERROR_MESSAGES.USA);
    expect(runReplace('CAN')).to.deep.equal(POSTAL_CODE_ERROR_MESSAGES.CAN);
    expect(runReplace('MEX')).to.deep.equal(POSTAL_CODE_ERROR_MESSAGES.MEX);
    expect(runReplace(undefined)).to.deep.equal(
      POSTAL_CODE_ERROR_MESSAGES.NONE,
    );
    expect(runReplace('FRA')).to.deep.equal(POSTAL_CODE_ERROR_MESSAGES.OTHER);
  });

  it('uses custom phone required message and one validation', () => {
    const phoneUi = claimantUiSchema[claimantFields.phone];

    expect(phoneUi['ui:required']()).to.equal(true);
    expect(phoneUi['ui:errorMessages'].required).to.equal(
      claimantInformationText.phoneRequiredError,
    );
    expect(phoneUi['ui:validations']).to.have.lengthOf(1);
  });

  it('adds the custom phone error when phone is missing', () => {
    const phoneValidation =
      claimantUiSchema[claimantFields.phone]['ui:validations'][0];
    const capturedErrors = [];
    const errors = { addError: value => capturedErrors.push(value) };

    phoneValidation(errors, {});
    expect(capturedErrors).to.deep.equal([
      claimantInformationText.phoneRequiredError,
    ]);
  });

  it('uses custom email hint and error messages', () => {
    const emailUi = claimantUiSchema[claimantFields.email];

    expect(emailUi['ui:required']()).to.equal(true);
    expect(emailUi['ui:options'].hint).to.equal(
      claimantInformationText.emailHint,
    );
    expect(emailUi['ui:errorMessages'].required).to.equal(
      claimantInformationText.emailError,
    );
    expect(emailUi['ui:errorMessages'].format).to.equal(
      claimantInformationText.emailError,
    );
  });
});
