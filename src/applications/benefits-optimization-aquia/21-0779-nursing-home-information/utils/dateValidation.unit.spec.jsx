import { expect } from 'chai';
import { isDateAfterPatientDOB } from './dateValidation';

describe('isDateAfterPatientDOB', () => {
  let errorMessages = [];

  const errors = {
    addError: message => {
      errorMessages.push(message || '');
    },
  };

  beforeEach(() => {
    errorMessages = [];
  });

  it('should show validation error when date is before patient DOB', () => {
    const formData = {
      claimantQuestion: {
        patientType: 'veteran',
      },
      veteranPersonalInfo: {
        dateOfBirth: '1950-01-01',
      },
    };

    const fieldData = '1940-01-01';

    isDateAfterPatientDOB(errors, fieldData, formData);

    expect(errorMessages[0]).to.exist;
    expect(errorMessages[0]).to.equal(
      `Enter a date after the patient's date of birth`,
    );
  });

  it('should not show validation error when date is after patient DOB', () => {
    const formData = {
      claimantQuestion: {
        patientType: 'veteran',
      },
      veteranPersonalInfo: {
        dateOfBirth: '1950-01-01',
      },
    };

    const fieldData = '1960-01-01';

    isDateAfterPatientDOB(errors, fieldData, formData);

    expect(errorMessages.length).to.equal(0);
  });

  it('should show validation error when date is the same as patient DOB', () => {
    const formData = {
      claimantQuestion: {
        patientType: 'veteran',
      },
      veteranPersonalInfo: {
        dateOfBirth: '1950-01-01',
      },
    };

    const fieldData = '1950-01-01';

    isDateAfterPatientDOB(errors, fieldData, formData);

    expect(errorMessages.length).to.equal(1);
    expect(errorMessages[0]).to.equal(
      `Enter a date after the patient's date of birth`,
    );
  });
});
