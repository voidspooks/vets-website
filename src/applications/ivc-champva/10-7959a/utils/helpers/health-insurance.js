import { isMedicalClaim, isNewClaim, whenAll } from './form-config';

export const policyDatesEnabled = formData =>
  formData['view:champvaClaimsInsuranceDates'];

export const hasOhi = whenAll(isNewClaim, formData => formData.hasOhi);

export const hasOhiAndMedicalClaim = whenAll(hasOhi, isMedicalClaim);

export const hasOhiMedicalAndMultiplePolicies = whenAll(
  hasOhiAndMedicalClaim,
  formData => (formData.policies || []).length > 1,
);

export const hasTypeOther = (formData, index) =>
  formData?.policies?.[index]?.type === 'other';
