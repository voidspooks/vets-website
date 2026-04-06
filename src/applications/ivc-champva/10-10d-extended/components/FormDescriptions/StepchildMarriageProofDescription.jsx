import React from 'react';
import FileUploadDescription from './FileUploadDescription';

const StepchildMarriageProofDescription = () => (
  <>
    <p>
      You’ll need to submit a document showing proof of the marriage or legal
      union between the applicant’s Veteran and the applicant’s parent.
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
    <FileUploadDescription />
  </>
);

export default StepchildMarriageProofDescription;
