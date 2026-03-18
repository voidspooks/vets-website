import {
  arrayBuilderItemSubsequentPageTitleUI,
  textareaUI,
} from 'platform/forms-system/src/js/web-component-patterns';

import {
  arrayOptions,
  createNewConditionName,
  disallowWhitespaceOnly,
} from './utils';

/** @returns {PageSchema} */
const causeNewPage = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      ({ formData }) => createNewConditionName(formData, true),
      undefined,
      false,
    ),

    primaryDescription: {
      ...textareaUI({
        title:
          'Briefly describe the exposure, event, injury, or onset of disease during your military service that caused your condition.',
        hint:
          'For example, "I operated loud machinery while in the service, and this caused me to lose my hearing."',
        updateUiSchema: (_formData, fullData, index) => ({
          'ui:title': `Briefly describe the injury, event, disease, or exposure that caused ${createNewConditionName(
            fullData?.[arrayOptions.arrayPath]?.[index],
          )}.`,
        }),
        charcount: true,
      }),
      'ui:validations': [disallowWhitespaceOnly],
    },
  },

  schema: {
    type: 'object',
    properties: {
      primaryDescription: {
        type: 'string',
        minLength: 1,
        maxLength: 400,
      },
    },
    required: ['primaryDescription'],
  },
};

export default causeNewPage;
