import fileUploadUI from 'platform/forms-system/src/js/definitions/file';
import VaSelectField from 'platform/forms-system/src/js/web-component-fields/VaSelectField';
import environment from 'platform/utilities/environment';
import content from '../locales/en/content.json';
import { FILE_TYPES_ACCEPTED } from '../utils/constants';
import { replaceStrValues } from '../utils/helpers';

const BUTTON_TEXT = content['attachments--button-text'];
const HINT_TEXT = content['attachments--hint-text'];
const SCHEMA_TITLE = content['attachments--schema-title'];
const SCHEMA_LABEL = content['attachments--schema-label'];

const API_ENDPOINT = 'ivc_champva/v1/forms/submit_supporting_documents';
const FILE_UPLOAD_URL = `${environment.API_URL}/${API_ENDPOINT}`;

/**
 * Builds a configured file upload UI component for submitting supporting documents.
 *
 * Handles file uploads to the CHAMPVA supporting documents API endpoint with
 * automatic payload construction and response parsing. Optionally supports
 * attachment metadata selection via dropdown.
 *
 * @param {Object} [options={}] - Configuration options
 * @param {string} [options.label=''] - Label displayed for the upload field (hidden if empty)
 * @param {string} [options.attachmentId=''] - Attachment identifier sent with upload payload
 * @param {boolean} [options.withMetadata=false] - Enables attachment type selection dropdown
 * @returns {Object} fileUploadUI configuration object
 *
 * @example
 * // Simple upload without label
 * birthCertificate: attachmentUI()
 *
 * @example
 * // Upload with custom label
 * proofOfMarriage: attachmentUI({
 *   label: 'Upload marriage certificate'
 * })
 *
 * @example
 * // Upload with attachment ID for tracking
 * medicareCard: attachmentUI({
 *   attachmentId: 'medicare_card_front'
 * })
 *
 * @example
 * // Upload with metadata selection dropdown
 * supportingDocs: attachmentUI({
 *   withMetadata: true,
 *   label: 'Upload supporting documents'
 * })
 */
export const attachmentUI = ({
  label = '',
  attachmentId = '',
  withMetadata = false,
} = {}) => {
  const createPayload = (file, formId, password) => {
    const payload = new FormData();
    payload.append('file', file);
    payload.append('form_id', formId);
    if (attachmentId) payload.append('attachment_id', attachmentId);
    if (password) payload.append('password', password);
    return payload;
  };

  const parseResponse = (res, file) => ({
    name: file.name,
    confirmationCode: res.data.attributes.confirmationCode,
    attachmentId,
  });

  return fileUploadUI(label, {
    fileUploadUrl: FILE_UPLOAD_URL,
    fileTypes: FILE_TYPES_ACCEPTED,
    buttonText: BUTTON_TEXT,
    hideLabelText: !label,
    'ui:hint': HINT_TEXT,
    createPayload,
    parseResponse,
    uswds: true,
    ...(withMetadata && {
      attachmentSchema: ({ fileName }) => ({
        'ui:title': SCHEMA_TITLE,
        'ui:webComponentField': VaSelectField,
        'ui:disabled': false,
        'ui:options': {
          messageAriaDescribedby: replaceStrValues(SCHEMA_LABEL, fileName),
        },
      }),
    }),
  });
};

/**
 * Basic attachment array schema for file uploads.
 *
 * Stores uploaded file metadata including name and confirmation code.
 * Use with attachmentUI when no minimum file requirement exists.
 *
 * @type {SchemaOptions}
 * @example
 * properties: {
 *   optionalDocuments: attachmentSchema
 * }
 */
export const attachmentSchema = Object.freeze({
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
    },
  },
});

/**
 * Attachment array schema with metadata selection and minimum items requirement.
 *
 * Requires users to categorize each uploaded file using a dropdown.
 * Use with attachmentUI({ withMetadata: true }) to enable the selection UI.
 *
 * @param {Object} [options={}] - Configuration options
 * @param {string[]} [options.enumNames=[]] - Available attachment type options for dropdown
 * @param {number} [options.minItems=1] - Minimum number of required attachments
 * @returns {SchemaOptions} Schema with attachment metadata requirements
 *
 * @example
 * properties: {
 *   supportingDocuments: attachmentWithMetadataSchema({
 *     enumNames: ['Birth Certificate', 'Marriage License', 'School Enrollment'],
 *     minItems: 1
 *   })
 * }
 */
export const attachmentWithMetadataSchema = ({
  enumNames = [],
  minItems = 1,
} = {}) => {
  const enumValues = [
    ...new Set(
      (Array.isArray(enumNames) ? enumNames : [])
        .map(opt => opt?.trim())
        .filter(Boolean),
    ),
  ];

  const safeMin =
    Number.isFinite(minItems) && minItems >= 0 ? Math.floor(minItems) : 1;

  const itemSchema = {
    type: 'object',
    required: ['attachmentId', 'name'],
    properties: {
      name: { type: 'string' },
      attachmentId: {
        type: 'string',
        enum: enumValues,
        enumNames: enumValues,
      },
    },
  };

  return Object.freeze({
    type: 'array',
    minItems: safeMin,
    items: [itemSchema],
    additionalItems: itemSchema,
  });
};

/**
 * Attachment schema that requires exactly one file upload.
 *
 * Enforces a single required file upload with both minimum and maximum of 1.
 * Use for required documents where only one file is needed.
 *
 * @type {SchemaOptions}
 * @example
 * properties: {
 *   birthCertificate: singleAttachmentSchema
 * }
 * required: ['birthCertificate']
 */
export const singleAttachmentSchema = Object.freeze({
  type: 'array',
  minItems: 1,
  maxItems: 1,
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
    },
  },
});
