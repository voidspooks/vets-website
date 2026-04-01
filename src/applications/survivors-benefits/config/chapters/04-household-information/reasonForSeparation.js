import {
  radioSchema,
  radioUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { separationReasonOptions } from '../../../utils/labels';

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI('Reason for living apart'),
    separationDueToAssignedReasons: radioUI({
      title: 'What was the reason you lived separately?',
      labels: separationReasonOptions,
    }),
  },
  schema: {
    type: 'object',
    required: ['separationDueToAssignedReasons'],
    properties: {
      separationDueToAssignedReasons: radioSchema(
        Object.keys(separationReasonOptions),
      ),
    },
  },
};
