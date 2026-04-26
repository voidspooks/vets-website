import {
  radioUI,
  radioSchema,
  yesNoUI,
  yesNoSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const flightTrainingRequirementsUiSchema = {
  flightTraining: {
    'ui:title': 'Flight training requirements',
    hasPrivatePilotLicense: yesNoUI({
      title: 'Do you currently hold a private pilot\'s license?',
      hint: "Per VA regulations, you must already have a private pilot's license to receive vocational flight training benefits.",
      errorMessages: {
        required:
          "Please indicate whether you hold a private pilot's license.",
      },
    }),
    isATPCourse: radioUI({
      title: 'What type of flight training course are you pursuing?',
      hint: 'Your answer determines the class of medical certificate required when you enter training.',
      labels: {
        Y: 'Airline Transport Pilot (ATP) course',
        N: 'Other flight training course',
      },
      required: formData =>
        formData?.flightTraining?.hasPrivatePilotLicense === true,
      errorMessages: {
        required: 'Please select your course type.',
      },
    }),
  },
};

export const flightTrainingRequirementsSchema = {
  type: 'object',
  properties: {
    flightTraining: {
      type: 'object',
      required: ['hasPrivatePilotLicense'],
      properties: {
        hasPrivatePilotLicense: yesNoSchema,
        isATPCourse: radioSchema(['Y', 'N']),
      },
    },
  },
};