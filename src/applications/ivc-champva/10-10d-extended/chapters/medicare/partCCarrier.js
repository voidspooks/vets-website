import {
  futureDateSchema,
  futureDateUI,
  medicarePageTitleUI,
  textSchema,
  textUI,
} from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['medicare--part-c-carrier-title'];
const INPUT_LABELS = {
  carrier: content['medicare--part-c-carrier-label'],
  effectiveDate: content['medicare--part-c-effective-date-label'],
};
const HINT_TEXT = {
  carrier: content['medicare--part-c-carrier-hint'],
  effectiveDate: content['medicare--part-c-effective-date-hint'],
};

export default {
  uiSchema: {
    ...medicarePageTitleUI(TITLE_TEXT),
    medicarePartCCarrier: textUI({
      title: INPUT_LABELS.carrier,
      hint: HINT_TEXT.carrier,
    }),
    medicarePartCEffectiveDate: futureDateUI({
      title: INPUT_LABELS.effectiveDate,
      hint: HINT_TEXT.effectiveDate,
    }),
  },
  schema: {
    type: 'object',
    required: ['medicarePartCCarrier', 'medicarePartCEffectiveDate'],
    properties: {
      medicarePartCCarrier: textSchema,
      medicarePartCEffectiveDate: futureDateSchema,
    },
  },
};
