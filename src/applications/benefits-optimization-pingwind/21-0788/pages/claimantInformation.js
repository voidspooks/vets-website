import get from 'platform/utilities/data/get';
import { cloneDeep } from 'lodash';
import {
  addressSchema,
  addressUI,
  emailToSendNotificationsSchema,
  emailToSendNotificationsUI,
  fullNameNoSuffixSchema,
  fullNameNoSuffixUI,
  internationalPhoneSchema,
  internationalPhoneUI,
  radioSchema,
  radioUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { validateTelephoneInput } from 'platform/forms-system/src/js/validation';
import {
  claimantFields,
  claimantInformationText,
  POSTAL_CODE_ERROR_MESSAGES,
  relationshipOptions,
} from '../definitions/constants';

const claimantFullNameUI = cloneDeep(fullNameNoSuffixUI());
claimantFullNameUI.first['ui:title'] = claimantInformationText.firstNameTitle;
claimantFullNameUI.first['ui:errorMessages'] = {
  required: claimantInformationText.firstNameError,
};
claimantFullNameUI.middle['ui:title'] =
  claimantInformationText.middleInitialTitle;
claimantFullNameUI.last['ui:title'] = claimantInformationText.lastNameTitle;
claimantFullNameUI.last['ui:errorMessages'] = {
  required: claimantInformationText.lastNameError,
};

const claimantFullNameSchema = cloneDeep(fullNameNoSuffixSchema);
if (claimantFullNameSchema?.properties?.middle) {
  claimantFullNameSchema.properties.middle.maxLength = 1;
}

const claimantAddressUI = addressUI({
  labels: {
    street: claimantInformationText.streetLabel,
    street2: claimantInformationText.apartmentUnitLabel,
    city: claimantInformationText.cityLabel,
    postalCode: claimantInformationText.zipCodeLabel,
  },
  omit: ['street3'],
  required: { state: () => true },
});

claimantAddressUI.street = {
  ...claimantAddressUI.street,
  'ui:errorMessages': {
    ...claimantAddressUI.street?.['ui:errorMessages'],
    required: claimantInformationText.streetRequiredError,
  },
};

claimantAddressUI.state = {
  ...claimantAddressUI.state,
  'ui:title': claimantInformationText.stateLabel,
};

const originalPostalReplaceSchema =
  claimantAddressUI.postalCode?.['ui:options']?.replaceSchema;
if (originalPostalReplaceSchema) {
  claimantAddressUI.postalCode['ui:options'].replaceSchema = (
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
    else if (['CAN', 'MEX'].includes(country)) {
      messages = POSTAL_CODE_ERROR_MESSAGES[country];
    } else if (!country) {
      messages = POSTAL_CODE_ERROR_MESSAGES.NONE;
    }
    // eslint-disable-next-line no-param-reassign -- platform replaceSchema mutates uiSchema
    uiSchema['ui:errorMessages'] = messages;
    return result;
  };
}

const primaryPhoneValidations = [
  (errors, value) => {
    if (!value?.contact || String(value.contact).trim() === '') {
      errors.addError(claimantInformationText.phoneRequiredError);
      return;
    }

    validateTelephoneInput(errors, {
      ...value,
      error: claimantInformationText.phoneRequiredError,
      required: true,
      touched: true,
    });
  },
];

export default {
  uiSchema: {
    'ui:options': { preserveHiddenData: true },
    ...titleUI(
      claimantInformationText.pageTitle,
      claimantInformationText.addressPageDescription,
    ),
    [claimantFields.parentObject]: {
      [claimantFields.fullName]: claimantFullNameUI,
      [claimantFields.relationshipType]: radioUI({
        title: claimantInformationText.relationshipTitle,
        labels: relationshipOptions,
        required: () => true,
      }),
      [claimantFields.otherRelationshipDescription]: {
        'ui:title': claimantInformationText.otherRelationshipTitle,
        'ui:options': {
          hideIf: formData =>
            formData?.claimant?.relationshipType !==
              relationshipOptions.other &&
            formData?.claimant?.relationshipType !== 'other',
          hideEmptyValueInReview: true,
        },
      },
      [claimantFields.address]: claimantAddressUI,
      [claimantFields.phone]: {
        ...internationalPhoneUI({
          title: claimantInformationText.phoneTitle,
          hint: '',
        }),
        'ui:required': () => true,
        'ui:errorMessages': {
          required: claimantInformationText.phoneRequiredError,
        },
        'ui:validations': primaryPhoneValidations,
      },
      [claimantFields.email]: {
        ...emailToSendNotificationsUI({
          title: claimantInformationText.emailTitle,
          hint: claimantInformationText.emailHint,
          errorMessages: {
            required: claimantInformationText.emailError,
            format: claimantInformationText.emailError,
          },
        }),
        'ui:required': () => true,
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [claimantFields.parentObject]: {
        type: 'object',
        properties: {
          [claimantFields.fullName]: claimantFullNameSchema,
          [claimantFields.relationshipType]: radioSchema(
            Object.keys(relationshipOptions),
          ),
          [claimantFields.otherRelationshipDescription]: {
            type: 'string',
            maxLength: 100,
          },
          [claimantFields.address]: addressSchema({ omit: ['street3'] }),
          [claimantFields.phone]: internationalPhoneSchema({
            required: true,
          }),
          [claimantFields.email]: emailToSendNotificationsSchema,
        },
        required: [
          claimantFields.fullName,
          claimantFields.relationshipType,
          claimantFields.address,
          claimantFields.phone,
          claimantFields.email,
        ],
      },
    },
  },
};
