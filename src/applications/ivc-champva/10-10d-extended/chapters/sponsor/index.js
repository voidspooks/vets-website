import { NOT_SHARED } from '../../components/FormFields/AddressSelectionField';
import { whenAll } from '../../utils/helpers';
import addressSelection from './addressSelection';
import contactInformation from './contactInformation';
import deathInformation from './deathInformation';
import identityInformation from './identityInformation';
import livingStatus from './livingStatus';
import mailingAddress from './mailingAddress';
import personalInformation from './personalInformation';
import sectionOverview from './sectionOverview';

// Shared `depends` predicates
const isSponsor = formData => formData?.certifierRole === 'sponsor';
const isNotSponsor = formData => !isSponsor(formData);

const isDeceased = formData =>
  isNotSponsor(formData) && Boolean(formData?.sponsorIsDeceased);
const isNotDeceased = formData => !isDeceased(formData);

const hasCertifierStreet = formData =>
  Boolean(formData?.certifierAddress?.street);
const noSharedAddress = formData => {
  const val = formData?.['view:sharesAddressWith'];
  return !val || val === NOT_SHARED;
};

export const sponsorPages = {
  sponsorInformationOverview: {
    path: 'veteran-information-overview',
    title: 'Veteran information',
    ...sectionOverview,
  },
  sponsorPersonalInformation: {
    path: 'veteran-name-and-date-of-birth',
    title: 'Veteran’s name and date of birth',
    ...personalInformation,
  },
  sponsorIdentityInformation: {
    path: 'veteran-social-security-number',
    title: `Veteran’s identification information`,
    ...identityInformation,
  },
  sponsorLivingStatus: {
    path: 'veteran-life-status',
    title: 'Veteran’s status',
    depends: isNotSponsor,
    ...livingStatus,
  },
  sponsorDeathInformation: {
    path: 'veteran-death-information',
    title: 'Veteran’s death details',
    depends: isDeceased,
    ...deathInformation,
  },
  sponsorAddress: {
    path: 'veteran-address',
    title: 'Veteran’s address',
    depends: whenAll(isNotDeceased, hasCertifierStreet),
    ...addressSelection,
  },
  sponsorMailingAddress: {
    path: 'veteran-mailing-address',
    title: 'Veteran’s mailing address',
    depends: whenAll(isNotDeceased, noSharedAddress),
    ...mailingAddress,
  },
  sponsorContactInformation: {
    path: 'veteran-contact-information',
    title: 'Veteran’s contact information',
    depends: isNotDeceased,
    ...contactInformation,
  },
};
