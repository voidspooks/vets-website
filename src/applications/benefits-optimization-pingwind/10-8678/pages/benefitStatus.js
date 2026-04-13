// @ts-check
import {
  radioSchema,
  radioUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { FORM_10_8678 } from '../definitions/constants';

const { BENEFIT_STATUS } = FORM_10_8678;

const BENEFIT_STATUS_OPTIONS = {
  terminate: BENEFIT_STATUS.TERMINATE_OPTION,
  continue: BENEFIT_STATUS.CONTINUE_OPTION,
};

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI(BENEFIT_STATUS.TITLE, BENEFIT_STATUS.DESCRIPTION),
    electTermination: radioUI({
      title: BENEFIT_STATUS.QUESTION.label,
      description: BENEFIT_STATUS.QUESTION.body,
      labels: BENEFIT_STATUS_OPTIONS,
      errorMessages: {
        required: BENEFIT_STATUS.ERROR_MESSAGE,
      },
    }),
  },
  schema: {
    type: 'object',
    required: ['electTermination'],
    properties: {
      electTermination: radioSchema(Object.keys(BENEFIT_STATUS_OPTIONS)),
    },
  },
};
