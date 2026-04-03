import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import environment from 'platform/utilities/environment';
import { ConfirmationView } from 'platform/forms-system/src/js/components/ConfirmationView';

export const ConfirmationPage = props => {
  const form = useSelector(state => state.form || {});
  const submission = form?.submission || {};
  const submitDate = submission?.timestamp || '';
  const confirmationNumber =
    submission?.response?.attributes?.confirmationNumber || '';
  const claimId = submission?.response?.id;
  const pdfUrl = claimId
    ? `${
        environment.API_URL
      }/v0/education_benefits_claims/download_pdf/${claimId}`
    : null;

  return (
    <ConfirmationView
      formConfig={props.route?.formConfig}
      submitDate={submitDate}
      confirmationNumber={confirmationNumber}
      pdfUrl={pdfUrl}
    >
      <ConfirmationView.SubmissionAlert
        content={<p>Your submission is in progress.</p>}
        actions={null}
      />
      <ConfirmationView.SavePdfDownload content="If you'd like a PDF copy of your completed form, you can download it." />
      <ConfirmationView.ChapterSectionCollection />
      <ConfirmationView.PrintThisPage />
      <h2>What to expect</h2>
      <p>
        When we receive your form, we will place it in your file. When a 3rd
        party individual inquires on your behalf, we will use your release to
        validate them prior to providing your allowed information.
      </p>
      <ConfirmationView.GoBackLink className="vads-u-margin-bottom--4 vads-u-margin-top--4" />
    </ConfirmationView>
  );
};

ConfirmationPage.propTypes = {
  form: PropTypes.shape({
    data: PropTypes.object,
    formId: PropTypes.string,
    submission: PropTypes.shape({
      timestamp: PropTypes.string,
    }),
  }),
  name: PropTypes.string,
  route: PropTypes.shape({
    formConfig: PropTypes.object,
  }),
};

export default ConfirmationPage;
