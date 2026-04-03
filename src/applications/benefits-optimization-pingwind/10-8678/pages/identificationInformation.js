// @ts-check
import {
  ssnUI,
  ssnSchema,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI(
      'Social Security number',
      'We need your Social Security number to process your application.',
    ),
    ssn: ssnUI(),
  },
  schema: {
    type: 'object',
    required: ['ssn'],
    properties: {
      ssn: ssnSchema,
    },
  },
};
