import React from 'react';
import FileUploadDescription from './FileUploadDescription';
import { APP_URLS } from '../../utils/appUrls';

export const SupplementalDocTypeDescription = () => (
  <>
    <p>
      You’ll need to submit any requested or updated supporting documents here.
    </p>
    <p>This could include any of these common documents:</p>
    <ul>
      <li>School enrollment certification letter</li>
      <li>Marriage certificate or certificate of civil union</li>
      <li>Divorce decree</li>
      <li>Court-ordered adoption papers</li>
      <li>Birth certificates of dependents</li>
    </ul>
  </>
);

export const SupplementalDocsDescription = () => (
  <>
    <p>
      <strong>
        If you need to update your other, non-VA health insurance information
      </strong>
      , you’ll need to submit another form.
    </p>
    <p>
      <va-link
        href={APP_URLS.ohi}
        text="Submit other health insurance information"
        external
      />
    </p>
    <FileUploadDescription />
  </>
);
