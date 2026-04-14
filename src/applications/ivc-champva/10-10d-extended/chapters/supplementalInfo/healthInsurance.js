import {
  titleUI,
  yesNoSchema,
  yesNoUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['supplemental--ohi-title'];
const DESC_TEXT = content['supplemental--ohi-description'];
const INPUT_LABEL = content['supplemental--ohi-label'];

export default {
  uiSchema: {
    ...titleUI(TITLE_TEXT, DESC_TEXT),
    'view:hasOhiToUpdate': yesNoUI(INPUT_LABEL),
  },
  schema: {
    type: 'object',
    required: ['view:hasOhiToUpdate'],
    properties: {
      'view:hasOhiToUpdate': yesNoSchema,
    },
  },
};
