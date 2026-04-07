import { titleUI } from 'platform/forms-system/src/js/web-component-patterns';
import { futureDateSchema, futureDateUI } from '../../definitions';
import content from '../../locales/en/content.json';
import { medicarePageTitleUI } from '../../utils/titles';

const TITLE_TEXT = content['medicare--effective-dates-title'];
const SUBTITLE_TEXT = content['medicare--part-b-subtitle'];
const INPUT_LABEL = content['medicare--effective-dates-label'];
const HINT_TEXT = content['medicare--effective-dates-hint'];

export default {
  uiSchema: {
    ...medicarePageTitleUI(TITLE_TEXT),
    'view:medicarePartBEffectiveDate': {
      ...titleUI({
        title: SUBTITLE_TEXT,
        headerLevel: 2,
        headerStyleLevel: 3,
      }),
      medicarePartBEffectiveDate: futureDateUI({
        title: INPUT_LABEL,
        hint: HINT_TEXT,
        classNames: 'vads-u-margin-top--neg1p5',
      }),
    },
  },
  schema: {
    type: 'object',
    properties: {
      'view:medicarePartBEffectiveDate': {
        type: 'object',
        required: ['medicarePartBEffectiveDate'],
        properties: {
          medicarePartBEffectiveDate: futureDateSchema,
        },
      },
    },
  },
};
