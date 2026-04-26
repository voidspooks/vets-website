import {
  radioUI,
  radioSchema,
  textUI,
  textSchema,
  yesNoUI,
  yesNoSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const directDepositUiSchema = {
  directDepositEnrolling: yesNoUI({
    title: 'Would you like to enroll in direct deposit?',
    hint: 'VA will deposit your education benefit payments directly into your bank account.',
    labels: {
      Y: 'Yes, enroll in direct deposit',
      N: 'No, I will receive a paper check',
    },
    errorMessages: {
      required: 'Please indicate whether you want to enroll in direct deposit.',
    },
  }),
  directDeposit: {
    'ui:title': 'Bank account information',
    'ui:options': {
      expandUnder: 'directDepositEnrolling',
      expandUnderCondition: true,
    },
    accountType: radioUI({
      title: 'Account type',
      hint: "Select the type of bank account where you'd like VA to deposit your education benefits.",
      labels: {
        CHECKING: 'Checking',
        SAVINGS: 'Savings',
      },
      required: formData => formData?.directDepositEnrolling === true,
      errorMessages: {
        required: 'Please select your account type.',
      },
    }),
    routingNumber: textUI({
      title: 'Routing or transit number',
      hint: 'Your 9-digit routing number is printed at the bottom left of your checks or on your deposit slip.',
      inputType: 'text',
      errorMessages: {
        required: 'Please enter your routing number.',
        pattern: 'Please enter a valid 9-digit routing number.',
      },
    }),
    accountNumber: textUI({
      title: 'Account number',
      hint: 'Your account number is printed at the bottom of your checks, after the routing number. Do not include the check number.',
      inputType: 'text',
      errorMessages: {
        required: 'Please enter your account number.',
        pattern: 'Please enter a valid account number (up to 17 digits).',
      },
    }),
  },
};

export const directDepositSchema = {
  type: 'object',
  properties: {
    directDepositEnrolling: yesNoSchema,
    directDeposit: {
      type: 'object',
      properties: {
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
};