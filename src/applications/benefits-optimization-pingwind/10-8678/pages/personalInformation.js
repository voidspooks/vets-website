// @ts-check
import {
  fullNameNoSuffixSchema,
  fullNameNoSuffixUI,
  ssnSchema,
  ssnUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';

const createFullNameUi = () => {
  const ui = fullNameNoSuffixUI();

  ui.first['ui:title'] = 'First name';
  ui.middle['ui:title'] = 'Middle initial';
  ui.last['ui:title'] = 'Last name';

  ui.first['ui:errorMessages'] = {
    required: 'Please enter your first name',
  };

  ui.last['ui:errorMessages'] = {
    required: 'Please enter your last name',
  };

  return ui;
};

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI(
      'Basic information',
      'We need to collect some basic information about you first.',
    ),
    fullName: createFullNameUi(),
    ssn: {
      ...ssnUI('Social Security number'),
      'ui:errorMessages': {
        required: 'Please enter your Social Security number',
        pattern:
          'Please enter a valid 9 digit Social Security number (dashes allowed)',
      },
    },
  },

  schema: {
    type: 'object',
    required: ['fullName', 'ssn'],
    properties: {
      fullName: {
        ...fullNameNoSuffixSchema,
        properties: {
          ...fullNameNoSuffixSchema.properties,
          middle: {
            ...fullNameNoSuffixSchema.properties.middle,
            maxLength: 1,
          },
        },
      },
      ssn: ssnSchema,
    },
  },
};
