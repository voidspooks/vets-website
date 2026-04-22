import {
  addressSchema as platformAddressSchema,
  addressUI as platformAddressUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import AddressSelectionField from '../components/FormFields/AddressSelectionField';
import AddressSelectionReviewField from '../components/FormReview/AddressSelectionReviewField';
import content from '../locales/en/content.json';
import { validateChars } from '../utils/validations';

/**
 * Custom address selection field UI for choosing between previously entered addresses.
 *
 * @param {Object} options - Configuration options
 * @param {string} options.title - The field title
 * @param {Object} [options.uiOptions] - Additional UI options to pass through
 * @returns {UISchemaOptions} UI schema configuration
 */
export const addressSelectionUI = ({ title, ...uiOptions }) => ({
  'ui:title': title,
  'ui:webComponentField': AddressSelectionField,
  'ui:reviewField': AddressSelectionReviewField,
  'ui:options': uiOptions,
});

/**
 * App-specific addressUI that extends platform addressUI with automatic defaults.
 *
 * Overrides from platform:
 * - Automatically applies character validation to street, street2, and city fields
 * - Sets default military checkbox label from content.json
 * - Extends any provided validations rather than replacing them
 *
 * @param {Object} [options={}] - Configuration options (same as platform addressUI)
 * @param {Object} [options.labels] - Custom labels; militaryCheckbox defaults to content value
 * @param {Array|Object} [options.validations] - Additional validations (array for all fields or object for field-specific)
 * @param {Array} [options.omit] - Fields to omit from address
 * @returns {UISchemaOptions} UI schema with character validation and default labels
 *
 * @example
 * // Uses default military checkbox label and character validation
 * sponsorAddress: addressUI()
 *
 * @example
 * // Override the military checkbox label
 * customAddress: addressUI({
 *   labels: { militaryCheckbox: 'Custom label' }
 * })
 *
 * @example
 * // Add additional validations
 * addressUI({ validations: [customValidation] })
 *
 * @see {@link https://github.com/department-of-veterans-affairs/vets-website/blob/main/src/platform/forms-system/src/js/web-component-patterns/addressPattern.jsx platform addressUI}
 */
export const addressUI = (options = {}) => {
  const labels = {
    militaryCheckbox: content['mailing-address--checkbox-label'],
    ...options.labels,
  };
  const baseSchema = platformAddressUI({ ...options, labels });

  const addressCharValidation = (errors, fieldData) => {
    ['street', 'street2', 'city'].forEach(key => {
      const value = fieldData?.[key];
      if (typeof value === 'string') {
        const fieldErrors = { addError: msg => errors[key]?.addError(msg) };
        validateChars(fieldErrors, value);
      }
    });
  };

  return {
    ...baseSchema,
    'ui:validations': [
      ...(baseSchema['ui:validations'] ?? []),
      addressCharValidation,
    ],
  };
};

/**
 * App-specific addressSchema that extends platform addressSchema with automatic defaults.
 *
 * Overrides from platform:
 * - Automatically omits street3 field
 * - Additional fields can still be omitted via options
 *
 * @param {Object} [options={}] - Configuration options (same as platform addressSchema)
 * @param {Array} [options.omit] - Additional fields to omit (street3 is always omitted)
 * @returns {SchemaOptions} Address schema with street3 omitted
 *
 * @example
 * // Omits street3 by default
 * applicantAddress: addressSchema()
 *
 * @example
 * // Omit additional fields
 * addressSchema({ omit: ['street2'] }) // Omits both street3 and street2
 *
 * @see {@link https://github.com/department-of-veterans-affairs/vets-website/blob/main/src/platform/forms-system/src/js/web-component-patterns/addressPattern.jsx platform addressSchema}
 */
export const addressSchema = (options = {}) => {
  const omit = ['street3', ...(options.omit ?? [])];
  return platformAddressSchema({ ...options, omit });
};
