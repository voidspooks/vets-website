import {
  textSchema,
  textUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';
import { titleWithFormDataUI } from '../../utils/titles';

const TITLE_TEXT = content['health-insurance--type-other-title'];
const INPUT_LABEL = content['health-insurance--type-other-label'];

export default {
  uiSchema: {
    ...titleWithFormDataUI(TITLE_TEXT, null, {
      arrayBuilder: true,
    }),
    otherType: textUI(INPUT_LABEL),
  },
  schema: {
    type: 'object',
    required: ['otherType'],
    properties: {
      otherType: textSchema,
    },
  },
};
