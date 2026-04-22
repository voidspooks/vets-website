import {
  dateOfBirthSchema,
  dateOfBirthUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { fullNameSchema, fullNameUI, titleWithRoleUI } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['sponsor--personal-info-title'];
const DESC_TEXT = content['sponsor--personal-info-description'];

export default {
  uiSchema: {
    ...titleWithRoleUI(TITLE_TEXT, DESC_TEXT, {
      matchRole: 'sponsor',
      other: content['noun--veteran'],
    }),
    sponsorName: fullNameUI(),
    sponsorDob: dateOfBirthUI(),
  },
  schema: {
    type: 'object',
    required: ['sponsorName', 'sponsorDob'],
    properties: {
      sponsorName: fullNameSchema,
      sponsorDob: dateOfBirthSchema,
    },
  },
};
