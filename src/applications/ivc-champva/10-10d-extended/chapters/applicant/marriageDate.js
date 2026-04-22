import {
  currentOrPastDateSchema,
  currentOrPastDateUI,
  descriptionUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import MarriageDateDescription from '../../components/FormDescriptions/MarriageDateDescription';
import { blankSchema, titleWithNameUI } from '../../definitions';
import content from '../../locales/en/content.json';
import { validateMarriageAfterDob } from '../../utils/validations';

const TITLE_TEXT = content['applicants--marriage-date-title'];
const DESC_TEXT = content['applicants--marriage-date-description'];
const INPUT_LABEL = content['applicants--marriage-date-label'];

export default {
  uiSchema: {
    ...titleWithNameUI(TITLE_TEXT, DESC_TEXT, { arrayBuilder: true }),
    dateOfMarriageToSponsor: currentOrPastDateUI(INPUT_LABEL),
    'view:addtlInfo': descriptionUI(MarriageDateDescription),
    'ui:validations': [validateMarriageAfterDob],
  },
  schema: {
    type: 'object',
    required: ['dateOfMarriageToSponsor'],
    properties: {
      dateOfMarriageToSponsor: currentOrPastDateSchema,
      'view:addtlInfo': blankSchema,
    },
  },
};
