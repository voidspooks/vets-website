// @ts-check
import {
  addressSchema,
  addressUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  checkboxUI,
  checkboxSchema,
} from 'platform/forms-system/src/js/web-component-patterns/checkboxPattern';

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI(
      'Mailing address',
      'We’ll send any important information about your application to this address.',
    ),
    address: addressUI({
      labels: {
        militaryCheckbox:
          'I live on a U.S. military base outside of the United States.',
        street2: 'Apartment or unit number',
      },
      omit: ['street3'],
    }),
    isNewAddress: checkboxUI({
      title: 'This is a new address',
    }),
  },
  schema: {
    type: 'object',
    properties: {
      address: addressSchema({ omit: ['street3'] }),
      isNewAddress: checkboxSchema,
    },
    required: ['address'],
  },
};
