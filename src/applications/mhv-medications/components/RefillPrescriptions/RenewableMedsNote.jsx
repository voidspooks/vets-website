import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom-v5-compat';
import { dataDogActionNames } from '../../util/dataDogConstants';

/**
 * A reusable note component that displays a message about renewable medications
 * and provides a link to navigate to the history page with the RENEWAL filter applied.
 */
const RenewableMedsNote = ({ testId, className, onLinkClick }) => {
  return (
    <p className={className} data-testid={`${testId}-note`}>
      <strong>Note:</strong> If you can’t find the medication you’re looking
      for, you may have already requested a refill. Or you may need to submit a
      renewal request before you can request a refill.
      <Link
        data-testid={testId}
        className="vads-u-margin-top--2 vads-u-display--block"
        to="/history"
        onClick={onLinkClick}
        data-dd-action-name={
          dataDogActionNames.refillPage
            .GO_TO_YOUR_MEDICATIONS_LIST_ACTION_LINK_RENEW
        }
      >
        Go to your list of renewable medications
      </Link>
    </p>
  );
};

RenewableMedsNote.propTypes = {
  testId: PropTypes.string.isRequired,
  onLinkClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

RenewableMedsNote.defaultProps = {
  className: '',
};

export default RenewableMedsNote;
