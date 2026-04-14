import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { focusElement } from 'platform/utilities/ui';

const ConfirmationScreenView = ({
  alertTitle,
  isTypeNew,
  signerName,
  submitDate,
}) => {
  useEffect(() => focusElement('.success-message'), []);

  return (
    <>
      <div className="success-message vads-u-margin-bottom--4">
        <va-alert status="success">
          <h2
            slot="headline"
            className="vads-u-font-size--h3"
            data-testid="1010d-confirmation-headline"
          >
            {alertTitle}
          </h2>
        </va-alert>
      </div>

      <va-summary-box class="vads-u-margin-bottom--4">
        <h3 slot="headline">Your submission information</h3>

        <h4>What forms you submitted</h4>
        <p>Application for CHAMPVA benefits (VA Form 10-10d)</p>

        {isTypeNew && (
          <div data-testid="1010d-confirmation-new-form">
            <p>
              If you reported Medicare or health insurance, you also submitted:
            </p>
            <p>Other Health Insurance Certification (VA Form 10-7959c)</p>
          </div>
        )}

        <h4>Who submitted this form</h4>
        <p
          className="signer-fullname dd-privacy-mask"
          data-dd-action-name="Signer name"
        >
          {signerName}
        </p>

        {submitDate && (
          <>
            <h4>Date submitted</h4>
            <p
              className="submission-date dd-privacy-mask"
              data-dd-action-name="Submission date"
            >
              {submitDate}
            </p>
          </>
        )}

        <h4>Confirmation for your records</h4>
        <p>You can print this confirmation page for your records.</p>

        <div className="vads-u-margin-top--2">
          <va-button text="Print this page" onClick={() => window.print()} />
        </div>
      </va-summary-box>
    </>
  );
};

ConfirmationScreenView.propTypes = {
  alertTitle: PropTypes.string,
  isTypeNew: PropTypes.bool,
  signerName: PropTypes.string,
  submitDate: PropTypes.string,
};

export default ConfirmationScreenView;
