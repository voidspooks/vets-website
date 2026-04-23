import { expect } from 'chai';
/* eslint-disable camelcase */

import {
  resolveUploadDestinationConfig,
  resolveFinalizeDestinationConfig,
  UPLOAD_DESTINATION_KEYS,
  FINALIZE_DESTINATION_KEYS,
} from '../../utils/uploadDestinationConfig';

describe('uploadDestinationConfig', () => {
  it('uses benefits claims destination by default', () => {
    const config = resolveUploadDestinationConfig({
      claimId: 123,
      trackedItemId: 456,
    });

    expect(config.destinationKey).to.equal(
      UPLOAD_DESTINATION_KEYS.BENEFITS_CLAIMS,
    );
    expect(config.endpoint).to.contain(
      '/v0/benefits_claims/123/benefits_documents',
    );
    expect(
      config.buildUploadParams({
        docType: { value: 'L149' },
        password: { value: 'secret' },
      }),
    ).to.deep.equal({
      tracked_item_ids: '[456]',
      document_type: 'L149',
      password: 'secret',
    });
  });

  it('falls back to benefits claims when destination key is unsupported', () => {
    const config = resolveUploadDestinationConfig({
      claimId: 123,
      trackedItemId: 456,
      uploadMetadata: { uploadDestinationKey: 'unknown_destination' },
    });

    expect(config.destinationKey).to.equal(
      UPLOAD_DESTINATION_KEYS.BENEFITS_CLAIMS,
    );
    expect(config.endpoint).to.contain(
      '/v0/benefits_claims/123/benefits_documents',
    );
  });

  it('uses CHAMPVA destination when metadata requests it', () => {
    const config = resolveUploadDestinationConfig({
      claimId: 123,
      trackedItemId: 456,
      uploadMetadata: {
        uploadDestinationKey:
          UPLOAD_DESTINATION_KEYS.IVC_CHAMPVA_SUPPORTING_DOCS,
        formId: '10-10D-EXTENDED',
      },
    });

    expect(config.destinationKey).to.equal(
      UPLOAD_DESTINATION_KEYS.IVC_CHAMPVA_SUPPORTING_DOCS,
    );
    expect(config.endpoint).to.contain(
      '/ivc_champva/v1/forms/submit_supporting_documents',
    );
    expect(
      config.buildUploadParams({
        password: { value: 'pdf-pass' },
        attachmentId: { value: 'doc1' },
      }),
    ).to.deep.equal({
      claim_id: 123,
      form_id: '10-10D-EXTENDED',
      attachment_id: 'doc1',
      password: 'pdf-pass',
    });
  });

  it('builds docs-only finalize request config for CHAMPVA when requested', () => {
    const config = resolveFinalizeDestinationConfig({
      claimId: 'claim-uuid-123',
      uploadMetadata: {
        finalizeDestinationKey:
          FINALIZE_DESTINATION_KEYS.IVC_CHAMPVA_DOCS_ONLY_RESUBMISSION,
        formId: '10-10D-EXTENDED',
        submissionType: 'existing',
      },
      uploadedFiles: [
        {
          confirmationCode: 'abc-123',
          name: 'birth-certificate.png',
          attachmentId: 'Birth certificate',
        },
      ],
    });

    expect(config.destinationKey).to.equal(
      FINALIZE_DESTINATION_KEYS.IVC_CHAMPVA_DOCS_ONLY_RESUBMISSION,
    );
    expect(config.endpoint).to.contain(
      '/ivc_champva/v1/forms/docs_only_resubmission',
    );
    expect(config.requestBody).to.deep.equal({
      claim_id: 'claim-uuid-123',
      form_number: '10-10D-EXTENDED',
      submission_type: 'existing',
      supporting_docs: [
        {
          name: 'birth-certificate.png',
          confirmation_code: 'abc-123',
          attachment_id: 'Birth certificate',
          is_encrypted: false,
        },
      ],
    });
  });
});
/* eslint-enable camelcase */
