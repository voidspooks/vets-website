import React from 'react';
import classNames from 'classnames';
import FindCommunityCareOfficeLink from '../../referral-appointments/components/FindCCFacilityLink';

export default function CCReferralsV1DisabledBanner() {
  return (
    <div
      className={classNames(
        'vaos-hide-for-print',
        'vads-u-margin-bottom--3',
        'vads-u-margin-top--1',
      )}
    >
      <va-alert-expandable
        status="warning"
        trigger="You can’t access community care referrals online"
        data-testid="cc-referrals-banner"
      >
        <p>
          Call your community care office for help scheduling an appointment.
        </p>
        <FindCommunityCareOfficeLink />
      </va-alert-expandable>
    </div>
  );
}
