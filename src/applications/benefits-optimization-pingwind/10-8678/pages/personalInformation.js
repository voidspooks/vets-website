// @ts-check
import {
  fullNameNoSuffixSchema,
  fullNameNoSuffixUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';

const fullNameUISchema = fullNameNoSuffixUI();
fullNameUISchema.first = {
  ...fullNameUISchema.first,
  'ui:errorMessages': {
    ...fullNameUISchema.first['ui:errorMessages'],
    required: 'Please enter your first name',
  },
};
fullNameUISchema.last = {
  ...fullNameUISchema.last,
  'ui:errorMessages': {
    ...fullNameUISchema.last['ui:errorMessages'],
    required: 'Please enter your last name',
  },
};

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI('Personal Information'),
    fullName: fullNameUISchema,
  },
  schema: {
    type: 'object',
    properties: {
      fullName: fullNameNoSuffixSchema,
    },
    required: ['fullName'],
  },
};
