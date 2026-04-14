import {
  descriptionUI,
  radioSchema,
  radioUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import SubmissionTypeAddtlInfo from '../../components/FormDescriptions/SubmissionTypeAddtlInfo';
import { blankSchema } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['eligibility--type-title'];
const INPUT_LABEL = content['eligibility--type-label'];

const SCHEMA_LABELS = {
  new: content['eligibility--type-option--new'],
  existing: content['eligibility--type-option--existing'],
  enrollment: content['eligibility--type-option--enrollment'],
};
const SCHEMA_ENUM = Object.keys(SCHEMA_LABELS);

export default {
  uiSchema: {
    ...titleUI(TITLE_TEXT),
    submissionType: radioUI({
      title: INPUT_LABEL,
      labels: SCHEMA_LABELS,
    }),
    'view:addtlInfo': descriptionUI(SubmissionTypeAddtlInfo),
  },
  schema: {
    type: 'object',
    required: ['submissionType'],
    properties: {
      submissionType: radioSchema(SCHEMA_ENUM),
      'view:addtlInfo': blankSchema,
    },
  },
};
