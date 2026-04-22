import { add, isAfter, isBefore, isValid } from 'date-fns';
import { minYear } from 'platform/forms-system/src/js/helpers';
import { isValidSSN } from 'platform/forms-system/src/js/utilities/validations';
import {
  convertToDateField,
  validateDate,
} from 'platform/forms-system/src/js/validation';
import { isValidDateRange } from 'platform/forms/validations';
import content from '../locales/en/content.json';

const ERR_FUTURE_DATE = content['validation--date-range--future'];
const ERR_SSN_UNIQUE = content['validation--ssn-unique'];
const ERR_SSN_INVALID = content['validation--ssn-invalid'];

const STATE_REQUIRED_COUNTRIES = new Set(['USA', 'CAN', 'MEX']);

/**
 * Validates a text field for disallowed characters and adds an error message
 * when any invalid characters are found.
 *
 * @param {Object} errors - The rjsf/vets-forms error object
 * @param {string} fieldData - The input string to validate
 */
export const validateChars = (errors, fieldData) => {
  if (!fieldData || typeof fieldData !== 'string') return;

  const invalidCharsPattern = /[~!@#$%^&*+=[\]{}()<>;:"`\\/_|]/g;
  const matches = fieldData.match(invalidCharsPattern);

  if (!matches) return;

  const uniqueChars = [...new Set(matches)];
  const isPlural = uniqueChars.length > 1;
  const charsList = uniqueChars.join(' ');

  const msgPlural = content['validation--text-characters--plural'];
  const msgSingular = content['validation--text-characters--singular'];
  const message = isPlural
    ? `${msgPlural}: ${charsList}`
    : `${msgSingular}: ${charsList}`;

  errors.addError(message);
};

/**
 * Generic validator factory for date ranges with effective/termination or effective/expiration date patterns
 * @param {Object} options - configuration options
 * @param {string} options.startDateKey - key name for the effective/start date field
 * @param {string} options.endDateKey - key name for the termination/expiration/end date field
 * @param {string} [options.invalidDateMessage] - custom error message for invalid dates
 * @param {string} [options.rangeErrorMessage] - custom error message for invalid date range
 * @returns {Function} validator function that accepts (errors, data)
 */
export const validateDateRange = (options = {}) => {
  const {
    startDateKey,
    endDateKey,
    invalidDateMessage = content['validation--date-value--current'],
    rangeErrorMessage = content['validation--date-range'],
  } = options;

  return (errors, data) => {
    const startDate = data[startDateKey];
    const endDate = data[endDateKey];

    const fromDate = convertToDateField(startDate);
    const toDate = convertToDateField(endDate);

    // Validate end date is a valid date, if provided
    if (endDate && !isValid(new Date(endDate))) {
      errors[endDateKey].addError(invalidDateMessage);
      return;
    }

    // Validate date range (end date must be after start date)
    if (!isValidDateRange(fromDate, toDate)) {
      errors[endDateKey].addError(rangeErrorMessage);
    }
  };
};

/**
 * Validates that a date is not more than one year in the future.
 *
 * Ensures the date is valid, within the allowed year range (minYear to current year + 1),
 * and not more than one calendar year from today. Used for dates that should be current or near-future.
 *
 * @param {Object} errors - The errors object to add validation errors to
 * @param {string} dateString - The date string to validate (format: 'YYYY-MM-DD')
 * @param {Object} formData - The complete form data object
 * @param {Object} schema - The JSON schema for the date field
 * @param {Object} [errorMessages={}] - Optional custom error messages to override defaults
 */
export const validateFutureDate = (
  errors,
  dateString,
  formData,
  schema,
  errorMessages = {},
) => {
  const yearFromToday = add(new Date(), { years: 1 });
  const maxYear = new Date().getFullYear() + 1;

  validateDate(
    errors,
    dateString,
    formData,
    schema,
    errorMessages,
    undefined,
    undefined,
    minYear,
    maxYear,
  );

  const date = dateString ? new Date(dateString) : null;
  if (date && isValid(date) && isAfter(date, yearFromToday)) {
    errors.addError(ERR_FUTURE_DATE);
  }
};

const normalizeSsn = val => String(val ?? '').replace(/\D/g, '');

const getCurrentItemIndex = () => {
  try {
    const pathname = window?.location?.pathname || '';
    const match = pathname.match(/\/(\d+)(?:\?|$)/);
    return match ? parseInt(match[1], 10) : null;
  } catch {
    return null;
  }
};

const getSsnMatches = (fullData, current) => {
  const currentIndex = getCurrentItemIndex();
  const sponsor = normalizeSsn(fullData?.sponsorSsn);
  const applicants = (fullData?.applicants ?? [])
    .map(a => normalizeSsn(a?.applicantSsn))
    .filter(Boolean);

  const sponsorMatch = sponsor === current;
  const applicantMatches = applicants.filter(
    (ssn, index) =>
      ssn === current && (currentIndex === null || index !== currentIndex),
  ).length;

  return { sponsorMatch, applicantMatches, currentIndex };
};

const validateUniqueSsn = ({
  errors,
  fieldData,
  fullData,
  isSponsor = false,
} = {}) => {
  const current = normalizeSsn(fieldData);
  if (!current) return;

  if (!isValidSSN(current)) {
    errors.addError(ERR_SSN_INVALID);
    return;
  }

  const { sponsorMatch, applicantMatches, currentIndex } = getSsnMatches(
    fullData,
    current,
  );

  if (!isSponsor && sponsorMatch) {
    errors.addError(ERR_SSN_UNIQUE);
    return;
  }

  const duplicateThreshold = !isSponsor && currentIndex === null ? 1 : 0;
  if (applicantMatches > duplicateThreshold) {
    errors.addError(ERR_SSN_UNIQUE);
  }
};

/**
 * Validates that the sponsor's SSN is valid and unique among all form participants.
 * Checks that the SSN is properly formatted and not duplicated by any applicants.
 *
 * @param {Object} errors - The validation errors object to add errors to
 * @param {string} fieldData - The sponsor's Social Security Number to validate
 * @param {Object} fullData - The complete form data for cross-reference checking
 * @param {string} fullData.sponsorSsn - The sponsor's SSN
 * @param {Array} fullData.applicants - Array of applicant objects with their SSNs
 */
export const validateSponsorSsn = (errors, fieldData, fullData) => {
  validateUniqueSsn({ errors, fieldData, fullData, isSponsor: true });
};

/**
 * Validates that an applicant's SSN is valid and unique among all form participants.
 * Checks that the SSN is properly formatted, not duplicated by other applicants,
 * and does not match the sponsor's SSN.
 *
 * @param {Object} errors - The validation errors object to add errors to
 * @param {string} fieldData - The applicant's Social Security Number to validate
 * @param {Object} fullData - The complete form data for cross-reference checking
 * @param {string} fullData.sponsorSsn - The sponsor's SSN (to check for conflicts)
 * @param {Array} fullData.applicants - Array of all applicant objects with their SSNs
 */
export const validateApplicantSsn = (errors, fieldData, fullData) => {
  validateUniqueSsn({ errors, fieldData, fullData });
};

/**
 * Validates that only one applicant has a spousal relationship to the sponsor.
 * Prevents multiple spouse/partner applicants by checking existing relationships,
 * excluding the current applicant being edited.
 *
 * @param {Object} errors - The validation errors object to add errors to
 * @param {string} fieldData - The relationship value ('spouse', 'child', etc.)
 * @param {Object} formData - The complete form data containing all applicants
 */
export const validateSpousalRelationship = (errors, fieldData, formData) => {
  if (fieldData !== 'spouse') return;

  const currentIndex = getCurrentItemIndex();
  const isReviewPage = window?.location?.pathname?.includes(
    'review-and-submit',
  );

  const spouseCount = (formData?.applicants ?? []).filter(
    (a, i) =>
      a?.applicantRelationshipToSponsor?.relationshipToVeteran === 'spouse' &&
      (isReviewPage || currentIndex === null || i !== currentIndex),
  ).length;

  const duplicateThreshold = isReviewPage ? 1 : 0;
  if (spouseCount > duplicateThreshold) {
    errors.addError(content['validation--spousal-relationship']);
  }
};

const hasValidUpload = fileArray =>
  Array.isArray(fileArray) && fileArray[0]?.name;

/**
 * Validates Medicare plan fields for a given form item.
 *
 * Returns `true` when the item is **invalid** (i.e., has missing or bad data)
 * and `false` when all required fields are valid for the selected plan type.
 *
 * @param {Object} [item={}] Form data to validate.
 * @property {'ab'|'a'|'b'|'c'} [item.medicarePlanType] Selected plan type.
 *   - 'ab': Requires valid past dates for Parts A & B and uploaded cards. If Part D is present, it must have a valid past effective date, optional termination date, and uploaded cards.
 *   - 'a' : Requires a valid past Part A effective date and uploaded cards.
 *   - 'b' : Requires a valid past Part B effective date and uploaded cards.
 *   - 'c' : Requires a carrier, a valid past Part C effective date, and uploaded cards. If Part D is present, same rules as above.
 * @property {string} [item.medicarePartCCarrier] Required when `medicarePlanType === 'c'`.
 * @property {string} [item.medicarePartCEffectiveDate] Required past date when `medicarePlanType === 'c'`.
 * @property {boolean} [item.hasMedicarePartD] When `true` and plan supports Part D ('ab' or 'c'), Part D dates and cards are validated.
 * @property {string} [item.medicarePartDEffectiveDate] Required past date when Part D is present and supported.
 * @property {string} [item.medicarePartDTerminationDate] Optional; if provided, must be a past date when Part D is present and supported.
 * @property {{ medicarePartAEffectiveDate?: string }} [item['view:medicarePartAEffectiveDate']] Container for Part A effective date (must be a past date when required).
 * @property {{ medicarePartBEffectiveDate?: string }} [item['view:medicarePartBEffectiveDate']] Container for Part B effective date (must be a past date when required).
 * @property {Array} [item.medicarePartAFrontCard] Required uploaded file array for Part A front card.
 * @property {Array} [item.medicarePartABackCard] Required uploaded file array for Part A back card.
 * @property {Array} [item.medicarePartBFrontCard] Required uploaded file array for Part B front card.
 * @property {Array} [item.medicarePartBBackCard] Required uploaded file array for Part B back card.
 * @property {Array} [item.medicarePartAPartBFrontCard] Required uploaded file array for Parts A & B front card.
 * @property {Array} [item.medicarePartAPartBBackCard] Required uploaded file array for Parts A & B back card.
 * @property {Array} [item.medicarePartCFrontCard] Required uploaded file array for Part C front card.
 * @property {Array} [item.medicarePartCBackCard] Required uploaded file array for Part C back card.
 * @property {Array} [item.medicarePartDFrontCard] Required uploaded file array for Part D front card when Part D is present.
 * @property {Array} [item.medicarePartDBackCard] Required uploaded file array for Part D back card when Part D is present.
 *
 * @returns {boolean} `true` if validation fails (invalid/missing fields); `false` if the item is valid.
 */
export const validateMedicarePlan = (item = {}) => {
  const {
    medicarePlanType,
    medicarePartCCarrier,
    medicarePartCEffectiveDate,
    hasMedicarePartD,
    medicarePartDEffectiveDate,
    medicarePartDTerminationDate,
    medicarePartAFrontCard,
    medicarePartABackCard,
    medicarePartBFrontCard,
    medicarePartBBackCard,
    medicarePartAPartBFrontCard,
    medicarePartAPartBBackCard,
    medicarePartCFrontCard,
    medicarePartCBackCard,
    medicarePartDFrontCard,
    medicarePartDBackCard,
  } = item;
  const medicarePartAEffectiveDate =
    item['view:medicarePartAEffectiveDate']?.medicarePartAEffectiveDate;
  const medicarePartBEffectiveDate =
    item['view:medicarePartBEffectiveDate']?.medicarePartBEffectiveDate;

  const isValidEffectiveDate = dateString => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const oneYearFromNow = add(new Date(), { years: 1 });
    return isValid(date) && !isAfter(date, oneYearFromNow);
  };

  const isValidPastDate = dateString => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return isValid(date) && isBefore(date, new Date());
  };

  if (!medicarePlanType) return true;

  const planValidations = {
    ab: () => {
      if (
        !isValidEffectiveDate(medicarePartAEffectiveDate) ||
        !isValidEffectiveDate(medicarePartBEffectiveDate)
      ) {
        return true;
      }
      return (
        !hasValidUpload(medicarePartAPartBFrontCard) ||
        !hasValidUpload(medicarePartAPartBBackCard)
      );
    },
    a: () => {
      if (!isValidEffectiveDate(medicarePartAEffectiveDate)) {
        return true;
      }
      return (
        !hasValidUpload(medicarePartAFrontCard) ||
        !hasValidUpload(medicarePartABackCard)
      );
    },
    b: () => {
      if (!isValidEffectiveDate(medicarePartBEffectiveDate)) {
        return true;
      }
      return (
        !hasValidUpload(medicarePartBFrontCard) ||
        !hasValidUpload(medicarePartBBackCard)
      );
    },
    c: () => {
      if (
        !medicarePartCCarrier ||
        !isValidEffectiveDate(medicarePartCEffectiveDate)
      ) {
        return true;
      }
      return (
        !hasValidUpload(medicarePartCFrontCard) ||
        !hasValidUpload(medicarePartCBackCard)
      );
    },
  };

  const validator = planValidations[medicarePlanType];
  if (!validator || validator()) return true;

  const supportsPartD = ['ab', 'c'].includes(medicarePlanType);
  if (supportsPartD && hasMedicarePartD === true) {
    if (!isValidEffectiveDate(medicarePartDEffectiveDate)) return true;

    if (
      medicarePartDTerminationDate &&
      !isValidPastDate(medicarePartDTerminationDate)
    ) {
      return true;
    }

    if (
      !hasValidUpload(medicarePartDFrontCard) ||
      !hasValidUpload(medicarePartDBackCard)
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Validates health insurance plan fields for a given form item.
 *
 * Returns `true` when the item is **invalid** (i.e., has missing or bad data)
 * and `false` when all required fields are valid for the selected plan type.
 *
 * @param {Object} [item={}] Form data to validate.
 * @property {'hmo'|'ppo'|'medicaid'|'medigap'|'other'} [item.insuranceType] Selected insurance type. **Required if any health insurance data is present**.
 * @property {string} [item.provider] Required insurance provider name.
 * @property {string} [item.effectiveDate] Required past date for insurance start date.
 * @property {string} [item.expirationDate] Optional; if provided, must be a past date and after effective date.
 * @property {string} [item.medigapPlan] Required when `insuranceType === 'medigap'`.
 * @property {boolean} [item.throughEmployer] Required boolean indicating if insurance is through employer.
 * @property {boolean} [item.eob] Required boolean indicating if insurance covers prescriptions.
 * @property {Object} [item.healthcareParticipants] Required object indicating which applicants are covered.
 * @property {Array} [item.insuranceCardFront] Required uploaded file array for front of insurance card.
 * @property {Array} [item.insuranceCardBack] Required uploaded file array for back of insurance card.
 *
 * @returns {boolean} `true` if validation fails (invalid/missing fields); `false` if the item is valid.
 */
export const validateHealthInsurancePlan = (item = {}) => {
  const {
    insuranceType,
    provider,
    effectiveDate,
    expirationDate,
    medigapPlan,
    throughEmployer,
    eob,
    healthcareParticipants,
    insuranceCardFront,
    insuranceCardBack,
  } = item;

  const isValidPastDate = dateString => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return isValid(date) && isBefore(date, new Date());
  };

  const hasValidDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    const fromDate = convertToDateField(startDate);
    const toDate = convertToDateField(endDate);
    return isValidDateRange(fromDate, toDate);
  };

  const hasValidParticipants = participants => {
    if (!participants || typeof participants !== 'object') return false;
    return Object.values(participants).some(value => value === true);
  };

  if (!insuranceType) return true;
  if (!provider || !isValidPastDate(effectiveDate)) return true;

  if (expirationDate) {
    if (!isValidPastDate(expirationDate)) return true;
    if (!hasValidDateRange(effectiveDate, expirationDate)) return true;
  }

  if (insuranceType === 'medigap' && !medigapPlan) return true;
  if (throughEmployer === undefined || throughEmployer === null) return true;
  if (eob === undefined || eob === null) return true;

  if (!hasValidParticipants(healthcareParticipants)) return true;

  return (
    !hasValidUpload(insuranceCardFront) || !hasValidUpload(insuranceCardBack)
  );
};

const validateApplicantBasicFields = item => {
  const {
    applicantName,
    applicantDob,
    applicantSsn,
    applicantGender: { gender } = {},
    applicantPhone,
    applicantAddress: { country, street, city, state } = {},
    applicantRelationshipToSponsor,
  } = item ?? {};

  const normalizedCountry = String(country ?? '').toUpperCase();
  const isStateRequired =
    !normalizedCountry || STATE_REQUIRED_COUNTRIES.has(normalizedCountry);

  if (!applicantName?.first || !applicantName?.last) return true;
  if (!applicantDob) return true;
  if (!applicantSsn) return true;
  if (!gender) return true;
  if (!applicantPhone) return true;
  if (!street || !city || (isStateRequired && !state)) return true;
  return !applicantRelationshipToSponsor?.relationshipToVeteran;
};

const validateApplicantDateOfBirth = applicantDob => {
  if (!isValid(new Date(applicantDob))) return true;
  return isAfter(new Date(applicantDob), new Date());
};

const validateChildDocuments = item => {
  const {
    applicantRelationshipOrigin,
    applicantBirthCertOrSocialSecCard,
    applicantAdoptionPapers,
    applicantStepMarriageCert,
  } = item;
  const relationshipOrigin = applicantRelationshipOrigin?.relationshipToVeteran;

  if (!relationshipOrigin) return true;

  if (
    (relationshipOrigin === 'adoption' || relationshipOrigin === 'step') &&
    !hasValidUpload(applicantBirthCertOrSocialSecCard)
  ) {
    return true;
  }

  if (
    relationshipOrigin === 'adoption' &&
    !hasValidUpload(applicantAdoptionPapers)
  ) {
    return true;
  }

  return (
    relationshipOrigin === 'step' && !hasValidUpload(applicantStepMarriageCert)
  );
};

const validateChildDependentStatus = item => {
  const { applicantDob, applicantDependentStatus, applicantSchoolCert } = item;
  const birthDate = new Date(applicantDob);
  const age = Math.floor(
    (new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000),
  );

  if (age >= 18 && age <= 23) {
    if (!applicantDependentStatus?.status) return true;
    if (
      ['enrolled', 'intendsToEnroll'].includes(
        applicantDependentStatus.status,
      ) &&
      !hasValidUpload(applicantSchoolCert)
    ) {
      return true;
    }
  }

  return false;
};

const validateChildRequirements = item => {
  if (validateChildDocuments(item)) return true;
  return validateChildDependentStatus(item);
};

const validateSpouseMarriageDate = item => {
  const { applicantDob, dateOfMarriageToSponsor } = item;
  if (!dateOfMarriageToSponsor) return true;
  if (!isValid(new Date(dateOfMarriageToSponsor))) return true;
  if (isAfter(new Date(dateOfMarriageToSponsor), new Date())) return true;
  return isAfter(new Date(applicantDob), new Date(dateOfMarriageToSponsor));
};

const validateSpouseRequirements = item => {
  return validateSpouseMarriageDate(item);
};

/**
 * Validates if an applicant item is complete based on required fields
 * Note: This simplified version validates what we can without access to formData
 * @param {Object} item - The applicant item data
 * @returns {boolean} - true if item is incomplete, false if complete
 */
export const validateApplicant = (item = {}) => {
  if (validateApplicantBasicFields(item)) return true;
  if (validateApplicantDateOfBirth(item.applicantDob)) return true;

  const relationshipToVeteran =
    item.applicantRelationshipToSponsor?.relationshipToVeteran;

  if (relationshipToVeteran === 'child') {
    return validateChildRequirements(item);
  }

  if (relationshipToVeteran === 'spouse') {
    return validateSpouseRequirements(item);
  }

  return false;
};
