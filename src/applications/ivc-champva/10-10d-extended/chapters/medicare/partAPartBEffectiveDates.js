import {
  descriptionUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import MedicarePartCAddtlInfo from '../../components/FormDescriptions/MedicarePartCAddtlInfo';
import { blankSchema, futureDateSchema, futureDateUI } from '../../definitions';
import content from '../../locales/en/content.json';
import { medicarePageTitleUI } from '../../utils/titles';

const TITLE_TEXT = content['medicare--effective-dates-title'];
const SUBTITLE_TEXT = {
  partA: content['medicare--part-a-subtitle'],
  partB: content['medicare--part-b-subtitle'],
};

const INPUT_LABEL = content['medicare--effective-dates-label'];
const HINT_TEXT = content['medicare--effective-dates-hint'];

const subtitleUI = title =>
  titleUI({
    title,
    headerLevel: 2,
    headerStyleLevel: 3,
  });

export default {
  uiSchema: {
    ...medicarePageTitleUI(TITLE_TEXT),
    'view:medicarePartAEffectiveDate': {
      ...subtitleUI(SUBTITLE_TEXT.partA),
      medicarePartAEffectiveDate: futureDateUI({
        title: INPUT_LABEL,
        hint: HINT_TEXT,
        classNames: 'vads-u-margin-top--neg1p5',
      }),
    },
    'view:medicarePartBEffectiveDate': {
      ...subtitleUI(SUBTITLE_TEXT.partB),
      medicarePartBEffectiveDate: futureDateUI({
        title: INPUT_LABEL,
        hint: HINT_TEXT,
        classNames: 'vads-u-margin-top--neg1p5',
      }),
    },
    'view:addtlInfo': descriptionUI(MedicarePartCAddtlInfo),
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
      'view:medicarePartBEffectiveDate': {
        type: 'object',
        required: ['medicarePartBEffectiveDate'],
        properties: {
          medicarePartBEffectiveDate: futureDateSchema,
        },
      },
      'view:addtlInfo': blankSchema,
    },
  },
};
