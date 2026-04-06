const CHAMPVA_PROVIDERS = new Set([
  'ivc_champva',
  'ivcchampvabenefitsclaimsprovider',
]);

export const isChampvaProviderClaim = claim =>
  CHAMPVA_PROVIDERS.has(claim?.attributes?.provider);

export const shouldUseClaimStatusMeta = (
  claim,
  cstChampvaCustomContentEnabled,
) => cstChampvaCustomContentEnabled || !isChampvaProviderClaim(claim);

export const withClaimStatusMetaIfEnabled = (
  claim,
  cstChampvaCustomContentEnabled,
) => {
  if (!claim?.attributes) return claim;
  if (shouldUseClaimStatusMeta(claim, cstChampvaCustomContentEnabled)) {
    return claim;
  }

  const attributesWithoutMeta = { ...claim.attributes };
  delete attributesWithoutMeta.claimStatusMeta;
  return {
    ...claim,
    attributes: attributesWithoutMeta,
  };
};
