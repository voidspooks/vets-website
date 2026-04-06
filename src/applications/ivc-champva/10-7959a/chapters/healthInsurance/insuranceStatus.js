import {
  yesNoSchema,
  yesNoUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';
import { titleWithNameUI } from '../../utils/titles';

const TITLE_TEXT = content['health-insurance--summary-title-no-items'];
const INPUT_LABEL = content['health-insurance--yes-no-label'];
const HINT_TEXT = content['health-insurance--yes-no-hint'];

export default {
  uiSchema: {
    ...titleWithNameUI(TITLE_TEXT),
    hasOhi: yesNoUI({
      title: INPUT_LABEL,
      hint: HINT_TEXT,
    }),
  },
  schema: {
    type: 'object',
    required: ['hasOhi'],
    properties: {
      hasOhi: yesNoSchema,
    },
  },
};
