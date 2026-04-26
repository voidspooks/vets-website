import {
  yesNoUI,
  yesNoSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const activeDutyStatusUiSchema = {
  serviceInformation: {
    isActiveDuty: yesNoUI({
      title: 'Are you now on active duty?',
      hint: 'Answer based on your status today.',
      required: () => true,
      errorMessages: {
        required: 'Please indicate whether you are currently on active duty.',
      },
    }),
    isOnTerminalLeave: yesNoUI({
      title: 'Are you now on terminal leave just before discharge?',
      hint:
        'Terminal leave is leave taken immediately before your separation from active duty.',
      required: () => true,
      errorMessages: {
        required:
          'Please indicate whether you are currently on terminal leave.',
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