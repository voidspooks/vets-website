import {
  radioSchema,
  radioUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';
import { titleWithFormDataUI } from '../../utils/titles';

const TITLE_TEXT = content['health-insurance--type-title'];
const INPUT_LABEL = content['health-insurance--type-label'];

export const SCHEMA_LABELS = {
  group: content['health-insurance--type-option--group'],
  nonGroup: content['health-insurance--type-option--nongroup'],
  medicare: content['health-insurance--type-option--medicare'],
  other: content['health-insurance--type-option--other'],
};
const SCHEMA_ENUM = Object.keys(SCHEMA_LABELS);

export default {
  uiSchema: {
    ...titleWithFormDataUI(TITLE_TEXT, null, {
      arrayBuilder: true,
    }),
    type: radioUI({
      title: INPUT_LABEL,
      labels: SCHEMA_LABELS,
    }),
  },
  schema: {
    type: 'object',
    required: ['type'],
    properties: {
      type: radioSchema(SCHEMA_ENUM),
    },
  },
};
