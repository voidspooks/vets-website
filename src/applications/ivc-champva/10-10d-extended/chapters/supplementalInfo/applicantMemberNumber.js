import { textUI } from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';
import { titleWithRoleUI } from '../../utils/titles';

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

const OPTS = { other: content['noun--beneficiary'] };
const PAGE_TITLE = titleWithRoleUI(TITLE_TEXT, null, OPTS);

export default {
  uiSchema: {
    ...PAGE_TITLE,
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
