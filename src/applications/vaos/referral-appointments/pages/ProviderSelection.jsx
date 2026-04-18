import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';
import ReferralLayout from '../components/ReferralLayout';
import ProviderSelectionCard from '../components/ProviderSelectionCard';
import FindCCFacilityLink from '../components/FindCCFacilityLink';
import { useGetReferralProvidersQuery } from '../../redux/api/vaosApi';
import { setFormCurrentPage } from '../redux/actions';
import InfoAlert from '../../components/InfoAlert';

const PER_PAGE = 5;

export default function ProviderSelection({ currentReferral }) {
  const { attributes: referralAttributes } = currentReferral;
  const { uuid: referralId, hasAppointments } = referralAttributes;
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);

  // Guard against the case where the referrals list was cached with a stale
  // `hasAppointments: false`. The fresh detail fetched above may now report
  // that the referral has already been booked; in that case, route the user
  // back to ScheduleReferral with a flag so it can display the "already
  // scheduled" alert instead of letting them re-book.
  const {
    data: providersData,
    isLoading,
    isFetching,
    isError,
  } = useGetReferralProvidersQuery(
    { referralId, page, perPage: PER_PAGE },
    { skip: hasAppointments },
  );

  useEffect(
    () => {
      dispatch(setFormCurrentPage('providerSelection'));
    },
    [dispatch],
  );

  if (hasAppointments) {
    return (
      <Redirect
        to={{
          pathname: '/schedule-referral',
          search: `?id=${referralId}`,
          state: { alreadyScheduledAlert: true },
        }}
      />
    );
  }

  const providers =
    providersData?.providers?.map(p => ({
      ...p.attributes,
      id: p.id,
    })) || [];

  const totalEntries = providersData?.totalEntries || 0;
  const remainingCount = totalEntries - providers.length;

  const facilityDetails = referralAttributes.referringFacility || {};

  if (isLoading) {
    return (
      <ReferralLayout
        loadingMessage="Loading available providers..."
        hasEyebrow
        heading="Which provider do you want to schedule with?"
      />
    );
  }

  if (isError) {
    return (
      <ReferralLayout
        hasEyebrow
        heading="Which provider do you want to schedule with?"
      >
        <InfoAlert
          status="error"
          testId="provider-selection-error-alert"
          headline="You can’t schedule an appointment online right now"
        >
          <p>
            We’re sorry. There’s a problem with our system. Try again later.
          </p>
          <p className="vads-u-margin-bottom--0">
            If you need to schedule now, call your VA facility.
          </p>
          <va-link href="/find-locations" text="Find a VA health facility" />
        </InfoAlert>
      </ReferralLayout>
    );
  }

  if (!isLoading && providers.length === 0) {
    return (
      <ReferralLayout
        hasEyebrow
        heading="Which provider do you want to schedule with?"
      >
        <InfoAlert
          status="warning"
          testId="no-providers-alert"
          headline="You can’t schedule this appointment online"
        >
          <p>We couldn’t find any appointment times for online scheduling.</p>
          <p>You’ll need to call the facility to schedule an appointment.</p>
          <p className="vads-u-font-weight--bold vads-u-margin-bottom--0">
            {facilityDetails.name}
          </p>
          <p className="vads-u-margin-top--0 vads-u-margin-bottom--0">
            <strong>Main phone:</strong>{' '}
            <va-telephone contact={facilityDetails.phone || '###-###-####'} /> (
            <va-telephone contact="711" tty />)
          </p>
          <p className="vads-u-margin-top--2">
            Or you can choose a different facility.
          </p>
        </InfoAlert>
      </ReferralLayout>
    );
  }

  return (
    <ReferralLayout
      hasEyebrow
      heading="Which provider do you want to schedule with?"
    >
      <div>
        <p>
          You can schedule an appointment at VA or community care locations
          within 25 miles of your home address.
        </p>
        <p>
          <strong>Note:</strong> You can request travel pay for appointments at
          any of these locations. But we'll only pay you back for travel up to
          the distance to your nearest VA health facility.
        </p>
        <ul className="usa-unstyled-list vaos-appts__list">
          {providers.map((provider, index) => (
            <ProviderSelectionCard
              key={provider.id}
              provider={provider}
              index={index}
              referralId={referralId}
            />
          ))}
        </ul>
        {remainingCount > 0 && (
          <va-button
            class="vads-u-margin-top--4"
            data-testid="show-more-providers-button"
            secondary
            text={
              isFetching
                ? 'Loading...'
                : `Show ${remainingCount} more providers`
            }
            disabled={isFetching}
            onClick={() => setPage(prev => prev + 1)}
          />
        )}
        <div
          className="vads-u-margin-top--4"
          data-testid="different-provider-section"
        >
          <h3 className="vads-u-margin--0 vads-u-margin-bottom--1">
            If you want to schedule with a different provider
          </h3>
          <p className="vads-u-margin--0">
            For appointments at a VA health facility, call us at{' '}
            {facilityDetails.phone || '###-###-####'} (TTY:{' '}
            {facilityDetails.tty || '711'}
            ).
          </p>
          <p className="vads-u-margin--0">
            We’re here Monday through Friday, 8:00 a.m. to 8:00 p.m. ET.
          </p>
          <p className="vads-u-margin-top--4 vads-u-margin-bottom--0">
            For appointments at a community care facility, contact your
            community care provider.
          </p>
          <FindCCFacilityLink />
        </div>
      </div>
    </ReferralLayout>
  );
}

ProviderSelection.propTypes = {
  currentReferral: PropTypes.object.isRequired,
};
