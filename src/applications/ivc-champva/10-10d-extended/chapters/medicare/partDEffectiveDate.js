import {
  currentOrPastDateSchema,
  currentOrPastDateUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  futureDateSchema,
  futureDateUI,
  medicarePageTitleUI,
} from '../../definitions';
import content from '../../locales/en/content.json';
import { validateDateRange } from '../../utils/validations';

const TITLE_TEXT = content['medicare--part-d-effective-date-title'];
const INPUT_LABELS = {
  effectiveDate: TITLE_TEXT,
  terminationDate: content['medicare--part-d-termination-date-label'],
};
const HINT_TEXT = {
  effectiveDate: content['medicare--part-d-effective-date-hint'],
  terminationDate: content['medicare--part-d-termination-date-hint'],
};

const VALIDATIONS = [
  validateDateRange({
    startDateKey: 'medicarePartDEffectiveDate',
    endDateKey: 'medicarePartDTerminationDate',
  }),
];

export default {
  uiSchema: {
    ...medicarePageTitleUI(TITLE_TEXT),
    medicarePartDEffectiveDate: futureDateUI({
      title: INPUT_LABELS.effectiveDate,
      hint: HINT_TEXT.effectiveDate,
    }),
    medicarePartDTerminationDate: currentOrPastDateUI({
      title: INPUT_LABELS.terminationDate,
      hint: HINT_TEXT.terminationDate,
    }),
    'ui:validations': VALIDATIONS,
  },
  schema: {
    type: 'object',
    required: ['medicarePartDEffectiveDate'],
    properties: {
      medicarePartDEffectiveDate: futureDateSchema,
      medicarePartDTerminationDate: currentOrPastDateSchema,
    },
  },
};
