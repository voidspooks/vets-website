// @ts-check
import {
  yesNoSchema,
  yesNoUI,
  textUI,
  textSchema,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI('Institution details'),
    institutionProfile: {
      isIhl: yesNoUI({
        yesNoReverse: true,
        title:
          'Does your country’s governing authority, with oversight over educational institutions and programs, officially classify the facility as an institution of higher learning? (i.e., as a college, university, or similar establishment offering postsecondary level academic instruction to the conference of a degree)',
        labels: {
          N: 'Yes',
          Y: 'No',
        },
      }),
      ihlDegreeTypes: {
        ...textUI({
          title: 'Enter degree type(s)',
          errorMessages: {
            required: 'You must enter a degree type',
          },
          required: formData => formData.institutionProfile?.isIhl === true,
        }),
        'ui:options': {
          expandUnder: 'isIhl',
          expandUnderCondition: true,
        },
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      institutionProfile: {
        type: 'object',
        properties: {
          isIhl: yesNoSchema,
          ihlDegreeTypes: {
            ...textSchema,
            maxLength: 500,
          },
        },
        required: ['isIhl'],
      },
    },
  },
};
