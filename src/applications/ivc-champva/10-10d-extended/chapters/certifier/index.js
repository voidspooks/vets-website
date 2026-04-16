import { certifierHasNoSharedAddressSelection } from '../../utils/helpers';
import addressSelection from './addressSelection';
import contactInformation from './contactInformation';
import mailingAddress from './mailingAddress';
import name from './name';
import relationship from './relationship';

export const certifierPages = {
  certifierName: {
    path: 'your-name',
    title: 'Your name',
    ...name,
  },
  certifierAddress: {
    path: 'your-address',
    title: 'Your address',
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
    ...contactInformation,
  },
  certifierRelationship: {
    path: 'your-relationship-to-applicant',
    title: 'Your relationship to the applicant(s)',
    ...relationship,
  },
};
