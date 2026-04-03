import {
  addressNoMilitarySchema,
  addressNoMilitaryUI,
  textUI,
  textSchema,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';

import { validateWhiteSpace } from 'platform/forms/validations';

const uiSchema = {
  ...titleUI(
    'Name and address of organization issuing the exam',
    'To qualify for reimbursement, the organization must be located in the United States.',
  ),
  organizationName: {
    ...textUI({
      title: 'Name of organization',
      required: () => true,
      validations: [validateWhiteSpace],
      errorMessages: {
        required: 'Enter name of organization',
      },
    }),
  },
  organizationAddress: addressNoMilitaryUI(),
};

const schema = {
  type: 'object',
  properties: {
    organizationName: textSchema,
    organizationAddress: addressNoMilitarySchema({ omit: ['country'] }),
  },
  required: ['organizationName', 'organizationAddress'],
};

export { schema, uiSchema };
