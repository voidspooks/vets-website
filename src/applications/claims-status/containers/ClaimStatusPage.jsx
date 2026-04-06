import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { clearNotification } from '../actions';
import ClaimDetailLayout from '../components/ClaimDetailLayout';
import WhatYouNeedToDo from '../components/claim-status-tab/WhatYouNeedToDo';
import ClaimStatusHeader from '../components/ClaimStatusHeader';
import WhatWeAreDoing from '../components/claim-status-tab/WhatWeAreDoing';
import RecentActivity from '../components/claim-status-tab/RecentActivity';
import NextSteps from '../components/claim-status-tab/NextSteps';
import Payments from '../components/claim-status-tab/Payments';
import ClosedClaimAlert from '../components/claim-status-tab/ClosedClaimAlert';

import {
  claimAvailable,
  isClaimOpen,
  setPageFocus,
  setTabDocumentTitle,
} from '../utils/helpers';
import { withClaimStatusMetaIfEnabled } from '../utils/claimStatusMeta';
import { setUpPage, isTab } from '../utils/page';

class ClaimStatusPage extends React.Component {
  componentDidMount() {
    const { claim } = this.props;
    // Only set the document title at mount-time if the claim is already available.
    if (claimAvailable(claim)) setTabDocumentTitle(claim, 'Status');

    setTimeout(() => {
      const { lastPage, loading } = this.props;
      setPageFocus(lastPage, loading);
    }, 100);
  }

  componentDidUpdate(prevProps) {
    const { claim, lastPage, loading } = this.props;

    if (!loading && prevProps.loading && !isTab(lastPage)) {
      setUpPage(false, 'h1');
    }
    // Set the document title when loading completes.
    //   If loading was successful it will display a title specific to the claim.
    //   Otherwise it will display a default title of "Status of Your Claim".
    if (loading !== prevProps.loading) {
      setTabDocumentTitle(claim, 'Status');
    }
  }

  componentWillUnmount() {
    this.props.clearNotification();
  }

  getPageContent() {
    const { claim, cstChampvaCustomContentEnabled } = this.props;
    const displayClaim = withClaimStatusMetaIfEnabled(
      claim,
      cstChampvaCustomContentEnabled,
    );

    // Return null if the claim/ claim.attributes dont exist
    if (!claimAvailable(displayClaim)) {
      return null;
    }

    const { closeDate, decisionLetterSent, status } = displayClaim.attributes;
    const isOpen = isClaimOpen(status, closeDate);

    return (
      <div className="claim-status">
        <ClaimStatusHeader claim={displayClaim} />
        {isOpen ? (
          <>
            <WhatYouNeedToDo claim={displayClaim} useLighthouse />
            <WhatWeAreDoing claim={displayClaim} />
          </>
        ) : (
          <>
            <ClosedClaimAlert
              closeDate={closeDate}
              decisionLetterSent={decisionLetterSent}
            />
            <Payments />
            <NextSteps />
          </>
        )}
        <RecentActivity claim={displayClaim} />
      </div>
    );
  }

  render() {
    const {
      claim,
      cstChampvaCustomContentEnabled,
      loading,
      message,
    } = this.props;
    const displayClaim = withClaimStatusMetaIfEnabled(
      claim,
      cstChampvaCustomContentEnabled,
    );

    let content = null;
    if (!loading) {
      content = this.getPageContent();
    }

    return (
      <ClaimDetailLayout
        claim={displayClaim}
        clearNotification={this.props.clearNotification}
        currentTab="Status"
        loading={loading}
        message={message}
      >
        {content}
      </ClaimDetailLayout>
    );
  }
}

function mapStateToProps(state) {
  const claimsState = state.disability.status;

  return {
    claim: claimsState.claimDetail.detail,
    cstChampvaCustomContentEnabled:
      state.featureToggles?.cst_champva_custom_content || false,
    lastPage: claimsState.routing.lastPage,
    loading: claimsState.claimDetail.loading,
    message: claimsState.notifications.message,
  };
}

const mapDispatchToProps = {
  clearNotification,
};

ClaimStatusPage.propTypes = {
  claim: PropTypes.object,
  clearNotification: PropTypes.func,
  cstChampvaCustomContentEnabled: PropTypes.bool,
  lastPage: PropTypes.string,
  loading: PropTypes.bool,
  message: PropTypes.object,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClaimStatusPage);

export { ClaimStatusPage };
