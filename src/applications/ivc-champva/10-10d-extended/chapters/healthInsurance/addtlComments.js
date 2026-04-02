import { textareaUI } from 'platform/forms-system/src/js/web-component-patterns';
import { validFieldCharsOnly } from '../../../shared/validations';
import { textareaSchema } from '../../definitions';
import content from '../../locales/en/content.json';
import { titleWithFormDataUI } from '../../utils/titles';

const TITLE_TEXT = content['health-insurance--addtl-comments-title'];
const INPUT_LABEL = content['health-insurance--addtl-comments-label'];
const HINT_TEXT = content['health-insurance--addtl-comments-hint'];

export default {
  uiSchema: {
    ...titleWithFormDataUI(TITLE_TEXT, null, {
      dataKey: 'provider',
      fallback: content['noun--provider'],
      arrayBuilder: true,
    }),
    additionalComments: textareaUI({
      title: INPUT_LABEL,
      hint: HINT_TEXT,
      charcount: true,
    }),
    'ui:validations': [
      (errors, formData) =>
        validFieldCharsOnly(errors, null, formData, 'additionalComments'),
    ],
  },
  schema: {
    type: 'object',
    properties: {
      additionalComments: textareaSchema,
    },
  },
};
