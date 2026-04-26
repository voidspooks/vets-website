import {
  textUI,
  textSchema,
  radioUI,
  radioSchema,
  currentOrPastDateUI,
  currentOrPastDateSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const personalInformationUiSchema = {
  personalInformation: {
    'ui:title': 'Personal information',
    applicantSSN: {
      ...textUI({
        title: 'Social Security number',
        hint:
          'We use your Social Security number to match your application to your VA records.',
        inputType: 'text',
        autocomplete: 'off',
        errorMessages: {
          required: 'Please enter your Social Security number.',
          pattern: 'Please enter a valid 9-digit Social Security number.',
        },
      }),
      'ui:options': {
        inputType: 'text',
        inputmode: 'numeric',
        autocomplete: 'off',
      },
    },
    applicantSex: radioUI({
      title: 'Sex',
      hint: 'This information is used for VA records processing.',
      labels: {
        F: 'Female',
        M: 'Male',
      },
      required: () => true,
      errorMessages: {
        required: 'Please select your sex.',
      },
    }),
    applicantDOB: {
      ...currentOrPastDateUI({
        title: 'Date of birth',
        hint: 'Enter your date of birth as shown on your government-issued ID.',
        errorMessages: {
          required: 'Please enter your date of birth.',
          pattern: 'Please enter a valid date of birth.',
          futureDate: 'Date of birth cannot be in the future.',
        },
      }),
    },
    applicantFirstName: textUI({
      title: 'First name',
      hint: 'Enter your name exactly as it appears on your military service records.',
      autocomplete: 'given-name',
      errorMessages: {
        required: 'Please enter your first name.',
        pattern:
          'First name can only contain letters, spaces, hyphens, and apostrophes.',
      },
    }),
    applicantMiddleInitial: textUI({
      title: 'Middle initial',
      autocomplete: 'additional-name',
    }),
    applicantLastName: textUI({
      title: 'Last name',
      autocomplete: 'family-name',
      errorMessages: {
        required: 'Please enter your last name.',
        pattern:
          'Last name can only contain letters, spaces, hyphens, and apostrophes.',
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
        applicantSSN: {
          type: 'string',
          pattern: '^\\d{9}$',
          minLength: 9,
          maxLength: 9,
        },
        applicantSex: radioSchema(['F', 'M']),
        applicantDOB: currentOrPastDateSchema,
        applicantFirstName: {
          type: 'string',
          maxLength: 30,
          minLength: 1,
          pattern: "^[A-Za-z\\s'\\-]+$",
        },
        applicantMiddleInitial: {
          type: 'string',
          maxLength: 1,
          pattern: '^[A-Za-z]$',
        },
        applicantLastName: {
          type: 'string',
          maxLength: 35,
          minLength: 1,
          pattern: "^[A-Za-z\\s'\\-]+$",
        },
      },
    },
  },
};