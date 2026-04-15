import {
  titleUI,
  addressUI,
  addressSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import { veteranFields } from '../definitions/constants';

const shouldUseAddressCharacterLimit = fullData =>
  !!fullData?.form218940AddressAndPhoneValidation;

/** @type {PageSchema} */
export default {
  uiSchema: {
    [veteranFields.parentObject]: {
      ...titleUI(
        "What's your mailing address?",
        "This is where we'll send important information about your claim.",
      ),
      [veteranFields.address]: addressUI({
        labels: {
          street2: 'Apartment or unit number',
          postalCode: 'ZIP code/Postal code',
        },
        omit: ['street3'],
        required: true,
      }),
      'ui:options': {
        updateSchema: (
          _formData,
          schema,
          _uiSchema,
          _index,
          _path,
          fullData,
        ) => {
          const enableMax = shouldUseAddressCharacterLimit(fullData);
          if (!enableMax) {
            return schema;
          }
          return {
            ...schema,
            properties: {
              ...schema.properties,
              [veteranFields.address]: addressSchema({
                omit: ['street3'],
                extend: {
                  street: { maxLength: 50 },
                  street2: { maxLength: 50 },
                },
              }),
            },
          };
        },
      },
    },
  },

  schema: {
    type: 'object',
    properties: {
      [veteranFields.parentObject]: {
        type: 'object',
        properties: {
          [veteranFields.address]: addressSchema({
            omit: ['street3'],
          }),
        },
      },
    },
  },
};
