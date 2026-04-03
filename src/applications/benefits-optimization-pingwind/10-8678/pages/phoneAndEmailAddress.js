// @ts-check
import {
  emailSchema,
  emailUI,
  phoneSchema,
  phoneUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI('Phone and email address'),
    daytimePhone: phoneUI('Daytime phone number'),
    eveningPhone: phoneUI('Evening phone number'),
    emailAddress: emailUI(),
  },
  schema: {
    type: 'object',
    required: ['daytimePhone', 'emailAddress'],
    properties: {
      daytimePhone: phoneSchema,
      eveningPhone: phoneSchema,
      emailAddress: emailSchema,
    },
  },
};
