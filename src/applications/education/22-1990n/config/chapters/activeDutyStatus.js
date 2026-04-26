import {
  yesNoUI,
  yesNoSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const activeDutyStatusUiSchema = {
  serviceInformation: {
    'ui:title': 'Active duty status',
    isActiveDuty: yesNoUI({
      title: 'Are you now on active duty?',
      hint: 'Answer based on your status today.',
      errorMessages: {
        required: 'Please indicate whether you are on active duty.',
      },
    }),
    isOnTerminalLeave: yesNoUI({
      title: 'Are you now on terminal leave just before discharge?',
      hint: 'Terminal leave is leave taken immediately before your separation from active duty.',
      errorMessages: {
        required:
          'Please indicate whether you are on terminal leave.',
      },
    }),
  },
};

export const activeDutyStatusSchema = {
  type: 'object',
  required: ['serviceInformation'],
  properties: {
    serviceInformation: {
      type: 'object',
      required: ['isActiveDuty', 'isOnTerminalLeave'],
      properties: {
        isActiveDuty: yesNoSchema,
        isOnTerminalLeave: yesNoSchema,
      },
    },
  },
};