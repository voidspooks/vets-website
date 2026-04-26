import {
  yesNoUI,
  yesNoSchema,
  textUI,
  textSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const additionalAssistanceUiSchema = {
  additionalAssistance: {
    'ui:title': 'Entitlement to additional types of assistance',
    isSeniorROTCScholar: yesNoUI({
      title:
        'Are you currently participating in a Senior ROTC scholarship program which pays for your tuition, fees, books and supplies under Section 2107, Title 10, U.S. Code?',
      hint:
        'This includes ROTC scholarship programs that cover the costs of college attendance.',
      required: () => true,
      errorMessages: {
        required: 'Please indicate whether you participate in a Senior ROTC scholarship program.',
      },
    }),
    isCivilianGovEmployee: yesNoUI({
      title: 'Are you a civilian employee of the U.S. Government?',
      hint:
        'Answer Yes if you work as a civilian employee for any agency or department of the U.S. Government.',
      required: () => true,
      errorMessages: {
        required:
          'Please indicate whether you are a civilian employee of the U.S. Government.',
      },
    }),
    receivingFederalTuitionAssist: {
      ...yesNoUI({
        title:
          'Are you receiving or do you anticipate receiving any money (including but not limited to Federal Tuition Assistance) from the Armed Forces or Public Health Service for the course for which you have applied to the VA for education benefits?',
        hint:
          'For active duty claimants only. If you receive such benefits during any part of your training, select Yes.',
        'ui:options': {
          expandUnder: 'isActiveDuty',
          expandUnderCondition: (val, formData) =>
            formData &&
            formData.serviceInformation &&
            formData.serviceInformation.isActiveDuty === true,
          hideIf: formData =>
            !(
              formData &&
              formData.serviceInformation &&
              formData.serviceInformation.isActiveDuty === true
            ),
        },
      }),
    },
    receivingAgencyFunds: {
      ...yesNoUI({
        title:
          'Do you expect to receive funds from your agency or department for the same course(s) for which you expect to receive VA education assistance?',
        hint:
          'This applies if you work as a civilian employee for the U.S. Government.',
        'ui:options': {
          hideIf: formData =>
            !(
              formData &&
              formData.additionalAssistance &&
              formData.additionalAssistance.isCivilianGovEmployee === true
            ),
        },
      }),
    },
    agencyFundsSource: textUI({
      title: 'Source of funds',
      hint:
        'If Yes, show the source of these funds. Example: Department of Defense Tuition Assistance Program',
      'ui:options': {
        hideIf: formData =>
          !(
            formData &&
            formData.additionalAssistance &&
            formData.additionalAssistance.receivingAgencyFunds === true
          ),
      },
      errorMessages: {
        required: 'Please enter the source of funds.',
      },
    }),
  },
};

export const additionalAssistanceSchema = {
  type: 'object',
  required: ['additionalAssistance'],
  properties: {
    additionalAssistance: {
      type: 'object',
      required: ['isSeniorROTCScholar', 'isCivilianGovEmployee'],
      properties: {
        isSeniorROTCScholar: yesNoSchema,
        isCivilianGovEmployee: yesNoSchema,
        receivingFederalTuitionAssist: yesNoSchema,
        receivingAgencyFunds: yesNoSchema,
        agencyFundsSource: {
          type: 'string',
          maxLength: 100,
        },
      },
    },
  },
};