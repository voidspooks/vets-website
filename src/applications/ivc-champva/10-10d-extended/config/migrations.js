import set from 'platform/utilities/data/set';
import { certifierPages } from '../chapters/certifier';

export default [
  // 0 -> 1, flatten certifier relationship and reset stale certifier returnUrl
  ({ formData, metadata = {} }) => {
    const CERTIFIER_PATH_SEGMENTS = Object.values(certifierPages).map(
      ({ path }) => `/${path}`,
    );
    const hasCertifierPath = url =>
      CERTIFIER_PATH_SEGMENTS.some(segment => url.includes(segment));

    const { relationshipToVeteran } = formData.certifierRelationship ?? {};
    const newFormData = relationshipToVeteran
      ? set('certifierRelationship', relationshipToVeteran, formData)
      : formData;

    const returnUrl = metadata.returnUrl || metadata.return_url || '';
    const newMetadata = hasCertifierPath(returnUrl)
      ? set('returnUrl', '/who-is-applying', metadata)
      : metadata;

    return {
      formData: newFormData,
      metadata: newMetadata,
    };
  },
];
