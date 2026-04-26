import {
  textareaUI,
  textareaSchema,
  checkboxGroupUI,
  checkboxGroupSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

const AUTH_LABELS = {
  highestRateAuthorization:
    'If during the review made by VA I am found to be eligible for more than one benefit, I authorize VA to pay the benefit with the highest monthly rate.',
};

const AUTH_KEYS = Object.keys(AUTH_LABELS);

export const educationObjectiveUiSchema = {
  trainingProgram: {
    educationObjective: textareaUI({
      title: 'Educational or career objective',
      hint:
        'Describe your educational or career goal. For example: Bachelor of Arts in Accounting, welding certificate, police officer. (Optional)',
      charcount: true,
    }),
    highestRateAuthorization: checkboxGroupUI({
      title: 'Authorization for highest benefit rate',
      hint:
        'Check this box if you want VA to automatically pay you at the highest rate if you qualify for more than one benefit.',
      required: false,
      labels: AUTH_LABELS,
    }),
  },
};

export const educationObjectiveSchema = {
  type: 'object',
  properties: {
    trainingProgram: {
      type: 'object',
      properties: {
        educationObjective: {
          type: 'string',
          maxLength: 500,
        },
        highestRateAuthorization: checkboxGroupSchema(AUTH_KEYS),
      },
    },
  },
};