import { textUI, titleWithRoleUI } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['supplemental--member-number-title'];
const INPUT_LABEL = content['supplemental--member-number-label'];
const HINT_TEXT = content['supplemental--member-number-hint'];
const ERR_MSGS = {
  required: content['validation--required'],
  pattern: content['validation--member-number--pattern'],
};

const MEMBER_NUMBER_SCHEMA = {
  type: 'string',
  pattern: '^[0-9]+$',
  maxLength: 9,
  minLength: 8,
};

export default {
  uiSchema: {
    ...titleWithRoleUI(TITLE_TEXT, null, {
      other: content['noun--beneficiary'],
    }),
    applicantMemberNumber: textUI({
      title: INPUT_LABEL,
      hint: HINT_TEXT,
      errorMessages: ERR_MSGS,
    }),
  },
  schema: {
    type: 'object',
    required: ['applicantMemberNumber'],
    properties: {
      applicantMemberNumber: MEMBER_NUMBER_SCHEMA,
    },
  },
};
