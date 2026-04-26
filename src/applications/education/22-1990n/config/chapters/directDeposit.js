import {
  checkboxGroupUI,
  checkboxGroupSchema,
  radioUI,
  radioSchema,
  textUI,
  textSchema,
  fileInputMultipleUI,
  fileInputMultipleSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

// ── Screen 16: Direct Deposit / Payment Information (Item 7) ──────────────────

export const paymentInformationUiSchema = {
  directDeposit: {
    noDirectDeposit: checkboxGroupUI({
      title: 'Direct deposit enrollment',
      hint:
        'If you elect not to enroll in direct deposit, you must contact representatives handling waiver requests for the Department of the Treasury at 1-888-224-2950.',
      required: false,
      labels: {
        declined: 'I do not want to enroll in direct deposit',
      },
    }),
    bankAccount: {
      'ui:options': {
        hideIf: formData =>
          formData.directDeposit &&
          formData.directDeposit.noDirectDeposit &&
          formData.directDeposit.noDirectDeposit.declined,
      },
      accountType: radioUI({
        title: 'Account type',
        labels: {
          checking: 'Checking',
          savings: 'Savings',
        },
        required: formData =>
          !(
            formData.directDeposit &&
            formData.directDeposit.noDirectDeposit &&
            formData.directDeposit.noDirectDeposit.declined
          ),
        errorMessages: { required: 'Please select an account type' },
      }),
      routingNumber: textUI({
        title: 'Bank routing or transit number',
        hint: 'Enter the 9-digit number on the bottom left of your check',
        inputType: 'text',
        errorMessages: { required: 'Please enter a valid 9-digit routing number' },
      }),
      accountNumber: textUI({
        title: 'Bank account number',
        hint: 'Enter the account number from your check or deposit slip',
        inputType: 'text',
        errorMessages: { required: 'Please enter your account number' },
      }),
    },
  },
};

export const paymentInformationSchema = {
  type: 'object',
  properties: {
    directDeposit: {
      type: 'object',
      properties: {
        noDirectDeposit: checkboxGroupSchema(['declined']),
        bankAccount: {
          type: 'object',
          properties: {
            accountType: radioSchema(['checking', 'savings']),
            routingNumber: { type: 'string', pattern: '^\\d{9}$', minLength: 9, maxLength: 9 },
            accountNumber: { type: 'string', pattern: '^\\d{4,17}$', minLength: 4, maxLength: 17 },
          },
        },
      },
    },
  },
};

// ── Screen 17: Bank Document Upload (Conditional) ────────────────────────────

export const bankDocumentUploadUiSchema = {
  directDeposit: {
    bankDocument: fileInputMultipleUI({
      title: 'Upload a voided personal check or deposit slip',
      hint:
        'To verify your account information, attach either a voided personal check or a deposit slip. Accepted file types: PDF, JPG, PNG. Maximum file size: 20MB.',
      required: true,
      errorMessages: {
        required:
          'Please upload a voided check or deposit slip to verify your bank account information',
      },
    }),
  },
};

export const bankDocumentUploadSchema = {
  type: 'object',
  properties: {
    directDeposit: {
      type: 'object',
      properties: {
        bankDocument: fileInputMultipleSchema(),
      },
    },
  },
};