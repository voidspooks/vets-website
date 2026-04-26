import {
  checkboxGroupUI,
  checkboxGroupSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

const TRAINING_TYPE_LABELS = {
  collegeOrSchool: 'College or other school (including online courses)',
  apprenticeshipOJT: 'Apprenticeship or on-the-job training',
  vocationalFlightTraining: 'Vocational flight training',
  correspondence: 'Correspondence',
  nationalTestReimbursement: 'National test reimbursement (SAT, CLEP, etc.)',
  licensingCertificationTest:
    'Licensing or certification test reimbursement (MCSE, CCNA, EMT, NCLEX, etc.)',
};

const TRAINING_TYPE_KEYS = Object.keys(TRAINING_TYPE_LABELS);

export const trainingTypeUiSchema = {
  trainingProgram: {
    trainingType: checkboxGroupUI({
      title: 'Type of education or training',
      hint: 'Select all that apply.',
      required: true,
      labels: TRAINING_TYPE_LABELS,
      tile: false,
      errorMessages: {
        required: 'Please select at least one type of education or training.',
      },
    }),
  },
};

export const trainingTypeSchema = {
  type: 'object',
  required: ['trainingProgram'],
  properties: {
    trainingProgram: {
      type: 'object',
      required: ['trainingType'],
      properties: {
        trainingType: checkboxGroupSchema(TRAINING_TYPE_KEYS),
      },
    },
  },
};