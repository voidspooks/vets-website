import { isValidDateRange } from 'platform/forms-system/src/js/utilities/validations';
import { convertToDateField } from 'platform/forms-system/src/js/validation';

export const isDateAfterPatientDOB = (errors, fieldData, formData) => {
  const dateToValidate = convertToDateField(fieldData);
  const isClaimantVeteran =
    formData.claimantQuestion?.patientType === 'veteran';
  if (
    dateToValidate &&
    ((isClaimantVeteran && formData?.veteranPersonalInfo?.dateOfBirth) ||
      (!isClaimantVeteran &&
        formData?.claimantPersonalInfo?.claimantDateOfBirth))
  ) {
    const birthDate = convertToDateField(
      isClaimantVeteran
        ? formData?.veteranPersonalInfo?.dateOfBirth
        : formData?.claimantPersonalInfo?.claimantDateOfBirth,
    );
    if (!isValidDateRange(birthDate, dateToValidate)) {
      errors.addError(`Enter a date after the patient's date of birth`);
    }
  }
};
