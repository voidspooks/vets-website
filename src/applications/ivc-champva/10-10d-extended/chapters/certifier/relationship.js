import {
  checkboxGroupSchema,
  checkboxGroupUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['signer--relationship-title'];
const INPUT_LABEL = content['signer--relationship-label'];
const CHECKGROUP_HINT = content['signer--relationship-hint'];

const SCHEMA_LABELS = {
  spouse: content['signer--relationship-option--spouse'],
  child: content['signer--relationship-option--child'],
  parent: content['signer--relationship-option--parent'],
  thirdParty: content['signer--relationship-option--thirdParty'],
  other: content['signer--relationship-option--other'],
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
