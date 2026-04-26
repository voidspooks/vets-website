import {
  radioUI,
  radioSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const eligibilityScreenerUiSchema = {
  eligibilityScreener: {
    'ui:title': 'Check your eligibility',
    enteredServiceOnOrAfterOct2003: radioUI({
      title: 'Did you first enter military service on or after October 1, 2003?',
      hint: 'This is the date you first reported to your branch of service for initial active duty training.',
      labels: {
        Y: 'Yes',
        N: 'No',
      },
      errorMessages: {
        required: 'Please select yes or no.',
      },
    }),
    signedNCSContract: radioUI({
      title:
        'Did you sign an enlistment contract with the Department of Defense (DoD) specifically under the National Call to Service (NCS) program?',
      hint:
        'The NCS program is authorized under Section 510, Title 10, U.S. Code. Your contract would have been for a short-term enlistment (typically 15 months of active duty) under a specific NCS recruitment option. If you are not sure, check your enlistment paperwork or DD Form 2863.',
      labels: {
        Y: 'Yes',
        N: 'No',
      },
      errorMessages: {
        required: 'Please select yes or no.',
      },
    }),
    electedEducationIncentive: radioUI({
      title:
        'Did you elect one of the education incentives on your DD Form 2863 (National Call to Service Election of Options)?',
      hint:
        'DD Form 2863 is the form you completed when you chose your NCS incentive option. If you elected a cash bonus rather than an education incentive, VA Form 22-1990n is not the correct form for you.',
      labels: {
        YES: 'Yes',
        NO: 'No',
        NOT_SURE: "I'm not sure",
      },
      errorMessages: {
        required: 'Please select an answer.',
      },
    }),
  },
};

export const eligibilityScreenerSchema = {
  type: 'object',
  required: ['eligibilityScreener'],
  properties: {
    eligibilityScreener: {
      type: 'object',
      required: [
        'enteredServiceOnOrAfterOct2003',
        'signedNCSContract',
        'electedEducationIncentive',
      ],
      properties: {
        enteredServiceOnOrAfterOct2003: radioSchema(['Y', 'N']),
        signedNCSContract: radioSchema(['Y', 'N']),
        electedEducationIncentive: radioSchema(['YES', 'NO', 'NOT_SURE']),
      },
    },
  },
};