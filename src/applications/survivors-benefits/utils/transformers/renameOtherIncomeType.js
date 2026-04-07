/**
 * Renames the `otherIncomeType` field to `incomeTypeOther` in each income
 * entry. The form stores the free-text "other" income description under
 * `otherIncomeType`, but the backend expects the key `incomeTypeOther`.
 *
 * @param {string} formData - JSON string of form data
 * @returns {string} JSON string with `otherIncomeType` renamed to `incomeTypeOther` in each income entry
 */
export function renameOtherIncomeType(formData) {
  const parsedFormData = JSON.parse(formData);

  if (Array.isArray(parsedFormData?.incomeEntries)) {
    parsedFormData.incomeEntries = parsedFormData.incomeEntries.map(entry => {
      if (Object.prototype.hasOwnProperty.call(entry, 'otherIncomeType')) {
        const { otherIncomeType, ...rest } = entry;
        return { ...rest, incomeTypeOther: otherIncomeType };
      }
      return entry;
    });
  }

  return JSON.stringify(parsedFormData);
}
