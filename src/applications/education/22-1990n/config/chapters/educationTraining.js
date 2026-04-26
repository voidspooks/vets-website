import {
  checkboxGroupUI,
  checkboxGroupSchema,
  yesNoUI,
  yesNoSchema,
  radioUI,
  radioSchema,
  textUI,
  textSchema,
  textareaUI,
  textareaSchema,
  selectUI,
  selectSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

import { states } from 'platform/forms/address';

// ── Screen 5: Type of Training (Item 8A) ─────────────────────────────────────

const TYPE_OF_EDUCATION_LABELS = {
  collegeOrOtherSchool: 'College or other school (including on-line courses)',
  apprenticeshipOrOJT: 'Apprenticeship or on-the-job training',
  vocationalFlightTraining: 'Vocational flight training',
  correspondence: 'Correspondence',
  nationalTestReimbursement: 'National test reimbursement (SAT, CLEP, etc.)',
  licensingOrCertificationTest:
    'Licensing or certification test reimbursement (MCSE, CCNA, EMT, NCLEX, etc.)',
};

const TYPE_OF_EDUCATION_KEYS = Object.keys(TYPE_OF_EDUCATION_LABELS);

export const typeOfTrainingUiSchema = {
  typeOfEducation: checkboxGroupUI({
    title: 'Type of education or training',
    hint: 'Select all that apply. See the information below for details about flight training and test reimbursement options.',
    required: true,
    labels: TYPE_OF_EDUCATION_LABELS,
    errorMessages: {
      required: 'Please select at least one type of education or training',
    },
  }),
};

export const typeOfTrainingSchema = {
  type: 'object',
  required: ['typeOfEducation'],
  properties: {
    typeOfEducation: checkboxGroupSchema(TYPE_OF_EDUCATION_KEYS),
  },
};

// ── Screen 6: Flight Training Requirements (Conditional) ─────────────────────

function validateFlightTrainingAcknowledged(errors, formData) {
  if (
    formData.flightTrainingCourse &&
    !formData.flightTrainingCourse.requirementsAcknowledged
  ) {
    errors.flightTrainingCourse.requirementsAcknowledged.addError(
      'Please confirm you hold the required pilot certificate and medical certificate',
    );
  }
}

export const flightTrainingRequirementsUiSchema = {
  'ui:validations': [validateFlightTrainingAcknowledged],
  flightTrainingCourse: {
    isAirlineTransportPilot: radioUI({
      title:
        'Is your flight training course an Airline Transport Pilot (ATP) course?',
      labels: {
        true: 'Yes',
        false: 'No',
      },
      required: () => true,
      errorMessages: {
        required:
          'Please indicate whether your course is an Airline Transport Pilot course',
      },
    }),
    requirementsAcknowledged: checkboxGroupUI({
      title: 'Flight training requirement acknowledgment',
      required: true,
      labels: {
        acknowledged:
          'I confirm that I currently hold the required pilot certificate and medical certificate for the type of flight training I have selected.',
      },
      errorMessages: {
        required:
          'Please confirm you hold the required pilot certificate and medical certificate',
      },
    }),
  },
};

export const flightTrainingRequirementsSchema = {
  type: 'object',
  properties: {
    flightTrainingCourse: {
      type: 'object',
      required: ['isAirlineTransportPilot', 'requirementsAcknowledged'],
      properties: {
        isAirlineTransportPilot: radioSchema(['true', 'false']),
        requirementsAcknowledged: checkboxGroupSchema(['acknowledged']),
      },
    },
  },
};

// ── Screen 7: School Information (Item 8B) ────────────────────────────────────

const schoolStateLabels = states.USA.reduce((acc, { value, label }) => {
  acc[value] = label;
  return acc;
}, {});

export const schoolInformationUiSchema = {
  schoolSelected: checkboxGroupUI({
    title: 'School selection',
    hint:
      'If you have not yet selected a school, we will use your home address to route your application.',
    required: false,
    labels: {
      selected: 'I have selected a school or training establishment',
    },
  }),
  schoolInfo: {
    'ui:options': {
      expandUnder: 'schoolSelected',
      expandUnderCondition: formData =>
        formData.schoolSelected && formData.schoolSelected.selected,
    },
    name: textUI({
      title: 'Name of school or training establishment',
      errorMessages: { required: 'Please enter the name of your school' },
    }),
    address: {
      street: textUI({
        title: 'Street address',
        errorMessages: { required: 'Please enter the school\'s street address' },
      }),
      city: textUI({
        title: 'City',
        errorMessages: { required: 'Please enter the school\'s city' },
      }),
      state: selectUI({
        title: 'State',
        labels: schoolStateLabels,
        errorMessages: { required: 'Please select the school\'s state' },
      }),
      postalCode: textUI({
        title: 'ZIP code',
        errorMessages: { required: 'Please enter the school\'s ZIP code' },
      }),
    },
  },
};

export const schoolInformationSchema = {
  type: 'object',
  properties: {
    schoolSelected: checkboxGroupSchema(['selected']),
    schoolInfo: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100 },
        address: {
          type: 'object',
          required: ['street', 'city', 'state', 'postalCode'],
          properties: {
            street: { type: 'string', minLength: 1, maxLength: 50 },
            city: { type: 'string', minLength: 1, maxLength: 30 },
            state: selectSchema(Object.keys(schoolStateLabels)),
            postalCode: {
              type: 'string',
              pattern: '^\\d{5}(-\\d{4})?$',
              maxLength: 10,
            },
          },
        },
      },
    },
  },
};

// ── Screen 8: Career Objective (Item 8C) ──────────────────────────────────────

export const careerObjectiveUiSchema = {
  educationalObjective: textareaUI({
    title: 'Educational or career objective (if known)',
    hint: 'Describe your educational or career goal. For example: Bachelor of Arts in Accounting, welding certificate, police officer.',
    charcount: true,
  }),
};

export const careerObjectiveSchema = {
  type: 'object',
  properties: {
    educationalObjective: {
      type: 'string',
      maxLength: 500,
    },
  },
};

// ── Screen 9: Benefit Authorization ──────────────────────────────────────────

export const benefitAuthorizationUiSchema = {
  highestRateAuthorization: checkboxGroupUI({
    title: 'Authorization for highest monthly rate',
    hint:
      'This authorization is optional. If you do not check this box, VA will contact you if you are eligible for more than one benefit.',
    required: false,
    labels: {
      authorized:
        'If during the review made by VA I am found to be eligible for more than one benefit, I authorize VA to pay the benefit with the highest monthly rate.',
    },
  }),
};

export const benefitAuthorizationSchema = {
  type: 'object',
  properties: {
    highestRateAuthorization: checkboxGroupSchema(['authorized']),
  },
};