// @ts-check
import {
  titleUI,
  textUI,
  textSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI(
      'Calendar year for application',
      'Enter the calendar year you are applying for.',
    ),
    applicationYear: textUI({
      title: 'Calendar year',
      errorMessages: {
        required: 'Please enter the calendar year for this application',
        pattern: 'Enter a valid 4-digit year',
      },
    }),
  },
  schema: {
    type: 'object',
    required: ['applicationYear'],
    properties: {
      applicationYear: {
        ...textSchema,
        pattern: '^\\d{4}$',
      },
    },
  },
};
