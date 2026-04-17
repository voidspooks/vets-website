// @ts-check
import get from 'platform/utilities/data/get';
import {
  addressSchema,
  addressUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';

const mailingAddressUI = addressUI({
  labels: {
    militaryCheckbox:
      'I live on a U.S. military base outside of the United States.',
    street2: 'Apartment or unit number',
    postalCode: 'Postal code',
  },
  omit: ['street3'],
});

const originalPostalReplaceSchema =
  mailingAddressUI.postalCode?.['ui:options']?.replaceSchema;

if (originalPostalReplaceSchema) {
  mailingAddressUI.postalCode['ui:options'].replaceSchema = (
    formData,
    schema,
    uiSchema,
    index,
    path,
  ) => {
    const result = originalPostalReplaceSchema(
      formData,
      schema,
      uiSchema,
      index,
      path,
    );

    const addressPath = path?.length ? path.slice(0, -1) : [];
    const addressData = get(addressPath, formData) ?? {};
    const { country } = addressData;

    let messages = {
      required: 'Enter a postal code',
      pattern: 'Enter a postal code',
    };

    if (country === 'USA') {
      messages = {
        required: 'Enter a postal code',
        pattern: 'Enter a postal code',
      };
    }

    // eslint-disable-next-line no-param-reassign -- platform replaceSchema pattern mutates uiSchema
    uiSchema['ui:errorMessages'] = messages;

    return result;
  };
}

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI(
      'Mailing address',
      'This is where we’ll mail important information about your claim.',
    ),
    address: mailingAddressUI,
  },

  schema: {
    type: 'object',
    properties: {
      address: addressSchema({ omit: ['street3'] }),
    },
    required: ['address'],
  },
};
