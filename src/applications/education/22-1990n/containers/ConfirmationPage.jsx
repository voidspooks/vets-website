import React from 'react';
import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';

import { ConfirmationView } from 'platform/forms-system/src/js/components/ConfirmationView';

export const ConfirmationPage = ({ route }) => {
  const form = useSelector(state => state.form || {});
  const submission = form?.submission || {};
  const submitDate = submission?.timestamp || '';
  const confirmationNumber =
    submission?.response?.confirmationNumber ||
    submission?.response?.attributes?.confirmationNumber ||
    '';

  const firstName =
    form?.data?.personalInformation?.applicantFirstName || '';
  const lastName =
    form?.data?.personalInformation?.applicantLastName || '';

  const submitterName =
    firstName && lastName ? { first: firstName, last: lastName } : undefined;

  const submissionAlertContent = (
    <>
      <p>
        We've received your application for education benefits under the
        National Call to Service program. We'll review your application and
        notify you of our decision.
      </p>
      {confirmationNumber && (
        <p>
          Your confirmation number is{' '}
          <strong>{confirmationNumber}</strong>. Save or print this page
          for your records.
        </p>
      )}
    </>
  );

  return (
    <ConfirmationView
      formConfig={route?.formConfig}
      submitDate={submitDate}
      confirmationNumber={confirmationNumber}
      submitterName={submitterName}
      devOnly={{ showButtons: true }}
    >
      <ConfirmationView.SubmissionAlert
        title="Your application has been submitted"
        content={submissionAlertContent}
        actions={<p />}
      />
      <div data-dd-privacy="mask" data-dd-action-name="confirmation summary">
        <ConfirmationView.ChapterSectionCollection />
      </div>
      <ConfirmationView.WhatsNextProcessList
        item1Header="VA will review your application"
        item1Content="VA will review your application and verify your eligibility under the National Call to Service program."
        item1Actions={<p />}
        item2Header="VA will notify you of its decision"
        item2Content="VA will notify you of its decision concerning your eligibility for education benefits."
        item2Actions={<p />}
        item3Header="If approved, VA will issue a Certificate of Eligibility"
        item3Content="If you are found eligible, VA will issue a Certificate of Eligibility (COE). Provide this to the veterans certifying official at your school or training establishment."
        item3Actions={<p />}
      />
      <ConfirmationView.PrintThisPage />
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