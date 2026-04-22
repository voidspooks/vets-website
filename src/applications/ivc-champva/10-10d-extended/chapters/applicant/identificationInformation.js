import {
  ssnSchema,
  ssnUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { titleWithNameUI } from '../../definitions';
import content from '../../locales/en/content.json';
import { validateApplicantSsn } from '../../utils/validations';

const TITLE_TEXT = content['applicants--identification-info-title'];

export default {
  uiSchema: {
    ...titleWithNameUI(TITLE_TEXT, null, { arrayBuilder: true }),
    applicantSsn: {
      ...ssnUI(),
      'ui:options': { useAllFormData: true },
      'ui:validations': [validateApplicantSsn],
    },
  },
  schema: {
    type: 'object',
    required: ['applicantSsn'],
    properties: {
      applicantSsn: ssnSchema,
    },
  },
};
