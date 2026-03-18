import {
  arrayBuilderItemSubsequentPageTitleUI,
  textareaUI,
  textUI,
} from 'platform/forms-system/src/js/web-component-patterns';

import {
  arrayOptions,
  createNewConditionName,
  disallowWhitespaceOnly,
} from './utils';

/** @returns {PageSchema} */
const causeVAPage = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      ({ formData } = {}) => createNewConditionName(formData, true),
      undefined,
      false,
    ),
    vaMistreatmentDescription: {
      ...textareaUI({
        title:
          'Briefly describe the injury or event in VA care that caused your condition.',
        updateUiSchema: (_formData, fullData, index) => {
          const item = fullData?.[arrayOptions.arrayPath]?.[index] || {};

          return {
            'ui:title': `Briefly describe the injury or event in VA care that caused your ${createNewConditionName(
              item,
            )}.`,
          };
        },
        charcount: true,
      }),
      'ui:validations': [disallowWhitespaceOnly],
    },
    vaMistreatmentLocation: {
      ...textUI({
        title: 'Tell us where this happened.',
        charcount: true,
      }),
      'ui:validations': [disallowWhitespaceOnly],
    },
  },

  schema: {
    type: 'object',
    properties: {
      vaMistreatmentDescription: {
        type: 'string',
        maxLength: 350,
      },
      vaMistreatmentLocation: {
        type: 'string',
        maxLength: 25,
      },
    },
    required: ['vaMistreatmentDescription', 'vaMistreatmentLocation'],
  },
};

export default causeVAPage;
