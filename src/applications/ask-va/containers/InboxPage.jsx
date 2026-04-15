import React, { useEffect } from 'react';
import { withRouter } from 'react-router';
import { useFeatureToggle } from 'platform/utilities/feature-toggles';
import PropTypes from 'prop-types';
import Inbox from './Inbox';

function InboxPage({ router }) {
  const {
    useToggleValue,
    TOGGLE_NAMES,
    useToggleLoadingValue,
  } = useFeatureToggle();
  const isToggleLoading = useToggleLoadingValue();
  const isNewInbox = useToggleValue(TOGGLE_NAMES.askVaEnhancedInbox);

  // TODO delete after new inbox goes live
  useEffect(
    () => {
      if (!isToggleLoading && !isNewInbox) {
        router.replace('/');
      }
    },
    [isToggleLoading, isNewInbox, router],
  );

  if (isToggleLoading) {
    return (
      <va-loading-indicator
        data-testid="loading-indicator"
        message="Loading..."
      />
    );
  }

  if (!isNewInbox) return null;

  return (
    <div id="inbox-page" className="usa-grid">
      <Inbox />
    </div>
  );
}

InboxPage.propTypes = {
  router: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(InboxPage);
