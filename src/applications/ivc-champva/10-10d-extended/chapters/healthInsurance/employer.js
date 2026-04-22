import {
  yesNoSchema,
  yesNoUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { titleWithFormDataUI } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['health-insurance--employer-title'];
const INPUT_LABEL = content['health-insurance--employer-label'];

export default {
  uiSchema: {
    ...titleWithFormDataUI(TITLE_TEXT, null, {
      dataKey: 'provider',
      fallback: content['noun--provider'],
      arrayBuilder: true,
    }),
    throughEmployer: yesNoUI(INPUT_LABEL),
  },
  schema: {
    type: 'object',
    required: ['throughEmployer'],
    properties: {
      throughEmployer: yesNoSchema,
    },
  },
};
