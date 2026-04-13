// @ts-check
import {
  emailToSendNotificationsSchema,
  emailToSendNotificationsUI,
  phoneSchema,
  phoneUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import VaCheckboxField from 'platform/forms-system/src/js/web-component-fields/VaCheckboxField';

const phoneFieldUi = phoneUI({
  title: "Veteran's telephone number",
  errorMessages: {
    required: 'Please enter a 10-digit phone number (with or without dashes)',
    pattern: 'Please enter a 10-digit phone number (with or without dashes)',
  },
});

const emailFieldUi = emailToSendNotificationsUI({
  title: 'Email address',
  hint: 'We’ll use this email address to confirm when we receive your form',
});

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI('Phone number and email address', 'How can we reach you?'),
    phone: phoneFieldUi,
    emailAddress: emailFieldUi,
    electronicCorrespondence: {
      'ui:title':
        'I agree to receive electronic correspondence from VA about my claim.',
      'ui:webComponentField': VaCheckboxField,
      'ui:options': {
        classNames: 'custom-width',
      },
    },
  },

  schema: {
    type: 'object',
    properties: {
      phone: phoneSchema,
      emailAddress: emailToSendNotificationsSchema,
      electronicCorrespondence: { type: 'boolean' },
    },
    required: ['phone', 'emailAddress'],
  },
};
