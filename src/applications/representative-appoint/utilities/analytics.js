import recordEvent from 'platform/monitoring/record-event';

export const recordAppointedRepSearchResultSelection = selectedRepResult => {
  if (!selectedRepResult) return;

  const entityType = selectedRepResult.type;
  let aarPathway = 'unknown';

  if (entityType === 'organization') {
    aarPathway = 'org-first';
  } else if (entityType === 'representative') {
    aarPathway = 'rep-first';
  }

  recordEvent({
    event: 'cta-button-click',
    'button-label': 'Select accredited representative search result',
    'aar-pathway': aarPathway,
    'entity-type': entityType,
    'entity-id': selectedRepResult.id,
    'individual-type': selectedRepResult.attributes?.individualType || null,
    'can-accept-digital-poa-requests':
      selectedRepResult.attributes?.canAcceptDigitalPoaRequests ?? null,
    'reps-can-accept-any-request':
      selectedRepResult.attributes?.repsCanAcceptAnyRequest ?? null,
  });
};
