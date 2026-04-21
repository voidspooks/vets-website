import sharedTransformForSubmit from '../../shared/config/submit-transformer';
import { FORM_10_8678, FORM_ID } from '../definitions/constants';

const { VHA_MEDICAL_FACILITY } = FORM_10_8678;

const stringOrUndefined = value => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  return undefined;
};

const pruneEmpty = value => {
  if (Array.isArray(value)) {
    const pruned = value
      .map(item => pruneEmpty(item))
      .filter(item => item !== undefined);
    return pruned.length ? pruned : undefined;
  }

  if (value && typeof value === 'object') {
    const pruned = Object.entries(value).reduce((acc, [key, val]) => {
      const cleaned = pruneEmpty(val);
      if (cleaned !== undefined) {
        acc[key] = cleaned;
      }
      return acc;
    }, {});
    return Object.keys(pruned).length ? pruned : undefined;
  }

  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  return value;
};

const buildFullName = fullName => ({
  first: stringOrUndefined(fullName?.first),
  middle: stringOrUndefined(fullName?.middle),
  last: stringOrUndefined(fullName?.last),
});

const buildAddress = address => {
  const postalCode = stringOrUndefined(address?.postalCode);
  return {
    street: stringOrUndefined(address?.street),
    street2: stringOrUndefined(address?.street2),
    city: stringOrUndefined(address?.city),
    state: stringOrUndefined(address?.state),
    postalCode,
    country: stringOrUndefined(address?.country) || 'USA',
  };
};

const resolveFacility = item => {
  if (!item) return undefined;

  if (item.issuingFacility === VHA_MEDICAL_FACILITY.OTHER_OPTION) {
    return stringOrUndefined(item.issuingFacilityOther);
  }

  return stringOrUndefined(item.issuingFacility);
};

const transformApplianceItem = item => ({
  deviceOrMedication: stringOrUndefined(item?.itemType),
  serviceConnectedDisability: stringOrUndefined(
    item?.serviceConnectedDisability,
  ),
  impactedLocations: item?.impactedLocations,
  issuingFacility: resolveFacility(item),
});

const buildSubmissionPayload = data => {
  const fullName = data?.fullName || data?.veteran?.fullName;
  const address = data?.address || data?.veteran?.address;

  const email = stringOrUndefined(
    data?.emailAddress || data?.email || data?.veteran?.email,
  );

  const typedSignature = stringOrUndefined(data?.statementOfTruthSignature);
  const constructedSignature = [
    stringOrUndefined(fullName?.first),
    stringOrUndefined(fullName?.middle),
    stringOrUndefined(fullName?.last),
  ]
    .filter(Boolean)
    .join(' ');

  const signatureDate =
    stringOrUndefined(data?.statementOfTruthSignatureDate) ||
    stringOrUndefined(data?.signatureDate) ||
    new Date().toISOString().slice(0, 10);

  return pruneEmpty({
    fullName: buildFullName(fullName),
    ssn: stringOrUndefined(data?.ssn || data?.veteran?.ssn),
    address: buildAddress(address),
    phone: stringOrUndefined(data?.phone || data?.veteran?.phone),
    emailAddress: email,
    email,
    statementOfTruthSignature: typedSignature,
    veteranSignature: typedSignature || constructedSignature,
    signatureDate,
    electTermination: data?.electTermination === 'terminate',
    vhaMedicalFacility:
      data?.vhaMedicalFacility === VHA_MEDICAL_FACILITY.OTHER_OPTION
        ? stringOrUndefined(data?.vhaMedicalFacilityOther)
        : stringOrUndefined(data?.vhaMedicalFacility),
    appliances: (data?.deviceApplianceMedicationItems || []).map(
      transformApplianceItem,
    ),
    formNumber: FORM_ID,
  });
};

export default function transformForSubmit(formConfig, form) {
  const transformed = JSON.parse(
    sharedTransformForSubmit(formConfig, form, {
      allowPartialAddress: true,
    }),
  );

  const payload = buildSubmissionPayload(transformed);
  return JSON.stringify(payload);
}
