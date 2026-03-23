import React from 'react';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { routeToCCPage } from '../../referral-appointments/flow';

export default function ReviewReferralsAndRequestsLink() {
  const history = useHistory();

  const handleCCLinkClick = e => {
    e.preventDefault();
    routeToCCPage(history, 'referralsAndRequests');
  };

  return (
    <div
      className={classNames(
        'vaos-hide-for-print',
        'vads-u-padding-y--3',
        'vads-u-margin-bottom--3',
        'vads-u-margin-top--1',
        'vads-u-border-top--1px',
        'vads-u-border-color--info-light',
        'vads-u-border-bottom--1px',
        'vads-u-border-color--info-light',
      )}
    >
      <va-link
        calendar
        href="/my-health/appointments/referrals-requests"
        text="Review referrals and requests"
        data-testid="review-requests-and-referrals"
        onClick={handleCCLinkClick}
      />
    </div>
  );
}
