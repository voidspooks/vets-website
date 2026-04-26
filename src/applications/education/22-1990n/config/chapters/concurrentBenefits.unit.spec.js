import { expect } from 'chai';
import {
  rotcScholarshipUiSchema,
  rotcScholarshipSchema,
  federalTuitionAssistanceUiSchema,
  federalTuitionAssistanceSchema,
  govtEmployeeUiSchema,
  govtEmployeeSchema,
} from './concurrentBenefits';

describe('concurrentBenefits chapter', () => {
  describe('rotcScholarshipUiSchema', () => {
    it('has seniorRotcScholarship field', () => {
      expect(rotcScholarshipUiSchema).to.have.property('seniorRotcScholarship');
    });
  });

  describe('rotcScholarshipSchema', () => {
    it('requires seniorRotcScholarship', () => {
      expect(rotcScholarshipSchema.required).to.include('seniorRotcScholarship');
    });
  });

  describe('federalTuitionAssistanceUiSchema', () => {
    it('has federalTuitionAssistance field', () => {
      expect(federalTuitionAssistanceUiSchema).to.have.property('federalTuitionAssistance');
    });
  });

  describe('federalTuitionAssistanceSchema', () => {
    it('requires federalTuitionAssistance', () => {
      expect(federalTuitionAssistanceSchema.required).to.include('federalTuitionAssistance');
    });
  });

  describe('govtEmployeeUiSchema', () => {
    it('has civilianGovtEmployee, govtEmployeeFunding, govtEmployeeFundingSource fields', () => {
      expect(govtEmployeeUiSchema).to.have.property('civilianGovtEmployee');
      expect(govtEmployeeUiSchema).to.have.property('govtEmployeeFunding');
      expect(govtEmployeeUiSchema).to.have.property('govtEmployeeFundingSource');
    });

    it('govtEmployeeFunding has expandUnder option', () => {
      const field = govtEmployeeUiSchema.govtEmployeeFunding;
      expect(field['ui:options']).to.have.property('expandUnder');
      expect(field['ui:options'].expandUnder).to.equal('civilianGovtEmployee');
    });

    it('govtEmployeeFundingSource has expandUnder option', () => {
      const field = govtEmployeeUiSchema.govtEmployeeFundingSource;
      expect(field['ui:options']).to.have.property('expandUnder');
      expect(field['ui:options'].expandUnder).to.equal('govtEmployeeFunding');
    });
  });

  describe('govtEmployeeSchema', () => {
    it('requires civilianGovtEmployee', () => {
      expect(govtEmployeeSchema.required).to.include('civilianGovtEmployee');
    });

    it('govtEmployeeFundingSource has maxLength 200', () => {
      expect(
        govtEmployeeSchema.properties.govtEmployeeFundingSource.maxLength,
      ).to.equal(200);
    });
  });
});