const SOCIAL_SECURITY_PAYER_NAME = 'Social Security Administration';

/**
 * Sets `incomePayer` to "Social Security Administration" for any income entry
 * with `incomeType === 'SOCIAL_SECURITY'`. The `incomePayer` field is hidden
 * from the user for Social Security income, so this transformer ensures the
 * value is populated before submission.
 *
 * @param {string} formData - JSON string of form data
 * @returns {string} JSON string with `incomePayer` populated for Social Security entries
 */
export function addPayerNameForSocialSecurity(formData) {
  const parsedFormData = JSON.parse(formData);

  if (Array.isArray(parsedFormData?.incomeEntries)) {
    parsedFormData.incomeEntries = parsedFormData.incomeEntries.map(entry => {
      if (entry?.incomeType === 'SOCIAL_SECURITY') {
        return { ...entry, incomePayer: SOCIAL_SECURITY_PAYER_NAME };
      }
      return entry;
    });
  }

  return JSON.stringify(parsedFormData);
}
