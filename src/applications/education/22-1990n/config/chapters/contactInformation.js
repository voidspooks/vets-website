import {
  textUI,
  textSchema,
  selectUI,
  selectSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

const usStateOptions = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL',
  'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
  'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
  'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI',
  'WY', 'PR', 'GU', 'VI', 'AS', 'MP', 'AA', 'AE', 'AP',
];

const stateLabels = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas',
  CA: 'California', CO: 'Colorado', CT: 'Connecticut', DC: 'District of Columbia',
  DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii',
  ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine',
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska',
  NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico',
  NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  PR: 'Puerto Rico', GU: 'Guam', VI: 'U.S. Virgin Islands',
  AS: 'American Samoa', MP: 'Northern Mariana Islands',
  AA: 'AA (Armed Forces Americas)', AE: 'AE (Armed Forces Europe)',
  AP: 'AP (Armed Forces Pacific)',
};

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
          required: 'Please select your state.',
        },
      }),
      postalCode: textUI({
        title: 'ZIP code',
        autocomplete: 'postal-code',
        inputType: 'text',
        errorMessages: {
          required: 'Please enter your ZIP code.',
          pattern: 'Please enter a valid 5-digit ZIP code.',
        },
      }),
    },
    homePhone: textUI({
      title: 'Home phone number (include area code)',
      hint: 'Enter your 10-digit phone number including area code. Example: 555-555-5555',
      inputType: 'tel',
      autocomplete: 'home tel',
      errorMessages: {
        required: 'Please enter your home phone number.',
        pattern: 'Please enter a valid 10-digit phone number.',
      },
    }),
    mobilePhone: textUI({
      title: 'Mobile phone number (include area code)',
      hint: 'Enter your 10-digit mobile phone number including area code. Optional.',
      inputType: 'tel',
      autocomplete: 'mobile tel',
    }),
    email: textUI({
      title: 'Email address',
      hint:
        "We'll use this email address to send you a confirmation when your application is submitted.",
      inputType: 'email',
      autocomplete: 'email',
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
            state: selectSchema(usStateOptions),
            postalCode: {
              type: 'string',
              pattern: '^\\d{5}(-\\d{4})?$',
              minLength: 5,
              maxLength: 10,
            },
          },
        },
        homePhone: {
          type: 'string',
          pattern: '^\\d{10}$',
          minLength: 10,
          maxLength: 10,
        },
        mobilePhone: {
          type: 'string',
          pattern: '^\\d{10}$',
          minLength: 10,
          maxLength: 10,
        },
        email: {
          type: 'string',
          format: 'email',
          maxLength: 256,
        },
      },
    },
  },
};