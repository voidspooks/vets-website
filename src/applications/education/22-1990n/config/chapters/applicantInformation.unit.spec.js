import { expect } from 'chai';
import {
  personalInformationUiSchema,
  personalInformationSchema,
  nameUiSchema,
  nameSchema,
  addressUiSchema,
  addressSchema,
  contactInformationUiSchema,
  contactInformationSchema,
} from './applicantInformation';

describe('applicantInformation chapter', () => {
  describe('personalInformationUiSchema', () => {
    it('exports a valid uiSchema object', () => {
      expect(personalInformationUiSchema).to.be.an('object');
      expect(personalInformationUiSchema).to.have.property('veteranSocialSecurityNumber');
      expect(personalInformationUiSchema).to.have.property('veteranDateOfBirth');
      expect(personalInformationUiSchema).to.have.property('gender');
    });

    it('gender field has required function', () => {
      const genderField = personalInformationUiSchema.gender;
      expect(genderField).to.be.an('object');
    });
  });

  describe('personalInformationSchema', () => {
    it('has required fields', () => {
      expect(personalInformationSchema.required).to.include('veteranSocialSecurityNumber');
      expect(personalInformationSchema.required).to.include('veteranDateOfBirth');
      expect(personalInformationSchema.required).to.include('gender');
    });
  });

  describe('nameUiSchema', () => {
    it('has veteranFullName field', () => {
      expect(nameUiSchema).to.have.property('veteranFullName');
    });
  });

  describe('addressUiSchema', () => {
    it('has veteranAddress with street, city, state, postalCode', () => {
      expect(addressUiSchema.veteranAddress).to.have.property('street');
      expect(addressUiSchema.veteranAddress).to.have.property('city');
      expect(addressUiSchema.veteranAddress).to.have.property('state');
      expect(addressUiSchema.veteranAddress).to.have.property('postalCode');
    });
  });

  describe('contactInformationUiSchema', () => {
    it('has phone and email fields', () => {
      expect(contactInformationUiSchema).to.have.property('homePhone');
      expect(contactInformationUiSchema).to.have.property('mobilePhone');
      expect(contactInformationUiSchema).to.have.property('email');
    });

    describe('validateAtLeastOnePhone (ui:validations)', () => {
      let messages;
      let errors;

      beforeEach(() => {
        messages = [];
        errors = {
          homePhone: { addError: msg => messages.push(msg || '') },
          mobilePhone: { addError: msg => messages.push(msg || '') },
        };
      });

      it('adds an error when both phones are missing', () => {
        const validationFn = contactInformationUiSchema['ui:validations'][0];
        validationFn(errors, { homePhone: '', mobilePhone: '' });
        expect(messages.length).to.be.greaterThan(0);
      });

      it('does not error when homePhone is provided', () => {
        const validationFn = contactInformationUiSchema['ui:validations'][0];
        validationFn(errors, { homePhone: '8005551234', mobilePhone: '' });
        expect(messages).to.have.lengthOf(0);
      });

      it('does not error when mobilePhone is provided', () => {
        const validationFn = contactInformationUiSchema['ui:validations'][0];
        validationFn(errors, { homePhone: '', mobilePhone: '8005551234' });
        expect(messages).to.have.lengthOf(0);
      });

      it('does not error when both phones are provided', () => {
        const validationFn = contactInformationUiSchema['ui:validations'][0];
        validationFn(errors, { homePhone: '8005551234', mobilePhone: '8005551235' });
        expect(messages).to.have.lengthOf(0);
      });
    });
  });
});