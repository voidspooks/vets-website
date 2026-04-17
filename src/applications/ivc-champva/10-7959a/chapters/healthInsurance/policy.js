import {
  arrayBuilderItemFirstPageTitleUI,
  currentOrPastDateSchema,
  currentOrPastDateUI,
  phoneSchema,
  phoneUI,
  textSchema,
  textUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';
import { not, policyDateFieldsEnabled } from '../../utils/helpers';
import { validateChars, validateDateRange } from '../../utils/validation';

const TITLE_TEXT = content['health-insurance--policy-info-title'];
const INPUT_LABELS = {
  name: content['health-insurance--provider-name-label'],
  effectiveDate: content['health-insurance--effective-date-label'],
  expirationDate: content['health-insurance--termination-date-label'],
  policyNum: content['health-insurance--policy-number-label'],
  providerPhone: content['health-insurance--provider-phone-label'],
};
const HINT_TEXT = {
  effectiveDate: content['health-insurance--effective-date-hint'],
  expirationDate: content['health-insurance--termination-date-hint'],
};

export default {
  uiSchema: {
    ...arrayBuilderItemFirstPageTitleUI({
      title: TITLE_TEXT,
      showEditExplanationText: false,
    }),
    name: textUI({
      title: INPUT_LABELS.name,
      validations: [validateChars],
    }),
    effectiveDate: currentOrPastDateUI({
      title: INPUT_LABELS.effectiveDate,
      hint: HINT_TEXT.effectiveDate,
      required: policyDateFieldsEnabled,
      hideIf: not(policyDateFieldsEnabled),
    }),
    expirationDate: currentOrPastDateUI({
      title: INPUT_LABELS.expirationDate,
      hint: HINT_TEXT.expirationDate,
      hideIf: not(policyDateFieldsEnabled),
    }),
    policyNum: textUI({
      title: INPUT_LABELS.policyNum,
      validations: [validateChars],
      hideIf: policyDateFieldsEnabled,
    }),
    providerPhone: phoneUI({
      title: INPUT_LABELS.providerPhone,
      hideIf: policyDateFieldsEnabled,
    }),
    'ui:validations': [
      validateDateRange({
        startDateKey: 'effectiveDate',
        endDateKey: 'expirationDate',
      }),
    ],
  },
  schema: {
    type: 'object',
    required: ['name'],
    properties: {
      name: textSchema,
      effectiveDate: currentOrPastDateSchema,
      expirationDate: currentOrPastDateSchema,
      policyNum: textSchema,
      providerPhone: phoneSchema,
    },
  },
};
