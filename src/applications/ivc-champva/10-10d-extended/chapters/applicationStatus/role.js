import {
  descriptionUI,
  radioSchema,
  radioUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import SignInAlert from '../../components/FormAlerts/SignInAlert';
import content from '../../locales/en/content.json';
import { isNewSubmission } from '../../utils/helpers';

const SCHEMA_ENUM = ['applicant', 'sponsor', 'other'];
const SUBMISSION_TYPES = { NEW: 'new', UPDATE: 'update' };

const TITLE_TEXT = {
  [SUBMISSION_TYPES.NEW]: content['eligibility--role-title--new'],
  [SUBMISSION_TYPES.UPDATE]: content['eligibility--role-title--update'],
};
const INPUT_LABEL = content['eligibility--role-label'];

const buildLabels = type =>
  SCHEMA_ENUM.reduce((acc, role) => {
    acc[role] = content[`eligibility--role-option--${type}-${role}`];
    return acc;
  }, {});

const SCHEMA_LABELS = {
  [SUBMISSION_TYPES.NEW]: buildLabels(SUBMISSION_TYPES.NEW),
  [SUBMISSION_TYPES.UPDATE]: buildLabels(SUBMISSION_TYPES.UPDATE),
};

const updateUiSchema = formData => {
  const submissionType = isNewSubmission(formData)
    ? SUBMISSION_TYPES.NEW
    : SUBMISSION_TYPES.UPDATE;
  return {
    ...titleUI(TITLE_TEXT[submissionType]),
    certifierRole: {
      'ui:options': {
        labels: SCHEMA_LABELS[submissionType],
      },
    },
  };
};

export default {
  uiSchema: {
    ...descriptionUI(SignInAlert),
    certifierRole: radioUI({
      title: INPUT_LABEL,
    }),
    'ui:options': { updateUiSchema },
  },
  schema: {
    type: 'object',
    required: ['certifierRole'],
    properties: {
      certifierRole: radioSchema(SCHEMA_ENUM),
    },
  },
};
