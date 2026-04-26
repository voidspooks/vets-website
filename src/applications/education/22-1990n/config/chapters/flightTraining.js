import {
  yesNoUI,
  yesNoSchema,
  radioUI,
  radioSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const flightTrainingUiSchema = {
  trainingProgram: {
    flightTraining: {
      'ui:title': 'Flight training requirements',
      hasPrivatePilotLicense: yesNoUI({
        title: 'Do you currently hold a private pilot\'s license?',
        hint:
          'Per VA regulations, you must already have a private pilot\'s license to receive vocational flight training benefits.',
        required: () => true,
        errorMessages: {
          required: 'Please indicate whether you hold a private pilot\'s license.',
        },
      }),
      isATPCourse: radioUI({
        title: 'What type of flight training course are you pursuing?',
        hint:
          'Your answer determines the class of medical certificate required when you enter training.',
        labels: {
          true: 'Airline Transport Pilot (ATP) course',
          false: 'Other flight training course',
        },
        required: () => true,
        errorMessages: {
          required: 'Please select the type of flight training course.',
        },
      }),
    },
  },
};

export const flightTrainingSchema = {
  type: 'object',
  properties: {
    trainingProgram: {
      type: 'object',
      properties: {
        flightTraining: {
          type: 'object',
          properties: {
            hasPrivatePilotLicense: yesNoSchema,
            isATPCourse: radioSchema(['true', 'false']),
          },
        },
      },
    },
  },
};