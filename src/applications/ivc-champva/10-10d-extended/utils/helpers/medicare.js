import { toHash } from '../../../shared/utilities';
import content from '../../locales/en/content.json';
import { getAgeInYears } from './applicants';
import { formValue, indexedValue, whenAll, whenAny } from './form-config';
import { formatFullName } from './formatting';

const APPLICANT_TEXT = content['noun--applicant'];
const NO_PARTICIPANT_TEXT = content['medicare--participant-none'];

/**
 * Generate a display name for the current Medicare participant.
 *
 * Uses `item.medicareParticipant` (a hashed SSN) to find a matching applicant
 * in the provided `applicants` array by comparing it to `toHash(applicant.applicantSsn)`.
 * When a match is found, returns the formatted full name via `formatFullName(applicant.applicantName)`.
 * If no matching applicant is found, returns `"Applicant"`. When `item` is falsy,
 * returns `"No participant"`.
 *
 * @param {Object} [item] - Container holding participant context.
 * @param {string} [item.medicareParticipant] - Hashed SSN used to identify the participant.
 * @param {number} _index - Unused index parameter, required by the calling context.
 * @param {Object} [options] - Additional lookup context.
 * @param {Array<Object>} [options.applicants=[]] - Applicant records, each including
 *   `applicantSsn` (string) and `applicantName` (object with name parts).
 * @returns {string} Participant name (e.g., `"Jane Doe"`), `"Applicant"`, or `"No participant"`.
 */
export const generateParticipantName = (item, _, { applicants = [] } = {}) => {
  if (!item) return NO_PARTICIPANT_TEXT;
  const match = applicants.find(
    a => item?.medicareParticipant === toHash(a.applicantSsn),
  );
  return match
    ? formatFullName(match.applicantName)
    : APPLICANT_TEXT.charAt(0).toUpperCase() + APPLICANT_TEXT.slice(1);
};

/**
 * Return applicants who do not have a Medicare plan recorded.
 *
 * Compares each `formData.applicants[*].applicantSsn` (hashed via `toHash`)
 * against every `formData.medicare[*].medicareParticipant` value. Any applicant
 * whose hashed SSN does **not** appear in the Medicare list is included.
 *
 * If `formData.applicants` is missing/undefined, the function returns `undefined`.
 *
 * @param {Object} formData - Form data containing applicants and Medicare records.
 * @param {Object[]} [formData.applicants] - Applicant records; each should include `applicantSsn`.
 * @param {Object[]} [formData.medicare] - Medicare records; each may include `medicareParticipant` (hashed SSN).
 * @returns {Object[]|undefined} Array of applicants without Medicare, or `undefined` if no applicants list is present.
 */
export const getEligibleApplicantsWithoutMedicare = formData => {
  const participantHashes = new Set(
    (formData?.medicare || []).map(plan => plan?.medicareParticipant),
  );
  return formData?.applicants?.filter(
    a => !participantHashes.has(toHash(a.applicantSsn)),
  );
};

const medicareValue = path => indexedValue('medicare', path);

const hasPlanType = expected => (formData, index) =>
  medicareValue('medicarePlanType')(formData, index) === expected;
const hasPartADenial = (formData, index) =>
  Boolean(medicareValue('view:hasPartADenial.hasPartADenial')(formData, index));

const is65OrOlder = ({ applicants, medicare }, index) => {
  const curAppHash = medicare?.[index]?.medicareParticipant;
  const curApp = applicants?.find(a => toHash(a.applicantSsn) === curAppHash);
  return getAgeInYears(curApp?.applicantDob) >= 65;
};

export const hasPartsAB = hasPlanType('ab');
export const hasPartA = hasPlanType('a');
export const hasPartB = hasPlanType('b');
export const hasPartC = hasPlanType('c');
export const hasPartsABorC = whenAny(hasPartsAB, hasPartC);
export const hasPartD = medicareValue('hasMedicarePartD');

export const needsDenialProof = whenAll(hasPartB, hasPartADenial, is65OrOlder);

export const hasEligibleApplicant = formData => {
  const excluded = getEligibleApplicantsWithoutMedicare(formData) ?? [];
  return excluded.some(a => getAgeInYears(a.applicantDob) >= 65);
};

export const needsIneligibilityProof = formValue(
  'view:hasProofMultipleApplicants.hasProofMultipleApplicants',
);
