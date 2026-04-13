// @ts-check
import {
  addressSchema,
  addressUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI(
      'Mailing address',
      'This is where we’ll mail important information about your claim.',
    ),
    address: addressUI({
      labels: {
        militaryCheckbox:
          'I live on a U.S. military base outside of the United States.',
        street2: 'Apartment or unit number',
        postalCode: 'Enter a postal code',
      },
      omit: ['street3'],
    }),
  },
  schema: {
    type: 'object',
    properties: {
      address: addressSchema({ omit: ['street3'] }),
    },
    required: ['address'],
  },
};
