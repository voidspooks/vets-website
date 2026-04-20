import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { VaStatementOfTruth } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import {
  statementOfTruthBodyElement,
  statementOfTruthFullName,
  fullNameReducer,
} from 'platform/forms/components/review/PreSubmitSection';

const STATEMENT_OF_TRUTH = {
  body:
    'I confirm that the identifying information in this form is accurate and has been represented correctly.',
  fullNamePath: 'fullName',
  useProfileFullName: true,
};

export const PreSubmitInfo2 = ({ formData, showError, onSectionComplete }) => {
  const [signature, setSignature] = useState('');
  const [certified, setCertified] = useState(false);
  const [signatureBlurred, setSignatureBlurred] = useState(false);

  const expectedFullName = statementOfTruthFullName(
    formData,
    STATEMENT_OF_TRUTH,
  );

  const signatureMismatch =
    fullNameReducer(signature) !== fullNameReducer(expectedFullName);

  return (
    <VaStatementOfTruth
      heading="Certification and Signature"
      inputLabel="Your full name"
      inputValue={signature}
      inputMessageAriaDescribedby={`Statement of truth: ${STATEMENT_OF_TRUTH.messageAriaDescribedby ||
        ''}`}
      inputError={
        (showError || signatureBlurred) && signatureMismatch
          ? `Please enter your name exactly as it appears on your application: ${expectedFullName}`
          : undefined
      }
      checked={certified}
      onVaInputChange={event => setSignature(event.detail.value)}
      onVaInputBlur={() => setSignatureBlurred(true)}
      onVaCheckboxChange={event => {
        setCertified(event.detail.checked);
        onSectionComplete(event.detail.checked);
      }}
      checkboxError={
        showError && !certified
          ? 'You must certify by checking the box'
          : undefined
      }
    >
      {statementOfTruthBodyElement(formData, STATEMENT_OF_TRUTH.body)}
    </VaStatementOfTruth>
  );
};

PreSubmitInfo2.propTypes = {
  formData: PropTypes.object,
  onSectionComplete: PropTypes.func,
  showError: PropTypes.bool,
};
