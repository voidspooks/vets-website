import {
  radioSchema,
  radioUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { medicarePageTitleUI } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['medicare--plan-type-title'];
const INPUT_LABEL = content['medicare--plan-type-label'];

export const SCHEMA_LABELS = {
  ab: content['medicare--plan-type-option--ab'],
  c: content['medicare--plan-type-option--c'],
  a: content['medicare--plan-type-option--a'],
  b: content['medicare--plan-type-option--b'],
};
const SCHEMA_ENUM = Object.keys(SCHEMA_LABELS);

export default {
  uiSchema: {
    ...medicarePageTitleUI(TITLE_TEXT),
    medicarePlanType: radioUI({
      title: INPUT_LABEL,
      labels: SCHEMA_LABELS,
    }),
  },
  schema: {
    type: 'object',
    required: ['medicarePlanType'],
    properties: {
      medicarePlanType: radioSchema(SCHEMA_ENUM),
    },
  },
};
