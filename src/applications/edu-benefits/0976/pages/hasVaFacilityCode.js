// @ts-check
import {
  yesNoSchema,
  yesNoUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI('Institution VA Facility Code'),
    hasVaFacilityCode: yesNoUI({
      title: 'Does your institution have a VA Facility Code?',
      hint:
        'A VA Facility Code is 8 characters in length and assigned to institutions with programs approved by VA.',
      errorMessages: {
        required: 'Select ‘yes’ if your institution has a VA Facility Code',
      },
    }),
  },
  schema: {
    type: 'object',
    properties: {
      hasVaFacilityCode: yesNoSchema,
    },
    required: ['hasVaFacilityCode'],
  },
};
