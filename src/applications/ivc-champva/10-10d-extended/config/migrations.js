import get from 'platform/utilities/data/get';
import omit from 'platform/utilities/data/omit';
import set from 'platform/utilities/data/set';
import { applicationStatusPages } from '../chapters/applicationStatus';
import { certifierPages } from '../chapters/certifier';
import { NOT_SHARED } from '../components/FormFields/AddressSelectionField';

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
      const sourceKeys = ['applicants.applicantAddress', 'sponsorAddress'];

      const stringifyAddress = address => {
        try {
          return address ? JSON.stringify(address) : null;
        } catch {
          return null;
        }
      };

      const sourceValueGetters = {
        sponsorAddress: () => {
          const sponsorAddress = get('sponsorAddress', data);
          return sponsorAddress ? [sponsorAddress] : [];
        },
        'applicants.applicantAddress': excludeIndex =>
          (get('applicants', data, []) || [])
            .filter((_, idx) => idx !== excludeIndex)
            .map(applicant => applicant?.applicantAddress)
            .filter(Boolean),
      };

      const buildValidOptionSet = excludeIndex =>
        new Set(
          sourceKeys
            .flatMap(key => sourceValueGetters[key]?.(excludeIndex) || [])
            .map(stringifyAddress)
            .filter(Boolean),
        );

      const normalizeSharedAddressValue = (value, excludeIndex) => {
        if (value === undefined) return undefined;

        const validOptions = buildValidOptionSet(excludeIndex);
        return validOptions.has(value) ? value : NOT_SHARED;
      };

      const migrateApplicant = (applicant, index) => {
        const { 'view:sharesAddressWith': sharedAddress, ...rest } =
          applicant ?? {};

        if (sharedAddress === undefined) return applicant;

        return set(
          'view:applicantSharedAddress',
          normalizeSharedAddressValue(sharedAddress, index),
          rest,
        );
      };

      let result = omit(['view:sharesAddressWith'], data);

      if (data.applicants?.length) {
        result = set(
          'applicants',
          data.applicants.map(migrateApplicant),
          result,
        );
      }

      const certifierAddress = get('certifierAddress', data);
      if (certifierAddress) {
        const certifierAddressValue = stringifyAddress(certifierAddress);
        const validOptions = buildValidOptionSet();
        result = set(
          'view:certifierSharedAddress',
          validOptions.has(certifierAddressValue)
            ? certifierAddressValue
            : NOT_SHARED,
          result,
        );
      }

      return result;
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
