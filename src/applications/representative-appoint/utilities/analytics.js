import recordEvent from 'platform/monitoring/record-event';

export const recordAppointedRepSearchResultSelection = selectedRepResult => {
  if (!selectedRepResult) return;

  const entityType = selectedRepResult.type;

  let buttonClickLabel = 'Selected unknown result';
  let version = 'unknown';

  if (entityType === 'organization') {
    buttonClickLabel = `Selected ${selectedRepResult.attributes.name}`;
    version = 'org';
  } else if (entityType === 'representative') {
    buttonClickLabel = `Selected ${selectedRepResult.attributes.fullName}`;
    version = 'rep';
  }

  recordEvent({
    event: 'cta-button-click',
    'button-click-label': buttonClickLabel,
    version,
  });
};
