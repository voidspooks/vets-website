import {
  textSchema as platformTextSchema,
  textUI as platformTextUI,
  textareaUI as platformTextareaUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { validateChars } from '../utils/validations';

/**
 * App-specific textUI that extends platform textUI with automatic character validation.
 *
 * Overrides from platform:
 * - Automatically applies validateChars to block special characters
 * - Extends any provided validations rather than replacing them
 *
 * @param {string | Object} options - Title string or configuration object
 * @param {string} [options.title] - Field title
 * @param {string} [options.hint] - Hint text displayed below the field
 * @param {Array} [options.validations] - Additional validations (validateChars is always appended)
 * @param {Object} [options.errorMessages] - Custom error messages
 * @returns {UISchemaOptions} UI schema with character validation
 *
 * @example
 * // Simple usage with title string
 * provider: textUI('Provider name')
 *
 * @example
 * // With custom validations - validateChars is appended automatically
 * medicareNumber: textUI({
 *   title: 'MBI',
 *   validations: [customValidation]  // Result: [customValidation, validateChars]
 * })
 *
 * @see {@link https://github.com/department-of-veterans-affairs/vets-website/blob/main/src/platform/forms-system/src/js/web-component-patterns/textPatterns.jsx platform textUI}
 */
export const textUI = options => {
  const baseSchema = platformTextUI(options);
  const { validations = [] } = typeof options === 'object' ? options : {};
  return {
    ...baseSchema,
    'ui:validations': [...validations, validateChars],
  };
};

/**
 * App-specific textareaUI that extends platform textareaUI with automatic character validation.
 *
 * Overrides from platform:
 * - Automatically applies character validation to block special characters
 * - Extends any provided validations rather than replacing them
 *
 * @param {string | Object} options - Title string or configuration object
 * @param {string} [options.title] - Field title
 * @param {string} [options.hint] - Hint text displayed below the field
 * @param {boolean} [options.charcount] - Show character counter (use with maxLength in schema)
 * @param {Array} [options.validations] - Additional validations (validateChars is always appended)
 * @param {Object} [options.errorMessages] - Custom error messages
 * @returns {UISchemaOptions} UI schema with character validation
 *
 * @example
 * // Simple usage with title string
 * comments: textareaUI('Additional comments')
 *
 * @example
 * // With character counter
 * notes: textareaUI({
 *   title: 'Notes',
 *   hint: 'Maximum 155 characters',
 *   charcount: true
 * })
 *
 * @see {@link https://github.com/department-of-veterans-affairs/vets-website/blob/main/src/platform/forms-system/src/js/web-component-patterns/textPatterns.jsx platform textareaUI}
 */
export const textareaUI = options => {
  const baseSchema = platformTextareaUI(options);
  const { validations = [] } = typeof options === 'object' ? options : {};
  return {
    ...baseSchema,
    'ui:validations': [...validations, validateChars],
  };
};

/**
 * Standard text field schema (re-exported from platform).
 *
 * @type {SchemaOptions}
 * @see {@link https://github.com/department-of-veterans-affairs/vets-website/blob/main/src/platform/forms-system/src/js/web-component-patterns/textPatterns.jsx platform textSchema}
 */
export const textSchema = platformTextSchema;

/**
 * App-specific textarea schema with 155 character maximum length.
 *
 * Overrides from platform:
 * - Sets maxLength to 155 characters
 *
 * @type {SchemaOptions}
 * @example
 * properties: {
 *   additionalComments: textareaSchema
 * }
 */
export const textareaSchema = { type: 'string', maxLength: 155 };
