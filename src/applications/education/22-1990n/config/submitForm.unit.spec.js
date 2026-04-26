import { expect } from 'chai';
import transformForSubmit from './submitForm';
import formConfig from './form';

describe('submitForm transformer', () => {
  it('exports a function', () => {
    expect(transformForSubmit).to.be.a('function');
  });

  it('returns a JSON string wrapping educationBenefitsClaim', () => {
    const mockForm = {
      data: {
        veteranSocialSecurityNumber: '123456789',
        veteranFullName: { first: 'John', last: 'Doe' },
        typeOfEducation: ['collegeOrOtherSchool'],
        activeDuty: false,
        terminalLeave: false,
        servicePeriods: [
          {
            dateEnteredService: '2004-01-01',
            serviceComponent: 'USMC',
            serviceStatus: 'Active duty',
          },
        ],
        seniorRotcScholarship: false,
      },
      pages: {},
    };

    let result;
    expect(() => {
      result = transformForSubmit(formConfig, mockForm);
    }).to.not.throw();

    expect(result).to.be.a('string');
    const parsed = JSON.parse(result);
    expect(parsed).to.have.property('educationBenefitsClaim');
    expect(parsed.educationBenefitsClaim).to.have.property('form');
    expect(parsed.educationBenefitsClaim).to.have.property('formType', '1990n');
  });
});