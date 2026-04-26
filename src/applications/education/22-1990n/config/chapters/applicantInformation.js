import {
  ssnUI,
  ssnSchema,
  currentOrPastDateUI,
  currentOrPastDateSchema,
  radioUI,
  radioSchema,
  fullNameNoSuffixUI,
  fullNameNoSuffixSchema,
  textUI,
  textSchema,
  selectUI,
  selectSchema,
  phoneUI,
  phoneSchema,
  emailUI,
  emailSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

import { states } from 'platform/forms/address';

// ── Screen 1: Personal Information (Items 1, 2, 3) ──────────────────────────

export const personalInformationUiSchema = {
  veteranSocialSecurityNumber: {
    ...ssnUI(),
    'ui:options': {
      hint: 'Enter your 9-digit Social Security number (for example: 123-45-6789)',
      widgetClassNames: 'usa-input-medium',
    },
  },
  veteranDateOfBirth: currentOrPastDateUI({
    title: 'Date of birth',
    hint: 'For example: January 19 1970',
    errorMessages: {
      required: 'Please enter a valid date of birth',
      futureDate: 'Date of birth must be in the past',
    },
  }),
  gender: radioUI({
    title: 'Sex',
    labels: {
      F: 'Female',
      M: 'Male',
    },
    required: () => true,
    errorMessages: {
      required: 'Please select your sex',
    },
  }),
};

export const personalInformationSchema = {
  type: 'object',
  required: ['veteranSocialSecurityNumber', 'veteranDateOfBirth', 'gender'],
  properties: {
    veteranSocialSecurityNumber: ssnSchema,
    veteranDateOfBirth: currentOrPastDateSchema,
    gender: radioSchema(['F', 'M']),
  },
};

// ── Screen 2: Name (Item 4) ──────────────────────────────────────────────────

export const nameUiSchema = {
  veteranFullName: fullNameNoSuffixUI(title => `Your ${title}`),
};

export const nameSchema = {
  type: 'object',
  required: ['veteranFullName'],
  properties: {
    veteranFullName: fullNameNoSuffixSchema,
  },
};

// ── Screen 3: Address (Item 5) ───────────────────────────────────────────────

const stateLabels = states.USA.reduce((acc, { value, label }) => {
  acc[value] = label;
  return acc;
}, {});

export const addressUiSchema = {
  veteranAddress: {
    street: textUI({
      title: 'Street address',
      autocomplete: 'address-line1',
      errorMessages: { required: 'Please enter a street address' },
    }),
    street2: textUI({
      title: 'Apartment or unit number',
      autocomplete: 'address-line2',
    }),
    city: textUI({
      title: 'City',
      autocomplete: 'address-level2',
      errorMessages: { required: 'Please enter a city' },
    }),
    state: selectUI({
      title: 'State',
      labels: stateLabels,
      autocomplete: 'address-level1',
      errorMessages: { required: 'Please select a state' },
    }),
    postalCode: textUI({
      title: 'ZIP code',
      hint: 'Enter a 5-digit ZIP code (for example: 12345)',
      autocomplete: 'postal-code',
      inputType: 'text',
      errorMessages: { required: 'Please enter a valid 5-digit ZIP code' },
    }),
  },
};

export const addressSchema = {
  type: 'object',
  required: ['veteranAddress'],
  properties: {
    veteranAddress: {
      type: 'object',
      required: ['street', 'city', 'state', 'postalCode'],
      properties: {
        street: { type: 'string', minLength: 1, maxLength: 50 },
        street2: { type: 'string', maxLength: 50 },
        city: { type: 'string', minLength: 1, maxLength: 30 },
        state: selectSchema(Object.keys(stateLabels)),
        postalCode: { type: 'string', pattern: '^\\d{5}(-\\d{4})?$', maxLength: 10 },
      },
    },
  },
};

// ── Screen 4: Contact Information (Items 6A, 6B) ─────────────────────────────

function validateAtLeastOnePhone(errors, formData) {
  if (!formData.homePhone && !formData.mobilePhone) {
    errors.homePhone.addError('Please provide at least one phone number');
  }
}

export const contactInformationUiSchema = {
  'ui:validations': [validateAtLeastOnePhone],
  homePhone: phoneUI({
    title: 'Home phone number',
    hint: 'Enter 10 digits (for example: 800-555-1234)',
    errorMessages: {
      pattern: 'Please enter a valid 10-digit phone number',
    },
  }),
  mobilePhone: phoneUI({
    title: 'Mobile phone number',
    hint: 'Enter 10 digits (for example: 800-555-1234)',
    errorMessages: {
      pattern: 'Please enter a valid 10-digit phone number',
    },
  }),
  email: emailUI({
    title: 'Email address',
    hint: 'For example: name@example.com',
    errorMessages: {
      pattern: 'Please enter a valid email address',
    },
  }),
};

export const contactInformationSchema = {
  type: 'object',
  properties: {
    homePhone: phoneSchema,
    mobilePhone: { type: 'string', pattern: '^\\d{10}$', minLength: 10, maxLength: 10 },
    email: { type: 'string', format: 'email', maxLength: 255 },
  },
};