import {
  fileInputMultipleUI,
  fileInputMultipleSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const uploadDD214UiSchema = {
  supportingDocuments: {
    dd214Upload: fileInputMultipleUI({
      title:
        'Upload your DD Form 214 (Member 4 copy) for all periods of active duty service',
      hint:
        'You must upload the Member 4 copy — not Member 1, 2, or 3. If you served multiple periods of active duty, upload a DD Form 214 for each period. Accepted file types: PDF, JPG, PNG.',
      required: true,
      errorMessages: {
        required:
          'Please upload the Member 4 copy of your DD Form 214. If you served multiple periods of active duty, upload one for each period.',
      },
    }),
  },
};

export const uploadDD214Schema = {
  type: 'object',
  properties: {
    supportingDocuments: {
      type: 'object',
      properties: {
        dd214Upload: fileInputMultipleSchema(),
      },
    },
  },
};