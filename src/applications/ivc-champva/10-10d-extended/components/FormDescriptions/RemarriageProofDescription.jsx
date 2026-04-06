import React from 'react';
import FileUploadDescription from './FileUploadDescription';

const RemarriageProofDescription = () => (
  <>
    <p>
      If the applicant remarried after the death of the Veteran, you can help us
      process your application faster by submitting documents showing proof of
      that remarriage.
    </p>
    <p>
      <strong>Upload a copy of one of these documents:</strong>
    </p>
    <ul>
      <li>
        Marriage certificate, <strong>or</strong>
      </li>
      <li>
        A document showing proof of a civil union, <strong>or</strong>
      </li>
      <li>Common-law marriage affidavit</li>
    </ul>
    <p>
      <strong>
        If the remarriage has ended, upload a copy of one of these documents:
      </strong>
    </p>
    <ul>
      <li>
        Divorce decree, <strong>or</strong>
      </li>
      <li>
        Annulment decree, <strong>or</strong>
      </li>
      <li>Death certificate</li>
    </ul>
    <FileUploadDescription allowMultiple />
  </>
);

export default RemarriageProofDescription;
