import { expect } from 'chai';
import {
  personalInformationUiSchema,
  personalInformationSchema,
} from './personalInformation';

describe('chapters/personalInformation', () => {
  describe('uiSchema', () => {
    it('exports a uiSchema object', () => {
      expect(personalInformationUiSchema).to.be.an('object');
    });

    it('has personalInformation key', () => {
      expect(personalInformationUiSchema).to.have.property(
        'personalInformation',
      );
    });

    it('has all required fields', () => {
      const pi = personalInformationUiSchema.personalInformation;
      expect(pi.applicantSSN).to.be.an('object');
      expect(pi.applicantSex).to.be.an('object');
      expect(pi.applicantDOB).to.be.an('object');
      expect(pi.applicantFirstName).to.be.an('object');
      expect(pi.applicantLastName).to.be.an('object');
    });

    it('applicantSex has Female and Male options', () => {
      const sexField =
        personalInformationUiSchema.personalInformation.applicantSex;
      const labels = sexField['ui:options']?.labels || {};
      expect(labels).to.have.property('F');
      expect(labels).to.have.property('M');
      expect(labels.F).to.equal('Female');
      expect(labels.M).to.equal('Male');
    });

    it('applicantSex ui:required returns true', () => {
      const sexField =
        personalInformationUiSchema.personalInformation.applicantSex;
      expect(sexField['ui:required']).to.be.a('function');
      expect(sexField['ui:required']()).to.be.true;
    });
  });

  describe('schema', () => {
    it('exports a schema object', () => {
      expect(personalInformationSchema).to.be.an('object');
    });

    it('personalInformation is required', () => {
      expect(personalInformationSchema.required).to.include(
        'personalInformation',
      );
    });

    it('inner schema requires SSN, sex, DOB, first and last name', () => {
      const inner =
        personalInformationSchema.properties.personalInformation;
      expect(inner.required).to.include('applicantSSN');
      expect(inner.required).to.include('applicantSex');
      expect(inner.required).to.include('applicantDOB');
      expect(inner.required).to.include('applicantFirstName');
      expect(inner.required).to.include('applicantLastName');
    });

    it('applicantSSN has 9-digit pattern', () => {
      const ssnSchema =
        personalInformationSchema.properties.personalInformation.properties
          .applicantSSN;
      expect(ssnSchema.pattern).to.equal('^\\d{9}$');
    });

    it('applicantSex enum contains F and M', () => {
      const sexSchema =
        personalInformationSchema.properties.personalInformation.properties
          .applicantSex;
      expect(sexSchema.enum).to.include('F');
      expect(sexSchema.enum).to.include('M');
    });
  });
});