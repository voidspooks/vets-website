import {
  textUI,
  textSchema,
  radioUI,
  radioSchema,
  yesNoUI,
  yesNoSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const directDepositUiSchema = {
  contactInformation: {
    directDeposit: {
      'ui:title': 'Direct deposit information',
      enrolling: yesNoUI({
        title: 'Would you like to enroll in direct deposit?',
        hint:
          'VA will deposit your education benefit payments directly into your bank account.',
        labels: {
          Y: 'Yes, I want to enroll in direct deposit',
          N: 'No, I do not want to enroll in direct deposit',
        },
        required: () => true,
        errorMessages: {
          required: 'Please select whether you want to enroll in direct deposit.',
        },
      }),
      accountType: radioUI({
        title: 'Account type',
        hint: 'Select the type of bank account.',
        labels: {
          CHECKING: 'Checking',
          SAVINGS: 'Savings',
        },
        'ui:options': {
          expandUnder: 'enrolling',
          expandUnderCondition: true,
        },
        errorMessages: {
          required: 'Please select your account type.',
        },
      }),
      routingNumber: textUI({
        title: 'Routing or transit number',
        hint:
          'Your 9-digit routing number is printed at the bottom left of your checks or on your deposit slip.',
        inputType: 'text',
        autocomplete: 'off',
        'ui:options': {
          expandUnder: 'enrolling',
          expandUnderCondition: true,
          inputmode: 'numeric',
        },
        errorMessages: {
          required: 'Please enter your routing number.',
          pattern: 'Please enter a valid 9-digit routing number.',
        },
      }),
      accountNumber: textUI({
        title: 'Account number',
        hint:
          'Your account number is printed at the bottom of your checks, after the routing number. Do not include the check number.',
        inputType: 'text',
        autocomplete: 'off',
        'ui:options': {
          expandUnder: 'enrolling',
          expandUnderCondition: true,
          inputmode: 'numeric',
        },
        errorMessages: {
          required: 'Please enter your account number.',
          pattern: 'Please enter a valid account number (digits only, up to 17).',
        },
      }),
    },
  },
};

export const directDepositSchema = {
  type: 'object',
  properties: {
    contactInformation: {
      type: 'object',
      properties: {
        directDeposit: {
          type: 'object',
          required: ['enrolling'],
          properties: {
            enrolling: yesNoSchema,
            accountType: radioSchema(['CHECKING', 'SAVINGS']),
            routingNumber: {
              type: 'string',
              pattern: '^\\d{9}$',
              minLength: 9,
              maxLength: 9,
            },
            accountNumber: {
              type: 'string',
              pattern: '^\\d{1,17}$',
              minLength: 1,
              maxLength: 17,
            },
          },
        },
      },
    },
  },
};