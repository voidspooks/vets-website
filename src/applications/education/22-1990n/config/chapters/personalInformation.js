import {
  textUI,
  textSchema,
  radioUI,
  radioSchema,
  currentOrPastDateUI,
  currentOrPastDateSchema,
  ssnUI,
  ssnSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const personalInformationUiSchema = {
  personalInformation: {
    'ui:title': 'Personal information',
    applicantSSN: {
      ...ssnUI(),
      'ui:title': 'Social Security number',
      'ui:options': {
        hint: 'We use your Social Security number to match your application to your VA records.',
        widgetClassNames: 'field-medium',
      },
    },
    applicantSex: radioUI({
      title: 'Sex',
      hint: 'This information is used for VA records processing.',
      labels: {
        F: 'Female',
        M: 'Male',
      },
      errorMessages: {
        required: 'Please select your sex.',
      },
    }),
    applicantDOB: currentOrPastDateUI({
      title: 'Date of birth',
      hint: 'Enter your date of birth as shown on your government-issued ID.',
      errorMessages: {
        required: 'Please enter your date of birth.',
        futureDate: 'Date of birth must be in the past.',
      },
    }),
    applicantFirstName: textUI({
      title: 'First name',
      hint: 'Enter your name exactly as it appears on your military service records.',
      autocomplete: 'given-name',
      errorMessages: {
        required: 'Please enter your first name.',
      },
    }),
    applicantMiddleInitial: textUI({
      title: 'Middle initial',
      autocomplete: 'additional-name',
    }),
    applicantLastName: textUI({
      title: 'Last name',
      hint: 'Enter your name exactly as it appears on your military service records.',
      autocomplete: 'family-name',
      errorMessages: {
        required: 'Please enter your last name.',
      },
    }),
  },
};

export const personalInformationSchema = {
  type: 'object',
  required: ['personalInformation'],
  properties: {
    personalInformation: {
      type: 'object',
      required: [
        'applicantSSN',
        'applicantSex',
        'applicantDOB',
        'applicantFirstName',
        'applicantLastName',
      ],
      properties: {
        applicantSSN: ssnSchema,
        applicantSex: radioSchema(['F', 'M']),
        applicantDOB: currentOrPastDateSchema,
        applicantFirstName: {
          type: 'string',
          maxLength: 30,
          minLength: 1,
        },
        applicantMiddleInitial: {
          type: 'string',
          maxLength: 1,
        },
        applicantLastName: {
          type: 'string',
          maxLength: 35,
          minLength: 1,
        },
      },
    },
  },
};