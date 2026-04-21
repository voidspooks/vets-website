import get from 'platform/utilities/data/get';
import {
  addressUI,
  addressSchema,
  checkboxSchema,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import VaCheckboxField from 'platform/forms-system/src/js/web-component-fields/VaCheckboxField';
import {
  veteranFields,
  POSTAL_CODE_ERROR_MESSAGES,
  FORM_21_4502,
} from '../definitions/constants';

const { ADDRESS: A, PLANNED_ADDRESS: PA } = FORM_21_4502;

const hasPlannedAddressInput = formData => {
  const plannedAddressData = formData?.veteran?.plannedAddress ?? {};

  return ['country', 'street', 'street2', 'city', 'state', 'postalCode'].some(
    field => {
      const value = plannedAddressData[field];
      return typeof value === 'string' && value.trim() !== '';
    },
  );
};

const hasRequiredPlannedAddressTrigger = formData => {
  const plannedAddressData = formData?.veteran?.plannedAddress ?? {};

  return (
    plannedAddressData.isMilitary === true || hasPlannedAddressInput(formData)
  );
};

const isPlannedAddressFieldRequired = fieldName => formData => {
  const plannedAddressData = formData?.veteran?.plannedAddress ?? {};

  if (!hasRequiredPlannedAddressTrigger(formData)) {
    return false;
  }

  if (fieldName === 'country') {
    return plannedAddressData.isMilitary !== true;
  }

  if (fieldName === 'state') {
    return (
      plannedAddressData.isMilitary === true ||
      ['USA', 'CAN', 'MEX'].includes(plannedAddressData.country)
    );
  }

  return true;
};

const plannedAddressUISchema = addressUI({
  labels: {
    militaryCheckbox: A.MILITARY_CHECKBOX,
    street: A.STREET,
    street2: PA.STREET2,
    city: A.CITY,
    postalCode: A.POSTAL_CODE,
  },
  omit: ['street3'],
  required: {
    country: isPlannedAddressFieldRequired('country'),
    street: isPlannedAddressFieldRequired('street'),
    city: isPlannedAddressFieldRequired('city'),
    state: isPlannedAddressFieldRequired('state'),
    postalCode: isPlannedAddressFieldRequired('postalCode'),
  },
});

plannedAddressUISchema.street = {
  ...plannedAddressUISchema.street,
  'ui:errorMessages': {
    ...plannedAddressUISchema.street?.['ui:errorMessages'],
    required: PA.ERROR_STREET_REQUIRED,
  },
};

plannedAddressUISchema.state = {
  ...plannedAddressUISchema.state,
  'ui:title': A.STATE,
};

// Customize postal code error messages for 21-4502
const originalPostalReplaceSchema =
  plannedAddressUISchema.postalCode?.['ui:options']?.replaceSchema;
if (originalPostalReplaceSchema) {
  plannedAddressUISchema.postalCode['ui:options'].replaceSchema = (
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
    let messages = POSTAL_CODE_ERROR_MESSAGES.OTHER;
    if (country === 'USA') messages = POSTAL_CODE_ERROR_MESSAGES.USA;
    else if (['CAN', 'MEX'].includes(country))
      messages = POSTAL_CODE_ERROR_MESSAGES[country];
    else if (!country) messages = POSTAL_CODE_ERROR_MESSAGES.NONE;
    // eslint-disable-next-line no-param-reassign -- replaceSchema mutates uiSchema per platform pattern
    uiSchema['ui:errorMessages'] = messages;
    return result;
  };
}

/** @type {PageSchema} */
export default {
  uiSchema: {
    'ui:options': { preserveHiddenData: true },
    ...titleUI(PA.TITLE, PA.PAGE_DESCRIPTION),
    [veteranFields.parentObject]: {
      [veteranFields.plannedAddressNotApplicable]: {
        'ui:title': PA.NOT_APPLICABLE,
        'ui:webComponentField': VaCheckboxField,
        'ui:options': {
          hideEmptyValueInReview: true,
          validateRequired: false,
        },
        'ui:validations': [
          (errors, value, formData) => {
            if (value === true || hasRequiredPlannedAddressTrigger(formData)) {
              return;
            }

            errors.addError(PA.ERROR_REQUIRED);
          },
        ],
      },
      [veteranFields.plannedAddress]: {
        ...plannedAddressUISchema,
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [veteranFields.parentObject]: {
        type: 'object',
        properties: {
          [veteranFields.plannedAddressNotApplicable]: checkboxSchema,
          [veteranFields.plannedAddress]: addressSchema({
            omit: ['street3'],
          }),
        },
      },
    },
  },
};
