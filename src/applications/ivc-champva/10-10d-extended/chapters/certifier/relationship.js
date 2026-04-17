import {
  checkboxGroupSchema,
  checkboxGroupUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['certifier--relationship-title'];
const INPUT_LABEL = content['certifier--relationship-label'];
const CHECKGROUP_HINT = content['certifier--relationship-hint'];

const SCHEMA_LABELS = {
  spouse: content['certifier--relationship-option--spouse'],
  child: content['certifier--relationship-option--child'],
  parent: content['certifier--relationship-option--parent'],
  thirdParty: content['certifier--relationship-option--thirdParty'],
  other: content['certifier--relationship-option--other'],
};
const SCHEMA_ENUM = Object.keys(SCHEMA_LABELS);

export default {
  uiSchema: {
    ...titleUI(TITLE_TEXT),
    certifierRelationship: checkboxGroupUI({
      title: INPUT_LABEL,
      hint: CHECKGROUP_HINT,
      labels: SCHEMA_LABELS,
      required: () => true,
    }),
  },
  schema: {
    type: 'object',
    required: ['certifierRelationship'],
    properties: {
      certifierRelationship: checkboxGroupSchema(SCHEMA_ENUM),
    },
  },
};
