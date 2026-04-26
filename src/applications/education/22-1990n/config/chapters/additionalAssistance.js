import {
  yesNoUI,
  yesNoSchema,
  textUI,
  textSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const additionalAssistanceUiSchema = {
  additionalAssistance: {
    'ui:title': 'Additional assistance',
    isSeniorROTCScholar: yesNoUI({
      title:
        'Are you currently participating in a Senior ROTC scholarship program which pays for your tuition, fees, books and supplies under Section 2107, Title 10, U.S. Code?',
      hint: 'This includes ROTC scholarship programs that cover the costs of college attendance.',
      errorMessages: {
        required:
          'Please indicate whether you are a Senior ROTC scholar.',
      },
    }),
    receivingFederalTuitionAssist: {
      ...yesNoUI({
        title:
          'Are you receiving or do you anticipate receiving any money (including but not limited to Federal Tuition Assistance) from the Armed Forces or Public Health Service for the course for which you have applied to the VA for education benefits?',
        hint: 'If you receive such benefits during any part of your training, select Yes. For active duty claimants only.',
        errorMessages: {
          required:
            'Please indicate whether you are receiving Federal Tuition Assistance.',
        },
      }),
      'ui:options': {
        hideIf: formData =>
          formData?.serviceInformation?.isActiveDuty !== true,
      },
    },
    isCivilianGovEmployee: yesNoUI({
      title: 'Are you a civilian employee of the U.S. Government?',
      hint: 'This determines whether additional questions about agency funds apply to you.',
      errorMessages: {
        required:
          'Please indicate whether you are a civilian government employee.',
      },
    }),
    receivingAgencyFunds: {
      ...yesNoUI({
        title:
          'Do you expect to receive funds from your agency or department for the same course(s) for which you expect to receive VA education assistance?',
        hint: 'This applies if you work as a civilian employee for the U.S. Government.',
        errorMessages: {
          required:
            'Please indicate whether you expect to receive agency funds.',
        },
      }),
      'ui:options': {
        hideIf: formData =>
          formData?.additionalAssistance?.isCivilianGovEmployee !== true,
      },
    },
    agencyFundsSource: {
      ...textUI({
        title: 'Source of funds',
        hint: 'Show the source of these funds. Example: Department of Defense Tuition Assistance Program',
        errorMessages: {
          required: 'Please enter the source of agency funds.',
        },
      }),
      'ui:options': {
        hideIf: formData =>
          formData?.additionalAssistance?.receivingAgencyFunds !== true,
      },
    },
  },
};

export const additionalAssistanceSchema = {
  type: 'object',
  required: ['additionalAssistance'],
  properties: {
    additionalAssistance: {
      type: 'object',
      required: ['isSeniorROTCScholar'],
      properties: {
        isSeniorROTCScholar: yesNoSchema,
        receivingFederalTuitionAssist: yesNoSchema,
        isCivilianGovEmployee: yesNoSchema,
        receivingAgencyFunds: yesNoSchema,
        agencyFundsSource: {
          type: 'string',
          maxLength: 100,
        },
      },
    },
  },
};