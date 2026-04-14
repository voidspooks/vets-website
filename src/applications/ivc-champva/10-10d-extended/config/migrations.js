import omit from 'platform/utilities/data/omit';
import set from 'platform/utilities/data/set';
import { applicationStatusPages } from '../chapters/applicationStatus';
import { certifierPages } from '../chapters/certifier';

export default [
  // 0 -> 1, flatten certifier relationship, reset stale certifier returnUrl,
  // and migrate address sharing keys
  ({ formData, metadata = {} }) => {
    const flattenCertifierRelationship = data => {
      const { relationshipToVeteran } = data.certifierRelationship ?? {};
      return relationshipToVeteran
        ? set('certifierRelationship', relationshipToVeteran, data)
        : data;
    };

    const migrateSharedAddresses = data => {
      const migrateApplicant = applicant => {
        const { 'view:sharesAddressWith': sharedAddress, ...rest } =
          applicant ?? {};
        return sharedAddress === undefined
          ? applicant
          : set('view:applicantSharedAddress', sharedAddress, rest);
      };

      const nextData = omit(['view:sharesAddressWith'], data);

      return data.applicants?.length
        ? set('applicants', data.applicants.map(migrateApplicant), nextData)
        : nextData;
    };

    const migrateReturnUrl = currentMetadata => {
      const returnUrl =
        currentMetadata.returnUrl ?? currentMetadata.return_url ?? '';

      const hasCertifierPath = Object.values(certifierPages)
        .map(({ path }) => `/${path}`)
        .some(segment => returnUrl.includes(segment));

      return hasCertifierPath
        ? set(
            'returnUrl',
            `/${applicationStatusPages.certifierRole.path}`,
            currentMetadata,
          )
        : currentMetadata;
    };

    return {
      formData: migrateSharedAddresses(flattenCertifierRelationship(formData)),
      metadata: migrateReturnUrl(metadata),
    };
  },
];
