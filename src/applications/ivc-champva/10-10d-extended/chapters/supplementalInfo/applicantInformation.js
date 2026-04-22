import {
  dateOfBirthSchema,
  dateOfBirthUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import SupplementalApplicantDescription from '../../components/FormDescriptions/SupplementalApplicantDescription';
import { fullNameSchema, fullNameUI } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['supplemental--applicant-personal-info-title'];

export default {
  uiSchema: {
    ...titleUI(TITLE_TEXT, SupplementalApplicantDescription),
    applicantName: fullNameUI(),
    applicantDob: dateOfBirthUI(),
  },
  schema: {
    type: 'object',
    required: ['applicantName', 'applicantDob'],
    properties: {
      applicantName: fullNameSchema,
      applicantDob: dateOfBirthSchema,
    },
  },
};
