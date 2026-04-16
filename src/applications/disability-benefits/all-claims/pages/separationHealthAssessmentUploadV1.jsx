/**
 * @file V1 fallback for the Separation Health Assessment Upload page.
 *
 * Uses the legacy FileField upload component instead of `va-file-input-multiple`.
 * Shown when the evidence enhancement toggle is ON but the FileInputV3 toggle
 * is OFF. Once FileInputV3 is fully rolled out, this page can be removed.
 */

import React, { useEffect } from 'react';
import fileUploadUI from 'platform/forms-system/src/js/definitions/file';
import environment from '@department-of-veterans-affairs/platform-utilities/environment';

import { isUploadingBddSha } from '../utils';
import { createPayload } from '../utils/fileInputComponent/fileInputMultiUIConfig';
import {
  MAX_FILE_SIZE_MB,
  MAX_PDF_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
  MAX_PDF_FILE_SIZE_BYTES,
} from '../constants';
import { trackShaPageSeen } from '../utils/tracking/bddShaRumTracking';

const MAXIMUM_NUMBER_OF_FILES = 20;

/**
 * Custom parseResponse that does NOT include attachmentId in form data.
 * This prevents the file-type dropdown from rendering in the UI.
 * The attachmentId will be added at submit time in the transformer.
 */
const parseShaResponse = (response, file) => ({
  name: file?.name,
  confirmationCode: response?.data?.attributes?.guid,
  // Note: attachmentId intentionally omitted from form data to prevent UI dropdown
});

const fileUploadUi = fileUploadUI(
  'Upload your Separation Health Assessment (self-assessment, also called "Part A") to support your claim.',
  {
    itemDescription: '',
    hideLabelText: false,
    fileUploadUrl: `${environment.API_URL}/v0/upload_supporting_evidence`,
    buttonText: 'Upload file',
    addAnotherLabel: 'Add another file',
    fileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    maxSize: MAX_FILE_SIZE_BYTES,
    maxPdfSize: MAX_PDF_FILE_SIZE_BYTES,
    minSize: 1,
    createPayload,
    parseResponse: parseShaResponse,
  },
);

/**
 * Tracks that the SHA upload page has been seen.
 * Rendered as part of ui:description so it fires on page mount.
 */
const ShaUploadDescription = () => {
  useEffect(() => {
    trackShaPageSeen('upload');
  }, []);

  return (
    <div>
      <p>
        You can upload your file in a .pdf, .jpg, .jpeg, or .png format. You’ll
        first need to scan a copy of your file onto your computer or mobile
        phone. You can then upload the file from there.
      </p>
      <p>Guidelines for uploading a file:</p>
      <ul>
        <li>File types you can upload: .pdf, .jpg, .jpeg, or .png</li>
        <li>Maximum number of files: {MAXIMUM_NUMBER_OF_FILES}</li>
        <li>{`Maximum non-PDF file size: ${MAX_FILE_SIZE_MB}MB`}</li>
        <li>{`Maximum PDF file size: ${MAX_PDF_FILE_SIZE_MB}MB`}</li>
      </ul>
      <p>
        A 1MB file equals about 500 pages of text. A photo is usually about 6MB.
        Large files can take longer to upload with a slow internet connection.
      </p>
    </div>
  );
};

export const uiSchema = {
  'view:separationHealthAssessmentUploadTitle': {
    'ui:title': (
      <h3 className="vads-u-margin-y--0 vads-u-color--base">
        Upload your Separation Health Assessment
      </h3>
    ),
  },
  separationHealthAssessmentUploads: {
    ...fileUploadUi,

    'ui:options': {
      ...fileUploadUi['ui:options'],
      fileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    },
    // Utilizing custom JSX instead of FileUploadDescriptions component because file type and max file size +
    // requirements are specific to supporting future upload validation efforts and this V1 version of upload is a
    // temporary holdover.
    'ui:description': <ShaUploadDescription />,
    'ui:confirmationField': ({ formData }) => ({
      data: formData?.map(item => item.name || item.fileName),
      label: 'Uploaded file(s)',
    }),
    'ui:required': data => isUploadingBddSha(data),
  },
};

export const schema = {
  type: 'object',
  properties: {
    'view:separationHealthAssessmentUploadTitle': {
      type: 'object',
      properties: {},
    },
    separationHealthAssessmentUploads: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
          },
          confirmationCode: {
            type: 'string',
          },
        },
      },
      minItems: 1,
      maxItems: MAXIMUM_NUMBER_OF_FILES,
    },
  },
};
