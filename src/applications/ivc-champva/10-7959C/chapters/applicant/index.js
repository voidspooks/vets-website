import ageOver65 from './ageOver65';
import birthSex from './birthSex';
import contactInformation from './contactInformation';
import identityInformation from './identityInformation';
import mailingAddress from './mailingAddress';
import personalInformation from './personalInformation';

export const applicantPages = {
  applicantName: {
    path: 'applicant-info',
    title: 'Beneficiary’s name',
    ...personalInformation,
  },
  applicantIdentityInfo: {
    path: 'applicant-identification-info',
    title: 'Beneficiary’s identification information',
    ...identityInformation,
  },
  applicantAddress: {
    path: 'applicant-mailing-address',
    title: 'Beneficiary’s mailing address',
    ...mailingAddress,
  },
  applicantContactInfo: {
    path: 'applicant-contact-info',
    title: 'Beneficiary’s contact information',
    ...contactInformation,
  },
  applicantBirthSex: {
    path: 'applicant-gender',
    title: 'Beneficiary’s sex listed at birth',
    ...birthSex,
  },
  applicantAge: {
    path: 'applicant-age',
    title: 'Beneficiary’s age',
    ...ageOver65,
  },
};
