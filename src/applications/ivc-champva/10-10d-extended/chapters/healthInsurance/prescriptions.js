import {
  yesNoSchema,
  yesNoUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { titleWithFormDataUI } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['health-insurance--prescription-title'];
const INPUT_LABEL = content['health-insurance--prescription-label'];
const HINT_TEXT = content['health-insurance--prescription-hint'];

export default {
  uiSchema: {
    ...titleWithFormDataUI(TITLE_TEXT, null, {
      dataKey: 'provider',
      fallback: content['noun--provider'],
      arrayBuilder: true,
    }),
    eob: yesNoUI({
      title: INPUT_LABEL,
      hint: HINT_TEXT,
    }),
  },
  schema: {
    type: 'object',
    required: ['eob'],
    properties: {
      eob: yesNoSchema,
    },
  },
};
