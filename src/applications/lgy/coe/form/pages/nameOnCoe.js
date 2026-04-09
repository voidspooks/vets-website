import {
  titleUI,
  fullNameUI,
  fullNameSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export default {
  uiSchema: {
    ...titleUI(
      'Name to show on COE',
      'Updates made here will only change your name on the Certificate of Eligibility.',
    ),
    fullName: fullNameUI(),
  },
  schema: {
    type: 'object',
    properties: {
      fullName: fullNameSchema,
    },
  },
};
