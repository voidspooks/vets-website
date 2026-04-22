import {
  futureDateSchema,
  futureDateUI,
  medicarePageTitleUI,
  subtitleUI,
} from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['medicare--effective-dates-title'];
const SUBTITLE_TEXT = content['medicare--part-a-subtitle'];
const INPUT_LABEL = content['medicare--effective-dates-label'];
const HINT_TEXT = content['medicare--effective-dates-hint'];

export default {
  uiSchema: {
    ...medicarePageTitleUI(TITLE_TEXT),
    'view:medicarePartAEffectiveDate': {
      ...subtitleUI(SUBTITLE_TEXT),
      medicarePartAEffectiveDate: futureDateUI({
        title: INPUT_LABEL,
        hint: HINT_TEXT,
        classNames: 'vads-u-margin-top--neg1p5',
      }),
    },
  },
  schema: {
    type: 'object',
    properties: {
      'view:medicarePartAEffectiveDate': {
        type: 'object',
        required: ['medicarePartAEffectiveDate'],
        properties: {
          medicarePartAEffectiveDate: futureDateSchema,
        },
      },
    },
  },
};
