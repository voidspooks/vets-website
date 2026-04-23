import environment from '@department-of-veterans-affairs/platform-utilities/environment';
/* eslint-disable camelcase */

export const UPLOAD_DESTINATION_KEYS = {
  BENEFITS_CLAIMS: 'benefits_claims',
  IVC_CHAMPVA_SUPPORTING_DOCS: 'ivc_champva_supporting_documents',
};

export const FINALIZE_DESTINATION_KEYS = {
  IVC_CHAMPVA_DOCS_ONLY_RESUBMISSION: 'ivc_champva_docs_only_resubmission',
};

const ALLOWED_DESTINATIONS = {
  [UPLOAD_DESTINATION_KEYS.BENEFITS_CLAIMS]: {
    endpoint: ({ claimId }) =>
      `${environment.API_URL}/v0/benefits_claims/${claimId}/benefits_documents`,
    // API contracts use snake_case keys in multipart params.
    // eslint-disable-next-line camelcase
    buildUploadParams: ({ trackedItemId, fileMeta }) => ({
      tracked_item_ids: JSON.stringify([trackedItemId]),
      document_type: fileMeta?.docType?.value,
      password: fileMeta?.password?.value,
    }),
  },
  [UPLOAD_DESTINATION_KEYS.IVC_CHAMPVA_SUPPORTING_DOCS]: {
    endpoint: () =>
      `${environment.API_URL}/ivc_champva/v1/forms/submit_supporting_documents`,
    // API contracts use snake_case keys in multipart params.
    // eslint-disable-next-line camelcase
    buildUploadParams: ({ claimId, fileMeta, uploadMetadata }) => ({
      claim_id: claimId,
      form_id: uploadMetadata?.formId,
      attachment_id:
        fileMeta?.attachmentId?.value ||
        fileMeta?.attachmentId ||
        uploadMetadata?.attachmentId,
      password: fileMeta?.password?.value,
    }),
  },
};

const FINALIZE_DESTINATIONS = {
  [FINALIZE_DESTINATION_KEYS.IVC_CHAMPVA_DOCS_ONLY_RESUBMISSION]: {
    endpoint: () =>
      `${environment.API_URL}/ivc_champva/v1/forms/docs_only_resubmission`,
    // API contracts use snake_case keys in JSON body.
    // eslint-disable-next-line camelcase
    buildRequestBody: ({ claimId, uploadMetadata, uploadedFiles }) => ({
      claim_id: claimId,
      form_number: uploadMetadata?.formId || '10-10D-EXTENDED',
      submission_type: uploadMetadata?.submissionType || 'existing',
      supporting_docs: uploadedFiles.map(file => ({
        name: file.name,
        confirmation_code: file.confirmationCode,
        attachment_id: file.attachmentId,
        is_encrypted: false,
      })),
    }),
  },
};

const DEFAULT_DESTINATION_KEY = UPLOAD_DESTINATION_KEYS.BENEFITS_CLAIMS;

function compactObject(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function resolveUploadDestinationConfig({
  claimId,
  trackedItemId,
  uploadMetadata = {},
}) {
  const requestedKey = uploadMetadata?.uploadDestinationKey;
  const destinationKey = ALLOWED_DESTINATIONS[requestedKey]
    ? requestedKey
    : DEFAULT_DESTINATION_KEY;
  const destination = ALLOWED_DESTINATIONS[destinationKey];

  return {
    destinationKey,
    endpoint: destination.endpoint({ claimId, trackedItemId, uploadMetadata }),
    buildUploadParams: fileMeta =>
      compactObject(
        destination.buildUploadParams({
          claimId,
          trackedItemId,
          uploadMetadata,
          fileMeta,
        }),
      ),
  };
}

export function resolveFinalizeDestinationConfig({
  claimId,
  uploadMetadata = {},
  uploadedFiles = [],
}) {
  const requestedKey = uploadMetadata?.finalizeDestinationKey;
  const destination = FINALIZE_DESTINATIONS[requestedKey];
  if (!destination || uploadedFiles.length === 0) {
    return null;
  }

  return {
    destinationKey: requestedKey,
    endpoint: destination.endpoint({ claimId, uploadMetadata }),
    requestBody: destination.buildRequestBody({
      claimId,
      uploadMetadata,
      uploadedFiles,
    }),
  };
}
/* eslint-enable camelcase */
