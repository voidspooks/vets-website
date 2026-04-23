import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { scrollToTop } from 'platform/utilities/scroll';
import { focusElement } from 'platform/utilities/ui';
import UnderReviewConfirmationFry from '../components/confirmation/UnderReviewConfirmationFry';
import UnderReviewConfirmationDEAChapter35 from '../components/confirmation/UnderReviewConfirmationDEAChapter35';
import ConfirmationApproved from '../components/confirmation/ConfirmationApproved';
import LoadingIndicator from '../components/LoadingIndicator';
import {
  fetchClaimStatus,
  sendConfirmation as sendConfirmationAction,
  CLAIM_STATUS_RESPONSE_ELIGIBLE,
} from '../actions';

const ConfirmationPage = ({
  form,
  claimantFullName,
  claimStatus,
  getClaimStatus,
  userEmail,
  userFirstName,
  sendConfirmation,
  confirmationLoading,
  confirmationError,
  meb5490Automation,
}) => {
  const { formId, data } = form;
  const { chosenBenefit } = data;

  // Set up scroll and focus when the component mounts
  useEffect(() => {
    focusElement('h2');
    scrollToTop('topScrollElement');
  }, []);

  // Fetch claim status when feature flag is enabled (DEA only, not Fry)
  useEffect(
    () => {
      if (!claimStatus && chosenBenefit === 'dea' && meb5490Automation) {
        getClaimStatus('Chapter35');
      }
    },
    [getClaimStatus, claimStatus, chosenBenefit, meb5490Automation],
  );

  // Print page handler
  const printPage = useCallback(() => {
    window.print();
  }, []);

  // Create a safe user name string with fallback values for each name part
  const userName = `${claimantFullName?.first ||
    ''} ${claimantFullName?.middle || ''} ${claimantFullName?.last ||
    ''} ${claimantFullName?.suffix || ''}`.trim();

  // Format the received date
  // Parse date string as local date to avoid timezone issues
  const parseLocalDate = dateStr => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const receivedDate = claimStatus?.receivedDate
    ? parseLocalDate(claimStatus.receivedDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  // CRITICAL: Check Fry Scholarship FIRST - NO automation for Fry
  // Fry Scholarship always uses existing behavior (no polling, no feature flag check)
  if (chosenBenefit === 'fry') {
    return (
      <UnderReviewConfirmationFry
        user={userName}
        dateReceived={receivedDate}
        formId={formId}
        printPage={printPage}
      />
    );
  }

  // From here on, we only handle DEA (Chapter 35)
  // Return null if chosenBenefit is neither 'fry' nor 'dea'
  if (chosenBenefit !== 'dea') {
    return null;
  }

  // If DEA and feature flag disabled - use existing behavior
  if (!meb5490Automation) {
    return (
      <UnderReviewConfirmationDEAChapter35
        user={userName}
        dateReceived={receivedDate}
        formId={formId}
        printPage={printPage}
      />
    );
  }

  // Show loading while polling
  if (!claimStatus) {
    return <LoadingIndicator message="Loading your application status..." />;
  }

  // Route based on claim status (DEA only)
  const claimStatusValue = claimStatus?.claimStatus;

  if (claimStatusValue === CLAIM_STATUS_RESPONSE_ELIGIBLE) {
    return (
      <ConfirmationApproved
        claimantName={userName}
        confirmationDate={receivedDate}
        confirmationError={confirmationError}
        confirmationLoading={confirmationLoading}
        printPage={printPage}
        sendConfirmation={sendConfirmation}
        userEmail={userEmail}
        userFirstName={userFirstName}
        chosenBenefit={chosenBenefit}
      />
    );
  }

  // Default: IN_PROGRESS, DENIED, ERROR all show under review (DEA only)
  return (
    <UnderReviewConfirmationDEAChapter35
      user={userName}
      dateReceived={receivedDate}
      formId={formId}
      printPage={printPage}
      sendConfirmation={sendConfirmation}
      userEmail={userEmail}
      userFirstName={userFirstName}
      confirmationLoading={confirmationLoading}
      confirmationError={confirmationError}
    />
  );
};

const mapStateToProps = state => ({
  form: state.form,
  claimantFullName: state.user?.profile?.userFullName || {},
  claimStatus: state.data?.claimStatus,
  userEmail: state.user?.profile?.email,
  userFirstName: state.user?.profile?.userFullName?.first,
  confirmationError: state.data?.confirmationError || null,
  confirmationLoading: state.data?.confirmationLoading || false,
  confirmationSuccess: state.data?.confirmationSuccess || false,
  meb5490Automation: state.featureToggles?.meb5490Automation,
});

const mapDispatchToProps = {
  getClaimStatus: fetchClaimStatus,
  sendConfirmation: sendConfirmationAction,
};

ConfirmationPage.propTypes = {
  form: PropTypes.shape({
    data: PropTypes.shape({
      chosenBenefit: PropTypes.string,
    }),
    formId: PropTypes.string,
  }).isRequired,
  claimStatus: PropTypes.shape({
    claimStatus: PropTypes.string,
    receivedDate: PropTypes.string,
  }),
  claimantFullName: PropTypes.shape({
    first: PropTypes.string,
    middle: PropTypes.string,
    last: PropTypes.string,
    suffix: PropTypes.string,
  }),
  confirmationError: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  confirmationLoading: PropTypes.bool,
  getClaimStatus: PropTypes.func,
  meb5490Automation: PropTypes.bool,
  sendConfirmation: PropTypes.func,
  userEmail: PropTypes.string,
  userFirstName: PropTypes.string,
};

ConfirmationPage.defaultProps = {
  claimantFullName: { first: '', middle: '', last: '', suffix: '' },
  claimStatus: null,
  getClaimStatus: () => {},
  userEmail: '',
  userFirstName: '',
  sendConfirmation: () => {},
  confirmationLoading: false,
  confirmationError: null,
  meb5490Automation: false,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConfirmationPage);
