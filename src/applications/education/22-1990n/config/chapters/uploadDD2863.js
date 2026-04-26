import {
  fileInputUI,
  fileInputSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const uploadDD2863UiSchema = {
  supportingDocuments: {
    dd2863Upload: fileInputUI({
      title:
        'Upload your DD Form 2863 (National Call to Service Election of Options)',
      hint:
        'This document proves you elected an education incentive under the NCS program. Accepted file types: PDF, JPG, PNG. Maximum file size: 50MB.',
      required: true,
      errorMessages: {
        required:
          'Please upload a copy of your DD Form 2863. This document is required to process your application.',
      },
    }),
  },
};

export const uploadDD2863Schema = {
  type: 'object',
  required: ['supportingDocuments'],
  properties: {
    supportingDocuments: {
      type: 'object',
      required: ['dd2863Upload'],
      properties: {
        dd2863Upload: fileInputSchema(),
      },
    },
  },
};