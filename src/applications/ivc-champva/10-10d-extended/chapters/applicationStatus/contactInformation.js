import {
  emailSchema,
  emailUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['certifier--contact-info-title'];
const DESC_TEXT = content['certifier--contact-info-description'];

export default {
  uiSchema: {
    ...titleUI(TITLE_TEXT, DESC_TEXT),
    contactEmail: emailUI(),
  },
  schema: {
    type: 'object',
    required: ['contactEmail'],
    properties: {
      contactEmail: emailSchema,
    },
  },
};
