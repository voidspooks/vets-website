import React from 'react';
import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';
import { ConfirmationView } from 'platform/forms-system/src/js/components/ConfirmationView';
import { confirmationPageText, claimantFields } from '../definitions/constants';

const alertContent = confirmationNumber => (
  <>
    <p>{confirmationPageText.thankYou}</p>
    <p>{confirmationPageText.nextStep}</p>
    <p>
      {confirmationPageText.confirmationPrefix} {confirmationNumber}.
    </p>
  </>
);

export const ConfirmationPage = props => {
  const form = useSelector(state => state.form || {});
  const { submission = {}, data = {} } = form;
  const claimant = data[claimantFields.parentObject] || {};
  const submitterName =
    claimant?.fullName?.first && claimant?.fullName?.last
      ? claimant.fullName
      : null;
  const submitDate = submission.timestamp;
  const confirmationNumber = submission.response?.confirmationNumber;
  const pdfUrl = submission.response?.pdfUrl;

  return (
    <ConfirmationView
      formConfig={props.route?.formConfig}
      submitDate={submitDate}
      confirmationNumber={confirmationNumber}
      submitterName={submitterName}
      pdfUrl={pdfUrl}
      devOnly={{ showButtons: true }}
    >
      <ConfirmationView.SubmissionAlert
        content={alertContent(confirmationNumber)}
      />
      <ConfirmationView.SavePdfDownload />
      <ConfirmationView.ChapterSectionCollection />
      <ConfirmationView.PrintThisPage />
      <ConfirmationView.WhatsNextProcessList />
      <ConfirmationView.HowToContact />
      <ConfirmationView.GoBackLink />
      <ConfirmationView.NeedHelp />
    </ConfirmationView>
  );
};

ConfirmationPage.propTypes = {
  route: PropTypes.shape({
    formConfig: PropTypes.object,
  }),
};

function mapStateToProps(state) {
  return {
    form: state.form,
  };
}

export default connect(mapStateToProps)(ConfirmationPage);
