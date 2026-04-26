import {
  textUI,
  textSchema,
  selectUI,
  selectSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

const stateLabels = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DC: 'District of Columbia',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  PR: 'Puerto Rico',
  GU: 'Guam',
  VI: 'U.S. Virgin Islands',
  AS: 'American Samoa',
  MP: 'Northern Mariana Islands',
  AA: 'Armed Forces Americas (AA)',
  AE: 'Armed Forces Europe (AE)',
  AP: 'Armed Forces Pacific (AP)',
};

const STATE_KEYS = Object.keys(stateLabels);

export const schoolInformationUiSchema = {
  trainingProgram: {
    schoolName: textUI({
      title: 'Name of school or training establishment',
      hint: 'If you have already selected a school or training program, enter its full name. Your school\'s address will be used to route your application to the correct VA Regional Processing Office.',
    }),
    schoolAddress: {
      'ui:title': 'School address',
      street: textUI({
        title: 'Street address',
        hint: "Entering your school's address helps VA route your application to the correct processing office.",
      }),
      city: textUI({
        title: 'City',
      }),
      state: selectUI({
        title: 'State',
        labels: stateLabels,
      }),
      postalCode: textUI({
        title: 'ZIP code',
        errorMessages: {
          pattern: 'Please enter a valid 5- or 9-digit ZIP code.',
        },
      }),
    },
  },
};

export const schoolInformationSchema = {
  type: 'object',
  required: ['trainingProgram'],
  properties: {
    trainingProgram: {
      type: 'object',
      properties: {
        schoolName: {
          type: 'string',
          maxLength: 100,
        },
        schoolAddress: {
          type: 'object',
          properties: {
            street: {
              type: 'string',
              maxLength: 50,
            },
            city: {
              type: 'string',
              maxLength: 30,
            },
            state: selectSchema(STATE_KEYS),
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