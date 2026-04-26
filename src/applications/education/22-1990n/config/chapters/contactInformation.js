import {
  textUI,
  textSchema,
  emailUI,
  emailSchema,
  phoneUI,
  phoneSchema,
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

export const contactInformationUiSchema = {
  contactInformation: {
    'ui:title': 'Contact information',
    mailingAddress: {
      'ui:title': 'Mailing address',
      street: textUI({
        title: 'Street address (number and street)',
        hint: 'Enter the address where you want VA to send mail about your application.',
        autocomplete: 'street-address',
        errorMessages: {
          required: 'Please enter your street address.',
        },
      }),
      street2: textUI({
        title: 'Apartment or unit number',
        autocomplete: 'address-line2',
      }),
      city: textUI({
        title: 'City',
        autocomplete: 'address-level2',
        errorMessages: {
          required: 'Please enter your city.',
        },
      }),
      state: selectUI({
        title: 'State',
        labels: stateLabels,
        errorMessages: {
          required: 'Please select a state.',
        },
      }),
      postalCode: textUI({
        title: 'ZIP code',
        autocomplete: 'postal-code',
        errorMessages: {
          required: 'Please enter your ZIP code.',
          pattern: 'Please enter a valid 5- or 9-digit ZIP code.',
        },
      }),
    },
    homePhone: phoneUI({
      title: 'Home phone number (include area code)',
      hint: 'Enter your 10-digit phone number including area code.',
    }),
    mobilePhone: phoneUI({
      title: 'Mobile phone number (include area code)',
      hint: 'Optional. Enter your 10-digit mobile phone number including area code.',
    }),
    email: emailUI({
      title: 'Email address',
      hint: "We'll use this email address to send you a confirmation when your application is submitted.",
    }),
  },
};

export const contactInformationSchema = {
  type: 'object',
  required: ['contactInformation'],
  properties: {
    contactInformation: {
      type: 'object',
      required: ['mailingAddress'],
      properties: {
        mailingAddress: {
          type: 'object',
          required: ['street', 'city', 'state', 'postalCode'],
          properties: {
            street: {
              type: 'string',
              maxLength: 50,
              minLength: 1,
            },
            street2: {
              type: 'string',
              maxLength: 20,
            },
            city: {
              type: 'string',
              maxLength: 30,
              minLength: 1,
            },
            state: selectSchema(STATE_KEYS),
            postalCode: {
              type: 'string',
              pattern: '^\\d{5}(-\\d{4})?$',
              minLength: 5,
              maxLength: 10,
            },
          },
        },
        homePhone: phoneSchema,
        mobilePhone: phoneSchema,
        email: emailSchema,
      },
    },
  },
};