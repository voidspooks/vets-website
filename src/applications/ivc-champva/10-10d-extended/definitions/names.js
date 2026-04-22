import { merge } from 'lodash';
import {
  fullNameSchema as platformFullNameSchema,
  fullNameUI as platformFullNameUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../locales/en/content.json';
import { validateChars } from '../utils/validations';

const MIDDLE_NAME_SCHEMA = { type: 'string', maxLength: 1 };

/**
 * App-specific fullNameUI that extends platform fullNameUI with automatic defaults.
 *
 * Overrides from platform:
 * - Replaces validateNameSymbols with validateChars for unified character validation
 * - Sets middle name field title to "Middle initial"
 * - Applies character validation to first, middle, and last name fields
 *
 * @param {(title: string) => string} [formatTitle] - Optional function to format field titles
 * @param {Object} [uiOptions={}] - Additional UI options to apply to all fields
 * @returns {UISchemaOptions} UI schema with character validation and middle initial label
 *
 * @example
 * // Simple usage with default labels
 * sponsorName: fullNameUI()
 *
 * @example
 * // With custom title formatter
 * applicantName: fullNameUI((title) => `Applicant's ${title}`)
 *
 * @see {@link https://github.com/department-of-veterans-affairs/vets-website/blob/main/src/platform/forms-system/src/js/web-component-patterns/fullNamePattern.js platform fullNameUI}
 */
export const fullNameUI = (formatTitle, uiOptions = {}) => {
  const baseSchema = platformFullNameUI(formatTitle, uiOptions);
  return merge({}, baseSchema, {
    first: { 'ui:validations': [validateChars] },
    middle: {
      'ui:title': content['form-label--middle-initial'],
      'ui:validations': [validateChars],
    },
    last: { 'ui:validations': [validateChars] },
  });
};

/**
 * App-specific fullNameSchema that extends platform fullNameSchema with automatic defaults.
 *
 * Overrides from platform:
 * - Limits middle name to 1 character maximum (middle initial only)
 *
 * @returns {SchemaOptions} Full name schema with middle initial constraint
 *
 * @example
 * // Use in schema definition
 * properties: {
 *   sponsorName: fullNameSchema
 * }
 *
 * @see {@link https://github.com/department-of-veterans-affairs/vets-website/blob/main/src/platform/forms-system/src/js/web-component-patterns/fullNamePattern.js platform fullNameSchema}
 */
export const fullNameSchema = merge({}, platformFullNameSchema, {
  properties: { middle: MIDDLE_NAME_SCHEMA },
});
