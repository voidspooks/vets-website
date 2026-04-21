import {
  radioSchema,
  radioUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['certifier--role-title'];
const INPUT_LABEL = content['certifier--role-label'];

const SCHEMA_LABELS = {
  applicant: content['certifier--role-option--applicant'],
  other: content['certifier--role-option--other'],
};
const SCHEMA_ENUM = Object.keys(SCHEMA_LABELS);

export default {
  uiSchema: {
    ...titleUI(TITLE_TEXT),
    certifierRole: radioUI({
      title: INPUT_LABEL,
      labels: SCHEMA_LABELS,
    }),
  },
  schema: {
    type: 'object',
    required: ['certifierRole'],
    properties: {
      certifierRole: radioSchema(SCHEMA_ENUM),
    },
  },
};
