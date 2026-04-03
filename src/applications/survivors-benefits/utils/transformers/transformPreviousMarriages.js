export function transformPreviousMarriages(formData) {
  const parsedFormData = JSON.parse(formData);
  const transformedValue = { ...parsedFormData };
  const selections = parsedFormData?.hadPreviousMarriages;

  if (selections && typeof selections === 'object') {
    transformedValue.hadPreviousMarriages = Boolean(
      selections.claimant || selections.veteran,
    );
  }

  return JSON.stringify(transformedValue);
}
