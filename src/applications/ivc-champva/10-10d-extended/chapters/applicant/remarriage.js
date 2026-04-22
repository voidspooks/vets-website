import {
  yesNoSchema,
  yesNoUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { titleWithNameUI } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['applicants--remarriage-title'];
const INPUT_LABEL = content['applicants--remarriage-label'];

export default {
  uiSchema: {
    ...titleWithNameUI(TITLE_TEXT, null, { arrayBuilder: true }),
    applicantRemarried: yesNoUI(INPUT_LABEL),
  },
  schema: {
    type: 'object',
    required: ['applicantRemarried'],
    properties: {
      applicantRemarried: yesNoSchema,
    },
  },
};
