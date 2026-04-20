// Claims helpers
export const CHANGE_INDEX_PAGE = 'CHANGE_INDEX_PAGE';

export const claimsAvailability = {
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
};
export function isClaimComplete(claim) {
  return (
    claim.attributes.decisionLetterSent ||
    claim.attributes.status === 'COMPLETE' ||
    claim.attributes.status === 'vbms'
  );
}

const claimStatusMap = {
  CLAIM_RECEIVED: 'Claim received',
  INITIAL_REVIEW: 'Initial review',
  EVIDENCE_GATHERING_REVIEW_DECISION:
    'Evidence gathering, review, and decision',
  PREPARATION_FOR_NOTIFICATION: 'Preparation for notification',
  COMPLETE: 'Closed',
  pending: 'Application received',
  vbms: 'Application decided',
  error: 'Additional review needed',
};

export function getClaimStatusDescription(status) {
  return claimStatusMap[status];
}

export function getClaimType(claim) {
  return (
    claim?.attributes?.claimType || 'disability compensation'
  ).toLowerCase();
}

const isIvcChampvaClaim = claim => {
  const attrs = claim?.attributes || {};
  const signals = [
    attrs.claimType,
    attrs.claimTypeCode,
    attrs.displayTitle,
    attrs.claimTypeBase,
    attrs.claimStatusMeta?.detail?.pageTitle,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return signals.includes('champva') || signals.includes('10-10d');
};

export function getClaimDetailsHref(claim) {
  const provider =
    claim?.attributes?.provider ||
    (isIvcChampvaClaim(claim) ? 'ivc_champva' : null);
  const baseHref = `/track-claims/your-claims/${claim?.id}/status`;

  if (!provider) {
    return baseHref;
  }

  const query = new URLSearchParams({ type: provider }).toString();
  return `${baseHref}?${query}`;
}
