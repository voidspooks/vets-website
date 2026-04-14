import { testNumberOfWebComponentFields } from '../../../../shared/tests/pages/pageTests.spec';
import { applicationStatusPages } from '../../../chapters/applicationStatus';
import { certifierPages } from '../../../chapters/certifier';
import { sponsorPages } from '../../../chapters/sponsor';
import formConfig from '../../../config/form';

testNumberOfWebComponentFields(
  formConfig,
  applicationStatusPages.certifierRole.schema,
  applicationStatusPages.certifierRole.uiSchema,
  1,
  'Application status - Role',
  {},
);

testNumberOfWebComponentFields(
  formConfig,
  certifierPages.certifierRelationship.schema,
  certifierPages.certifierRelationship.uiSchema,
  5,
  'Certifier Information - Relationship',
  {},
);

testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorPersonalInformation.schema,
  sponsorPages.sponsorPersonalInformation.uiSchema,
  5,
  'Sponsor Information - Name and DOB',
  {},
);
testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorIdentityInformation.schema,
  sponsorPages.sponsorIdentityInformation.uiSchema,
  1,
  'Sponsor Information - Identification info',
  {},
);
testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorIdentityInformation.schema,
  sponsorPages.sponsorIdentityInformation.uiSchema,
  1,
  'Sponsor Information - Identification info (role: sponsor)',
  { certifierRole: 'sponsor' },
);
testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorLivingStatus.schema,
  sponsorPages.sponsorLivingStatus.uiSchema,
  1,
  'Sponsor Information - Status',
  {},
);
testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorMailingAddress.schema,
  sponsorPages.sponsorMailingAddress.uiSchema,
  7,
  'Sponsor Information - Mailing Address',
  {},
);
testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorMailingAddress.schema,
  sponsorPages.sponsorMailingAddress.uiSchema,
  7,
  'Sponsor Information - Mailing Address (role: sponsor)',
  { certifierRole: 'sponsor' },
);
testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorContactInformation.schema,
  sponsorPages.sponsorContactInformation.uiSchema,
  2,
  'Sponsor Information - Contact info',
  {},
);
testNumberOfWebComponentFields(
  formConfig,
  sponsorPages.sponsorContactInformation.schema,
  sponsorPages.sponsorContactInformation.uiSchema,
  2,
  'Sponsor Information - Contact info (role: sponsor)',
  { certifierRole: 'sponsor' },
);
