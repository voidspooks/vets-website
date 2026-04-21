import { NOT_SHARED } from '../../components/FormFields/AddressSelectionField';
import { formValue, whenAll } from './form-config';

/**
 * Returns the form data path to the certifier's full name based on their role.
 *
 * @param {Object} formData - The form data object
 * @returns {string} The dot-notation path to the certifier's name field
 *
 * @example
 * // When certifier role is 'other'
 * getCertifierNamePath({ certifierRole: 'other' }) // => 'certifierName'
 *
 * @example
 * // When certifier role is 'sponsor'
 * getCertifierNamePath({ certifierRole: 'sponsor' }) // => 'sponsorName'
 *
 * @example
 * // When certifier role is 'applicant' with selected index
 * getCertifierNamePath({
 *   certifierRole: 'applicant',
 *   'view:certifierApplicantIndex': '1'
 * }) // => 'applicants.1.applicantName'
 */
export const getCertifierNamePath = (formData = {}) => {
  const { certifierRole } = formData;
  const appIndex = formData['view:certifierApplicantIndex'] ?? 0;
  return (
    { other: 'certifierName', sponsor: 'sponsorName' }[certifierRole] ??
    `applicants.${appIndex}.applicantName`
  );
};

export const certifierRoleIs = role => formData =>
  formValue('certifierRole')(formData) === role;

export const roleIsOther = certifierRoleIs('other');

// address-sharing predicates
const certifierAddressIsNotShared = formData => {
  const sharedWith = formValue('view:certifierSharedAddress')(formData);
  return !sharedWith || sharedWith === NOT_SHARED;
};

export const certifierHasNoSharedAddressSelection = whenAll(
  roleIsOther,
  certifierAddressIsNotShared,
);
