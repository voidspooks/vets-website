import {
  yesNoSchema,
  yesNoUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';
import { medicarePageTitleUI } from '../../utils/titles';

const TITLE_TEXT = content['medicare--part-d-status-title'];
const INPUT_LABEL = content['medicare--part-d-status-label'];
const HINT_TEXT = content['medicare--part-d-status-hint'];

export default {
  uiSchema: {
    ...medicarePageTitleUI(TITLE_TEXT),
    hasMedicarePartD: yesNoUI({
      title: INPUT_LABEL,
      hint: HINT_TEXT,
    }),
  },
  schema: {
    type: 'object',
    required: ['hasMedicarePartD'],
    properties: {
      hasMedicarePartD: yesNoSchema,
    },
  },
};
