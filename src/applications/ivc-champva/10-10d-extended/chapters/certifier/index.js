import {
  certifierHasNoSharedAddressSelection,
  certifierRoleIs,
  hasMultipleApplicants,
  roleIsOther,
  whenAll,
} from '../../utils/helpers';
import addressSelection from './addressSelection';
import applicants from './applicants';
import contactInformation from './contactInformation';
import mailingAddress from './mailingAddress';
import name from './name';
import relationship from './relationship';

export const certifierPages = {
  certifierName: {
    path: 'your-name',
    title: 'Your name',
    depends: roleIsOther,
    ...name,
  },
  certifierAddress: {
    path: 'your-address',
    title: 'Your address',
    depends: roleIsOther,
    ...addressSelection,
  },
  certifierMailingAddress: {
    path: 'your-mailing-address',
    title: 'Your mailing address',
    depends: certifierHasNoSharedAddressSelection,
    ...mailingAddress,
  },
  certifierContactInfo: {
    path: 'your-contact-information',
    title: 'Your contact information',
    depends: roleIsOther,
    ...contactInformation,
  },
  certifierRelationship: {
    path: 'your-relationship-to-applicant',
    title: 'Your relationship to the applicant(s)',
    depends: roleIsOther,
    ...relationship,
  },
  certifierApplicant: {
    path: 'certifying-applicant',
    title: 'Which applicant are you?',
    depends: whenAll(certifierRoleIs('applicant'), hasMultipleApplicants),
    ...applicants,
  },
};
