import VaMemorableDateField from 'platform/forms-system/src/js/web-component-fields/VaMemorableDateField';
import DateReviewField from '../components/FormReview/DateReviewField';
import { validateFutureDate } from '../utils/validations';
import { commonDefinitions } from '../utils/imports';
import content from '../locales/en/content.json';

const INPUT_LABEL = content['dates--default-label'];
const ERR_MSG_PATTERN = content['validation--date-pattern'];
const ERR_MSG_REQUIRED = content['validation--required'];

/**
 * Memorable date field UI with future date validation.
 *
 * Validates dates to ensure they are not more than 1 year in the future.
 * Uses VaMemorableDateField component for consistent date input.
 *
 * @param {string | Object} options - Title string or configuration object
 * @param {string} [options.title] - Field title (defaults to content value)
 * @param {boolean} [options.required] - Whether the field is required
 * @param {Array} [options.validations] - Custom validations (defaults to [validateFutureDate])
 * @param {Object} [options.errorMessages] - Custom error messages
 * @param {string} [options.errorMessages.pattern] - Pattern validation error message
 * @param {string} [options.errorMessages.required] - Required field error message
 * @returns {UISchemaOptions} UI schema with future date validation
 *
 * @example
 * // Simple usage with title string
 * expectedDate: futureDateUI('Expected completion date')
 *
 * @example
 * // With custom options
 * startDate: futureDateUI({
 *   title: 'Program start date',
 *   required: true,
 *   errorMessages: { required: 'Enter a start date' }
 * })
 */
export const futureDateUI = options => {
  const { title, errorMessages, required, validations, ...uiOptions } =
    typeof options === 'object' ? options : { title: options };
  return {
    'ui:title': title ?? INPUT_LABEL,
    'ui:webComponentField': VaMemorableDateField,
    'ui:required': required,
    'ui:validations': validations ?? [validateFutureDate],
    'ui:errorMessages': {
      pattern: errorMessages?.pattern || ERR_MSG_PATTERN,
      required: errorMessages?.required || ERR_MSG_REQUIRED,
    },
    'ui:options': { ...uiOptions },
    'ui:reviewField': DateReviewField,
  };
};
export const futureDateSchema = commonDefinitions.date;
