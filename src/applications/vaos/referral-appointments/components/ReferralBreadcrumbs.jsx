import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import {
  getReferralPageKeyFromPathname,
  getReferralUrlLabel,
  routeToPreviousReferralPage,
} from '../flow';
import Breadcrumbs from '../../components/Breadcrumbs';

function getBackLinkHref(currentPage) {
  if (currentPage === 'complete') {
    return '/my-health/appointments';
  }
  if (currentPage === 'scheduleReferral') {
    return '/referrals-requests';
  }
  return '#';
}

export default function ReferralBreadcrumbs() {
  const location = useLocation();
  const history = useHistory();
  const currentPage = getReferralPageKeyFromPathname(location.pathname);
  const breadcrumb = getReferralUrlLabel(currentPage);

  const isBackLink = breadcrumb?.startsWith('Back');

  // When the user jumps straight to provider selection from the referrals list
  // (PendingReferralCard's "Schedule an appointment" link attaches
  // `referrer=referrals-requests`), back should return them to the list rather
  // than the intermediate referral details page.
  const params = new URLSearchParams(location.search);
  const skipToReferralsList =
    currentPage === 'providerSelection' &&
    params.get('referrer') === 'referrals-requests';

  const backHref = skipToReferralsList
    ? '/referrals-requests'
    : getBackLinkHref(currentPage);

  const handleBackClick = e => {
    e.preventDefault();
    if (skipToReferralsList) {
      history.replace('/referrals-requests');
      return;
    }
    const searchParams = new URLSearchParams(history.location.search);
    const id = searchParams.get('id');
    routeToPreviousReferralPage(history, currentPage, id);
  };

  return isBackLink ? (
    <div className="vaos-hide-for-print mobile:vads-u-margin-bottom--0 mobile-lg:vads-u-margin-bottom--1 medium-screen:vads-u-margin-bottom--2">
      <nav aria-label="backlink" className="vads-u-padding-y--2 ">
        <va-link
          back
          aria-label="Back link"
          data-testid="back-link"
          text={breadcrumb}
          href={backHref}
          onClick={handleBackClick}
        />
      </nav>
    </div>
  ) : (
    <Breadcrumbs labelOverride={breadcrumb} />
  );
}
