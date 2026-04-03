import {
  phoneSchema,
  phoneUI,
  textSchema,
  textUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';
import { titleWithFormDataUI } from '../../utils/titles';
import { validateChars } from '../../utils/validation';

const TITLE_TEXT = content['health-insurance--provider-info-title'];
const INPUT_LABELS = {
  policyNum: content['health-insurance--policy-number-label'],
  providerPhone: content['health-insurance--provider-phone-label'],
};

export default {
  uiSchema: {
    ...titleWithFormDataUI(TITLE_TEXT, null, {
      dataKey: 'name',
      fallback: content['noun--provider'],
      arrayBuilder: true,
    }),
    policyNum: textUI({
      title: INPUT_LABELS.policyNum,
      validations: [validateChars],
    }),
    providerPhone: phoneUI(INPUT_LABELS.providerPhone),
  },
  schema: {
    type: 'object',
    properties: {
      policyNum: textSchema,
      providerPhone: phoneSchema,
    },
  },
};
