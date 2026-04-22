/* eslint-disable no-param-reassign */
import {
  filterViewFields,
  transformForSubmit as formsSystemTransformForSubmit,
} from 'platform/forms-system/src/js/helpers';
import recordEvent from 'platform/monitoring/record-event';
import {
  adjustYearString,
  getObjectsWithAttachmentId,
  toHash,
} from '../../shared/utilities';
import {
  concatStreets,
  getAgeInYears,
  isNewSubmission,
} from '../utils/helpers';

const NON_APPLICANT_ROLE_PREFIX = Object.freeze({
  sponsor: 'sponsor',
  other: 'certifier',
});

const getCurrentDate = () => new Date().toISOString().split('T')[0];

const getRolePrefix = role =>
  role === 'applicant' ? null : NON_APPLICANT_ROLE_PREFIX[role] || 'certifier';

const getRoleValue = (data = {}, role, suffix) => {
  const prefix = getRolePrefix(role);
  return prefix ? data?.[`${prefix}${suffix}`] : undefined;
};

const getTrueKeys = (obj = {}) =>
  Object.keys(obj).filter(key => obj[key] === true);

const getRelationship = relationship => getTrueKeys(relationship).join('; ');

function formatDate(date) {
  if (typeof date !== 'string') return date;
  const [year, month, day] = date.split('-');
  return year && month && day ? `${month}-${day}-${year}` : date;
}

function extractRelationship(relationshipData) {
  if (typeof relationshipData === 'string') {
    return relationshipData;
  }

  // Handle case where relationshipToVeteran is an object with boolean flags
  if (typeof relationshipData?.relationshipToVeteran === 'object') {
    const trueRelationship = Object.keys(
      relationshipData.relationshipToVeteran,
    ).find(key => relationshipData.relationshipToVeteran[key] === true);

    if (trueRelationship) {
      return trueRelationship;
    }
  }

  // Check for other relationship fields
  if (relationshipData?.otherRelationshipToVeteran) {
    return relationshipData.otherRelationshipToVeteran;
  }

  return relationshipData?.relationshipToVeteran || '';
}

function transformApplicants(applicants = []) {
  return applicants.map(applicant => {
    const transformedApplicant = {
      ...applicant,
      ssnOrTin: applicant.applicantSsn ?? '',
      vetRelationship: extractRelationship(
        applicant.applicantRelationshipToSponsor || 'NA',
      ),
      applicantSupportingDocuments: getObjectsWithAttachmentId(
        applicant,
        'confirmationCode',
      ),
    };
    return adjustYearString(transformedApplicant);
  });
}

function mapHealthInsuranceToApplicants(
  data,
  advantageParticipants = new Set(),
) {
  // Create a deep copy to avoid mutations
  const result = JSON.parse(JSON.stringify(data));

  // Map Medicare plans to applicants
  result.medicare.forEach(plan => {
    result.applicants
      .filter(
        applicant =>
          plan.medicareParticipant === toHash(applicant.applicantSsn),
      )
      .forEach(applicant => {
        // Initialize Medicare array if it doesn't exist
        applicant.medicare = applicant.medicare || [];
        const planType = String(plan?.medicarePlanType ?? '')
          .trim()
          .toLowerCase();
        const isAdvantage =
          planType === 'c' ||
          advantageParticipants.has(plan?.medicareParticipant) ||
          Boolean(plan?.medicarePartCCarrier);
        applicant.applicantMedicareAdvantage =
          Boolean(applicant.applicantMedicareAdvantage) || isAdvantage;
        // original 10-10d form produces this medicareStatus field, so we need
        // it to fill the PDF on the backend
        applicant.applicantMedicareStatus = { eligibility: 'enrolled' };
        applicant.medicare.push(plan);
      });
  });

  // Map health insurance policies to applicants
  result.healthInsurance.forEach(policy => {
    // Get hashes of applicants participating in this policy
    const participantHashes = getTrueKeys(policy.healthcareParticipants);

    result.applicants
      .filter(applicant =>
        participantHashes.includes(toHash(applicant.applicantSsn)),
      )
      .forEach(applicant => {
        // Initialize health insurance array
        applicant.healthInsurance = applicant.healthInsurance || [];

        // Format middle name as initial
        if (applicant.applicantName?.middle) {
          applicant.applicantName.middle =
            applicant.applicantName.middle.charAt(0) || '';
        }

        // Add policy and set flag
        applicant.healthInsurance.push(policy);
        applicant.hasOtherHealthInsurance = true;
        // original 10-10d form produces this applicantHasOhi prop, so we need
        // it to fill the PDF on the backend
        applicant.applicantHasOhi = { hasOhi: 'yes' };
      });
  });

  result.certificationDate = getCurrentDate();

  return {
    ...result,
    veteran: data.veteran,
  };
}

const collectSupportingDocuments = data => {
  const topLevelDocs = getObjectsWithAttachmentId(data, 'confirmationCode');

  const healthInsuranceDocs = (data.healthInsurance ?? []).flatMap(item =>
    getObjectsWithAttachmentId(item, 'confirmationCode'),
  );

  const medicareDocs = (data.medicare ?? []).flatMap(item =>
    getObjectsWithAttachmentId(item, 'confirmationCode'),
  );

  const applicantDocs = (data.applicants ?? []).flatMap(applicant =>
    (applicant.applicantSupportingDocuments ?? []).filter(Boolean).map(doc => ({
      ...doc,
      applicantName: applicant.applicantName,
    })),
  );

  return [
    ...topLevelDocs.flat(),
    ...healthInsuranceDocs,
    ...medicareDocs,
    ...applicantDocs,
  ];
};

const buildCertificationData = (data = {}) => {
  const { certifierRole } = data;
  const date = formatDate(getCurrentDate()) || '';

  if (certifierRole === 'applicant') return { date };

  const name = getRoleValue(data, certifierRole, 'Name') || {};
  const address = getRoleValue(data, certifierRole, 'Address') || {};

  return {
    date,
    firstName: name.first || '',
    middleInitial: name.middle || '',
    lastName: name.last || '',
    phoneNumber: getRoleValue(data, certifierRole, 'Phone') || '',
    streetAddress: address.streetCombined || '',
    city: address.city || '',
    state: address.state || '',
    postalCode: address.postalCode || '',
    country: address.country || '',
    relationship: getRelationship(
      getRoleValue(data, certifierRole, 'Relationship'),
    ),
  };
};

const buildPrimaryContactInfo = (data = {}) => {
  const { certifierRole } = data;

  if (certifierRole === 'applicant') {
    const appIndex = Number(data['view:certifierApplicantIndex'] ?? 0);
    const applicant = data?.applicants?.[appIndex] || {};
    const fallbackEmail = data?.applicants?.[0]?.applicantEmailAddress;

    return {
      name: applicant.applicantName,
      email: applicant.applicantEmailAddress || fallbackEmail,
      phone: applicant.applicantPhone,
    };
  }

  return {
    name: getRoleValue(data, certifierRole, 'Name'),
    email: getRoleValue(data, certifierRole, 'Email'),
    phone: getRoleValue(data, certifierRole, 'Phone'),
  };
};

const hydrateAddress = address => {
  if (!address || typeof address !== 'object') return address;
  return concatStreets(filterViewFields(address));
};

const hydrateApplicantAddresses = (
  transformedApplicants = [],
  originalApplicants = [],
) =>
  transformedApplicants.map((applicant, index) => ({
    ...applicant,
    applicantAddress: hydrateAddress(
      originalApplicants?.[index]?.applicantAddress,
    ),
  }));

const buildEnhancedFlowSubmission = (data, formConfig) => {
  const {
    certifierRole,
    submissionType,
    contactEmail,
    applicantName,
    applicantDob,
    applicantMemberNumber,
    sponsorName,
    sponsorDob,
    sponsorSsn,
    statementOfTruthSignature,
  } = data;

  const isExisting = submissionType === 'existing';

  let contactName;
  if (certifierRole === 'applicant') {
    contactName = applicantName;
  } else if (certifierRole === 'sponsor' && isExisting) {
    contactName = sponsorName;
  }

  return JSON.stringify({
    certifierRole,
    submissionType,
    primaryContactInfo: {
      name: contactName,
      email: contactEmail,
    },
    veteran: {
      fullName: isExisting ? sponsorName : {},
      ssnOrTin: isExisting ? sponsorSsn : '',
      dateOfBirth: isExisting ? formatDate(sponsorDob) : '',
    },
    applicants: [
      {
        applicantName,
        applicantDob,
        applicantMemberNumber,
      },
    ],
    certification: { date: formatDate(getCurrentDate()) || '' },
    supportingDocs: collectSupportingDocuments(data),
    statementOfTruthSignature,
    formNumber: formConfig.formId,
  });
};

const getSubmissionTypeEventName = data => {
  if (isNewSubmission(data)) return '10-10d_new_application';
  return data.submissionType === 'existing'
    ? '10-10d_update_existing_application'
    : '10-10d_update_beneficiary_enrollment';
};

/**
 * Main transformer function that prepares form data for submission
 * @param {Object} formConfig - Form configuration object containing form settings and metadata
 * @param {Object} form - Form object containing the user-submitted data
 * @param {Boolean} [disableAnalytics=false] - Flag to disable analytics event tracking
 * @returns {string} JSON string of transformed data ready for submission
 */
export default function transformForSubmit(
  formConfig,
  form,
  disableAnalytics = false,
) {
  const originalData = form?.data || {};
  const initialTransform = JSON.parse(
    formsSystemTransformForSubmit(formConfig, form),
  );

  // Track submission type analytics
  if (!disableAnalytics) {
    recordEvent({ event: getSubmissionTypeEventName(originalData) });
  }

  // Use simplified transformation for enhanced flow submissions
  if (!isNewSubmission(originalData)) {
    return buildEnhancedFlowSubmission(initialTransform, formConfig);
  }

  // Rehydrate all addresses from original form data so shared-address selections
  // survive inactive-page filtering in formsSystemTransformForSubmit.
  const withConcatAddresses = {
    ...initialTransform,
    sponsorAddress: hydrateAddress(originalData.sponsorAddress),
    certifierAddress: hydrateAddress(originalData.certifierAddress),
    applicants: hydrateApplicantAddresses(
      initialTransform.applicants || [],
      originalData.applicants || [],
    ),
  };

  const marriageDate = withConcatAddresses.applicants?.find(
    applicant =>
      applicant?.applicantRelationshipToSponsor?.relationshipToVeteran ===
        'spouse' && applicant?.dateOfMarriageToSponsor,
  )?.dateOfMarriageToSponsor;

  const veteranData = {
    fullName: withConcatAddresses.sponsorName || {},
    ssnOrTin: withConcatAddresses.sponsorSsn || '',
    dateOfBirth: formatDate(withConcatAddresses.sponsorDob) || '',
    phoneNumber: withConcatAddresses.sponsorPhone || '',
    email: withConcatAddresses.sponsorEmail || '',
    address: withConcatAddresses.sponsorAddress || {},
    sponsorIsDeceased: withConcatAddresses.sponsorIsDeceased ?? false,
    dateOfDeath: formatDate(withConcatAddresses.sponsorDod) || '',
    dateOfMarriage: formatDate(marriageDate) || '',
    isActiveServiceDeath: withConcatAddresses.sponsorDeathConditions,
  };

  const initialData = {
    veteran: veteranData,
    certification: buildCertificationData(withConcatAddresses),
    applicants: transformApplicants(withConcatAddresses.applicants || []),
    healthInsurance: withConcatAddresses.healthInsurance || [],
    medicare: withConcatAddresses.medicare || [],
    supportingDocs: [],
  };

  const advantageParticipants = new Set(
    (form?.data?.medicare || [])
      .filter(
        p =>
          String(p?.medicarePlanType ?? '')
            .trim()
            .toLowerCase() === 'c',
      )
      .map(p => p?.medicareParticipant)
      .filter(Boolean),
  );
  const transformedData = mapHealthInsuranceToApplicants(
    initialData,
    advantageParticipants,
  );
  transformedData.supportingDocs = collectSupportingDocuments(transformedData);

  transformedData.hasApplicantOver65 = transformedData.applicants.some(a => {
    const age = getAgeInYears(a.applicantDob);
    return Number.isFinite(age) && age >= 65;
  });

  transformedData.certifierRole = withConcatAddresses.certifierRole;
  transformedData.statementOfTruthSignature =
    withConcatAddresses.statementOfTruthSignature;

  transformedData.primaryContactInfo = buildPrimaryContactInfo(
    withConcatAddresses,
  );

  return JSON.stringify({
    ...transformedData,
    formNumber: formConfig.formId,
  });
}
