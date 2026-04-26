import {
  yesNoUI,
  yesNoSchema,
  textUI,
  textSchema,
  radioUI,
  radioSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

// ── Screen 13: Senior ROTC Scholarship (Item 11A) ─────────────────────────────

export const rotcScholarshipUiSchema = {
  seniorRotcScholarship: yesNoUI({
    title:
      'Are you currently participating in a Senior ROTC scholarship program which pays for your tuition, fees, books and supplies under Section 2107, Title 10, U.S. Code?',
    required: () => true,
    errorMessages: {
      required:
        'Please indicate whether you are participating in a Senior ROTC scholarship program',
    },
  }),
};

export const rotcScholarshipSchema = {
  type: 'object',
  required: ['seniorRotcScholarship'],
  properties: {
    seniorRotcScholarship: yesNoSchema,
  },
};

// ── Screen 14: Federal Tuition Assistance (Item 11B) — Active Duty Only ───────

export const federalTuitionAssistanceUiSchema = {
  federalTuitionAssistance: yesNoUI({
    title:
      'Are you receiving or do you anticipate receiving any money (including but not limited to Federal Tuition Assistance) from the Armed Forces or Public Health Service for the course for which you have applied to the VA for education benefits? If you receive such benefits during any part of your training, answer Yes.',
    required: () => true,
    errorMessages: {
      required:
        'Please indicate whether you are receiving or anticipate receiving money from the Armed Forces or Public Health Service for this course',
    },
  }),
};

export const federalTuitionAssistanceSchema = {
  type: 'object',
  required: ['federalTuitionAssistance'],
  properties: {
    federalTuitionAssistance: yesNoSchema,
  },
};

// ── Screen 15: Civilian Government Employee (Item 11C) ────────────────────────

export const govtEmployeeUiSchema = {
  civilianGovtEmployee: yesNoUI({
    title: 'Are you a civilian employee of the U.S. Government?',
    required: () => true,
    errorMessages: {
      required:
        'Please indicate whether you are a civilian employee of the U.S. Government',
    },
  }),
  govtEmployeeFunding: {
    ...yesNoUI({
      title:
        'Do you expect to receive funds from your agency or department for the same course(s) for which you expect to receive VA education assistance?',
      required: () => false,
      errorMessages: {
        required:
          'Please indicate whether you expect to receive funds from your agency for these courses',
      },
    }),
    'ui:options': {
      expandUnder: 'civilianGovtEmployee',
      expandUnderCondition: true,
    },
  },
  govtEmployeeFundingSource: {
    ...textUI({
      title: 'Source of funds',
      hint: 'For example: Department of Defense Tuition Assistance, agency training fund',
      errorMessages: { required: 'Please describe the source of funds' },
    }),
    'ui:options': {
      expandUnder: 'govtEmployeeFunding',
      expandUnderCondition: true,
    },
  },
};

export const govtEmployeeSchema = {
  type: 'object',
  required: ['civilianGovtEmployee'],
  properties: {
    civilianGovtEmployee: yesNoSchema,
    govtEmployeeFunding: yesNoSchema,
    govtEmployeeFundingSource: { type: 'string', maxLength: 200 },
  },
};