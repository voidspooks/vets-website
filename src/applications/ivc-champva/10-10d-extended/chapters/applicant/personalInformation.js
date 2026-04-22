import {
  dateOfBirthSchema,
  dateOfBirthUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { fullNameSchema, fullNameUI, titleWithRoleUI } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['applicants--personal-info-title'];
const DESC_TEXT = content['applicants--personal-info-description'];

export default {
  uiSchema: {
    ...titleWithRoleUI(TITLE_TEXT, DESC_TEXT, { arrayBuilder: true }),
    applicantName: fullNameUI(),
    applicantDob: dateOfBirthUI(),
  },
  schema: {
    type: 'object',
    required: ['applicantName', 'applicantDob'],
    properties: {
      applicantName: fullNameSchema,
      applicantDob: dateOfBirthSchema,
    },
  },
};
