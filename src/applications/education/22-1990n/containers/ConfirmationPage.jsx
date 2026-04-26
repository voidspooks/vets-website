import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { ConfirmationView } from 'platform/forms-system/src/js/components/ConfirmationView';

export const ConfirmationPage = ({ route }) => {
  const form = useSelector(state => state.form || {});
  const submission = form?.submission || {};
  const submitDate = submission?.timestamp || '';
  const confirmationNumber =
    submission?.response?.confirmationNumber || '';

  const veteranName = form?.data?.veteranFullName || {};

  const submissionAlertContent = (
    <>
      <p>
        We&apos;ve received your application for education benefits under the
        National Call to Service program. We&apos;ll review your application and
        contact you if we need more information.
      </p>
      {confirmationNumber && (
        <p>
          Your confirmation number is{' '}
          <strong id="confirmation-number">{confirmationNumber}</strong>.
        </p>
      )}
    </>
  );

  return (
    <ConfirmationView
      formConfig={route?.formConfig}
      submitDate={submitDate}
      confirmationNumber={confirmationNumber}
      submitterName={veteranName}
      devOnly={{ showButtons: true }}
    >
      <ConfirmationView.SubmissionAlert
        title="You've submitted your NCS education benefits application"
        content={submissionAlertContent}
        actions={<p />}
      />
      <div data-dd-privacy="mask" data-dd-action-name="confirmation summary">
        <ConfirmationView.ChapterSectionCollection />
      </div>
      <ConfirmationView.PrintThisPage />
      <ConfirmationView.WhatsNextProcessList
        item1Header="VA processes your application"
        item1Content="We'll review your application and the documents you submitted. Processing times vary."
        item1Actions={<p />}
        item2Header="Certificate of Eligibility issued if eligible"
        item2Content="If you're eligible, we'll send you a Certificate of Eligibility (COE). Present your COE to your school's Veterans Certifying Official."
        item2Actions={<p />}
      />
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

export default ConfirmationPage;