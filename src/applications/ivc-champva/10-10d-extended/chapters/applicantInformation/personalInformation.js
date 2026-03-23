import {
  dateOfBirthSchema,
  dateOfBirthUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import FirstApplicantPageDescription from '../../components/FormDescriptions/FirstApplicantPageDescription';
import {
  fullNameMiddleInitialSchema,
  fullNameMiddleInitialUI,
} from '../../definitions';
import content from '../../locales/en/content.json';
import { titleWithRoleUI } from '../../utils/titles';

const TITLE_TEXT = content['applicants--personal-info-title'];

const PAGE_TITLE = titleWithRoleUI(TITLE_TEXT, FirstApplicantPageDescription, {
  roleKey: 'view:certifierRole',
  arrayBuilder: true,
});

export default {
  uiSchema: {
    ...PAGE_TITLE,
    applicantName: fullNameMiddleInitialUI,
    applicantDob: dateOfBirthUI(),
  },
  schema: {
    type: 'object',
    required: ['applicantName', 'applicantDob'],
    properties: {
      applicantName: fullNameMiddleInitialSchema,
      applicantDob: dateOfBirthSchema,
    },
  },
};
