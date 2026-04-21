import {
  titleUI,
  yesNoUI,
  yesNoSchema,
  currentOrPastDateUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  currentYear,
  parseISODate,
} from 'platform/forms-system/src/js/helpers';
import VaDateField from 'platform/forms-system/src/js/web-component-fields/VaDateField';
import { isValidDate } from 'platform/forms-system/src/js/utilities/validations';
import { applicationInfoFields, FORM_21_4502 } from '../definitions/constants';

const { VETERAN_DISABILITY_COMPENSATION: V } = FORM_21_4502;

const validateDisabilityCompensationDateApplied = (errors, value, formData) => {
  if (formData?.applicationInfo?.veteranDisabilityCompensation !== true) {
    return;
  }

  const { day, month, year } = parseISODate(value);
  const hasAnyDatePart = [day, month, year].some(Boolean);
  const hasCompleteDate = [day, month, year].every(Boolean);

  if (!value || !hasAnyDatePart) {
    errors.addError(V.ERROR_DATE_APPLIED_REQUIRED);
    return;
  }

  if (!hasCompleteDate) {
    errors.addError(V.ERROR_DATE_APPLIED_INCOMPLETE);
    return;
  }

  if (
    Number(year) < 1900 ||
    Number(year) > currentYear ||
    !isValidDate(day, month, year)
  ) {
    errors.addError(V.ERROR_DATE_APPLIED_INVALID);
  }
};

/** @type {PageSchema} */
export default {
  uiSchema: {
    'ui:options': { preserveHiddenData: true },
    ...titleUI(V.TITLE),
    [applicationInfoFields.parentObject]: {
      // 12A: Applied for disability compensation
      [applicationInfoFields.veteranDisabilityCompensation]: yesNoUI({
        title: V.QUESTION_APPLIED,
        labels: V.LABELS,
        required: () => true,
        errorMessages: {
          required: V.ERROR_APPLIED,
        },
      }),
      // 12B: Date you applied for disability compensation
      [applicationInfoFields.appliedDisabilityCompensationDate]: {
        ...currentOrPastDateUI({
          title: V.DATE_APPLIED,
          hint: V.HINT_DATE_APPLIED,
          required: formData =>
            formData?.applicationInfo?.veteranDisabilityCompensation === true,
          errorMessages: {
            pattern: V.ERROR_DATE_APPLIED_INVALID,
            required: V.ERROR_DATE_APPLIED_REQUIRED,
          },
        }),
        'ui:options': {
          hint: V.HINT_DATE_APPLIED,
          hideIf: formData =>
            formData?.applicationInfo?.veteranDisabilityCompensation !== true,
        },
        'ui:webComponentField': VaDateField,
        'ui:errorMessages': {
          pattern: V.ERROR_DATE_APPLIED_INVALID,
          required: V.ERROR_DATE_APPLIED_REQUIRED,
        },
        'ui:validations': [validateDisabilityCompensationDateApplied],
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [applicationInfoFields.parentObject]: {
        type: 'object',
        properties: {
          [applicationInfoFields.veteranDisabilityCompensation]: yesNoSchema,
          [applicationInfoFields.appliedDisabilityCompensationDate]: {
            type: 'string',
          },
        },
        required: [applicationInfoFields.veteranDisabilityCompensation],
      },
    },
  },
};
