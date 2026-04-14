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
 * Builds a configured file upload UI component for submitting a single supporting document.
 *
 * @param {Object} [options={}] - Configuration options.
 * @param {string} [options.label=''] - Optional label displayed for the upload field.
 * @param {string} [options.attachmentId=''] - Optional attachment identifier sent with the upload payload.
 * @param {boolean} [options.withMetadata=false] - Optional attachment identifier sent with the upload payload.
 * @returns {Object} A `fileUploadUI` configuration object.
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

export const attachmentSchema = Object.freeze({
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
    },
  },
});

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
