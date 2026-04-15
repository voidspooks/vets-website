import React from 'react';

import {
  emailToSendNotificationsSchema,
  emailToSendNotificationsUI,
  titleUI,
  internationalPhoneSchema,
  internationalPhoneUI,
  phoneSchema,
  phoneUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  checkboxSchema,
  checkboxUI,
} from 'platform/forms-system/src/js/web-component-patterns/checkboxPattern';

import TelephoneFieldNoInternalErrors from '../components/TelephoneFieldNoInternalErrors';

import { veteranFields } from '../definitions/constants';

const shouldUsePhonePattern = fullData =>
  !!fullData?.form218940AddressAndPhoneValidation;

const phoneTenDigitSchema = {
  ...phoneSchema,
  pattern: '^\\d{10}$',
};

const phoneDefaultSchema = {
  ...phoneSchema,
  pattern: '^\\d{3}-?\\d{3}-?\\d{4}$',
};

const phoneDefaultErrorMessages = {
  required: 'Please enter a 10-digit phone number (with or without dashes)',
  pattern: 'Please enter a 10-digit phone number (with or without dashes)',
};

const phoneTenDigitErrorMessages = {
  required:
    'Please enter a 10-digit phone number (no dashes or extra characters)',
  pattern:
    'Please enter a 10-digit phone number (no dashes or extra characters)',
};

const optionalInternationalPhoneReview = ({ children }) => {
  const alt = children?.props?.formData || {};
  const { callingCode, contact, countryCode } = alt;

  let displayContact = 'No contact provided';
  if (contact) {
    const hasCallingCode = callingCode !== null && callingCode !== undefined;
    const hasCountryCode = countryCode !== null && countryCode !== undefined;
    const displayCallingCode = hasCallingCode ? `+${callingCode} ` : '';
    const displayCountryCode = hasCountryCode ? ` (${countryCode})` : '';
    displayContact = `${displayCallingCode}${contact}${displayCountryCode}`;
  }

  const label = children?.props?.uiSchema?.['ui:title'] || 'Contact';

  return (
    <div className="review-row">
      <dt>{label}</dt>
      <dd>{displayContact}</dd>
    </div>
  );
};

/** @type {PageSchema} */
export default {
  uiSchema: {
    [veteranFields.parentObject]: {
      ...titleUI('Contact information', 'How can we reach you?'),
      [veteranFields.homePhone]: {
        ...phoneUI({
          title: 'Primary phone number',
        }),
        'ui:required': () => true,
      },
      [veteranFields.alternatePhone]: {
        ...internationalPhoneUI({
          title: 'Alternate or international phone number (if applicable)',
          hideEmptyValueInReview: true,
        }),
        'ui:webComponentField': TelephoneFieldNoInternalErrors,
        'ui:reviewField': optionalInternationalPhoneReview,
      },
      [veteranFields.email]: {
        ...emailToSendNotificationsUI({
          title: 'Email address',
          hint:
            'We’ll use this email address to confirm when we receive your form',
        }),
        'ui:required': () => true,
      },
      electronicCorrespondence: checkboxUI({
        title:
          'I agree to receive electronic correspondence from the VA about my claim.',
        classNames: 'custom-width',
      }),
      'ui:options': {
        updateSchema: (
          _formData,
          schema,
          uiSchema,
          _index,
          _path,
          fullData,
        ) => {
          const useTenDigit = shouldUsePhonePattern(fullData);
          const phoneUiSchema = uiSchema?.[veteranFields.homePhone];

          if (phoneUiSchema) {
            phoneUiSchema['ui:errorMessages'] = useTenDigit
              ? phoneTenDigitErrorMessages
              : phoneDefaultErrorMessages;
          }

          return {
            ...schema,
            properties: {
              ...schema.properties,
              [veteranFields.homePhone]: useTenDigit
                ? phoneTenDigitSchema
                : phoneDefaultSchema,
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
        required: [veteranFields.homePhone, veteranFields.email],
        properties: {
          [veteranFields.homePhone]: phoneSchema,
          [veteranFields.alternatePhone]: internationalPhoneSchema(),
          [veteranFields.email]: emailToSendNotificationsSchema,
          electronicCorrespondence: checkboxSchema,
        },
      },
    },
  },
};
