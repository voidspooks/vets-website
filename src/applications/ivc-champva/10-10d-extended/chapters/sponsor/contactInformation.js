import {
  emailSchema,
  emailUI,
  phoneSchema,
  phoneUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { titleWithRoleUI } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['sponsor--contact-info-title'];
const DESC_TEXT = content['sponsor--contact-info-description'];

export default {
  uiSchema: {
    ...titleWithRoleUI(TITLE_TEXT, DESC_TEXT, {
      matchRole: 'sponsor',
      other: content['noun--veteran'],
    }),
    sponsorPhone: phoneUI(),
    sponsorEmail: emailUI({
      required: formData => formData.certifierRole === 'sponsor',
    }),
  },
  schema: {
    type: 'object',
    required: ['sponsorPhone'],
    properties: {
      sponsorPhone: phoneSchema,
      sponsorEmail: emailSchema,
    },
  },
};
