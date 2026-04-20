export default {
  uiSchema: {
    privacyAgreementAccepted: {},
  },
  schema: {
    type: 'object',
    properties: {
      privacyAgreementAccepted: {
        type: 'boolean',
        enum: [true],
      },
    },
  },
};
