// @ts-check
import {
  selectSchema,
  selectUI,
  textSchema,
  textUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { FORM_10_8678 } from '../definitions/constants';
import {
  VHA_MEDICAL_FACILITY_LABELS,
  VHA_MEDICAL_FACILITY_OPTIONS,
} from '../definitions/facilities';

const { VHA_MEDICAL_FACILITY } = FORM_10_8678;

const isOtherFacility = formData =>
  formData?.vhaMedicalFacility === VHA_MEDICAL_FACILITY.OTHER_OPTION;

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI(VHA_MEDICAL_FACILITY.TITLE, VHA_MEDICAL_FACILITY.DESCRIPTION),

    vhaMedicalFacility: selectUI({
      title: VHA_MEDICAL_FACILITY.FIELD_LABEL,
      labels: VHA_MEDICAL_FACILITY_LABELS,
      errorMessages: {
        required: VHA_MEDICAL_FACILITY.FIELD_ERROR,
      },
    }),

    vhaMedicalFacilityOther: {
      ...textUI(VHA_MEDICAL_FACILITY.OTHER_LABEL),
      'ui:options': {
        expandUnder: 'vhaMedicalFacility',
        expandUnderCondition: VHA_MEDICAL_FACILITY.OTHER_OPTION,
        hideIf: formData => !isOtherFacility(formData),
      },
      'ui:required': formData => isOtherFacility(formData),
      'ui:errorMessages': {
        required: VHA_MEDICAL_FACILITY.OTHER_ERROR,
      },
    },
  },

  schema: {
    type: 'object',
    required: ['vhaMedicalFacility'],
    properties: {
      vhaMedicalFacility: selectSchema(VHA_MEDICAL_FACILITY_OPTIONS),
      vhaMedicalFacilityOther: textSchema,
    },
  },
};
