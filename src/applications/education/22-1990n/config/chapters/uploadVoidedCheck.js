import {
  fileInputUI,
  fileInputSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const uploadVoidedCheckUiSchema = {
  supportingDocuments: {
    voidedCheckUpload: fileInputUI({
      title:
        'Upload a voided check or deposit slip to verify your bank account information',
      hint:
        'Per VA Form 22-1990n instructions (Item 7): attach a voided personal check or a deposit slip that matches the routing number and account number you provided. Accepted file types: PDF, JPG, PNG.',
      required: true,
      errorMessages: {
        required:
          'Please upload a voided check or deposit slip that matches your routing and account numbers.',
      },
    }),
  },
};

export const uploadVoidedCheckSchema = {
  type: 'object',
  required: ['supportingDocuments'],
  properties: {
    supportingDocuments: {
      type: 'object',
      required: ['voidedCheckUpload'],
      properties: {
        voidedCheckUpload: fileInputSchema(),
      },
    },
  },
};