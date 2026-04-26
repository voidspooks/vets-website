import { expect } from 'chai';
import {
  personalInformationUiSchema,
  personalInformationSchema,
} from './personalInformation';

describe('config/chapters/personalInformation', () => {
  it('uiSchema has required fields', () => {
    const pi = personalInformationUiSchema.personalInformation;
    expect(pi).to.have.property('applicantSSN');
    expect(pi).to.have.property('applicantSex');
    expect(pi).to.have.property('applicantDOB');
    expect(pi).to.have.property('applicantFirstName');
    expect(pi).to.have.property('applicantLastName');
  });

  it('schema required array includes applicantSSN', () => {
    const required =
      personalInformationSchema.properties.personalInformation.required;
    expect(required).to.include('applicantSSN');
  });

  it('applicantSex schema has enum with F and M', () => {
    const sexEnum =
      personalInformationSchema.properties.personalInformation.properties
        .applicantSex.enum;
    expect(sexEnum).to.include('F');
    expect(sexEnum).to.include('M');
    expect(sexEnum).to.have.lengthOf(2);
  });

  it('applicantFirstName schema has maxLength of 30', () => {
    const firstNameSchema =
      personalInformationSchema.properties.personalInformation.properties
        .applicantFirstName;
    expect(firstNameSchema.maxLength).to.equal(30);
  });

  it('applicantMiddleInitial is not in required array', () => {
    const required =
      personalInformationSchema.properties.personalInformation.required;
    expect(required).not.to.include('applicantMiddleInitial');
  });
});