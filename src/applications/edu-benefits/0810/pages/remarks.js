import {
  textareaUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';

const uiSchema = {
  ...titleUI('Enter your remarks'),
  remarks: {
    ...textareaUI({
      title:
        "Use this space to add any information you'd like to include in your request",
      charcount: true,
      errorMessages: {
        maxLength:
          'You are over the character limit. You must shorten your remarks.',
      },
    }),
  },
};
const schema = {
  type: 'object',
  properties: {
    remarks: {
      type: 'string',
      maxLength: 500,
    },
  },
};

export { schema, uiSchema };
