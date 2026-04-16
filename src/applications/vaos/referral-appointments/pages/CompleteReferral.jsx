import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import { recordEvent } from '@department-of-veterans-affairs/platform-monitoring/exports';
import ReferralLayout from '../components/ReferralLayout';
import ConfirmationAppointmentCard from '../components/ConfirmationAppointmentCard';
import { routeToNextReferralPage } from '../flow';
import { useGetUnifiedBookingQuery } from '../../redux/api/vaosApi';
import { setFormCurrentPage, startNewAppointmentFlow } from '../redux/actions';
// eslint-disable-next-line import/no-restricted-paths
import getNewAppointmentFlow from '../../new-appointment/newAppointmentFlow';
import {
  getAppointmentCreateStatus,
  selectCurrentPage,
} from '../redux/selectors';
import { FETCH_STATUS, GA_PREFIX } from '../../utils/constants';
import FindCommunityCareOfficeLink from '../components/FindCCFacilityLink';

function handleScheduleClick(dispatch) {
  return () => {
    recordEvent({
      event: `${GA_PREFIX}-schedule-appointment-button-clicked`,
    });
    dispatch(startNewAppointmentFlow());
  };
}

const TIMEOUT_MS = 30000;
const POLL_INTERVAL_MS = 1000;

export const CompleteReferral = props => {
  const { attributes: currentReferral } = props.currentReferral;
  const { pathname, search } = useLocation();
  const dispatch = useDispatch();
  const history = useHistory();
  const appointmentCreateStatus = useSelector(getAppointmentCreateStatus);
  const currentPage = useSelector(selectCurrentPage);
  const [, appointmentId] = pathname.split('/schedule-referral/complete/');
  const providerType = new URLSearchParams(search).get('providerType') || 'eps';
  const isCC = providerType === 'eps';
  const { root, typeOfCare } = useSelector(getNewAppointmentFlow);

  const [pollInterval, setPollInterval] = useState(POLL_INTERVAL_MS);
  const [timedOut, setTimedOut] = useState(false);

  function goToDetailsView(e) {
    e.preventDefault();
    recordEvent({
      event: `${GA_PREFIX}-view-${
        isCC ? 'eps' : 'va'
      }-appointment-details-button-clicked`,
    });
    routeToNextReferralPage(
      history,
      currentPage,
      null,
      appointmentId,
      null,
      providerType,
    );
  }

  useEffect(
    () => {
      dispatch(setFormCurrentPage('complete'));
    },
    [dispatch],
  );

  const {
    data: appointmentInfo,
    isError,
    isLoading,
    isFetching,
  } = useGetUnifiedBookingQuery(
    { appointmentId, providerType },
    { pollingInterval: pollInterval },
  );

  const isBooked = appointmentInfo?.attributes?.status === 'booked';
  const [startTime] = useState(() => Date.now());

  useEffect(
    () => {
      if (isBooked || isError) {
        setPollInterval(0);
        return;
      }
      if (
        !isFetching &&
        pollInterval > 0 &&
        Date.now() - startTime > TIMEOUT_MS
      ) {
        setPollInterval(0);
        setTimedOut(true);
      }
    },
    [isBooked, isError, isFetching, pollInterval, startTime],
  );

  if (isError || timedOut) {
    return (
      <ReferralLayout
        hasEyebrow
        heading={
          timedOut
            ? 'We’re having trouble scheduling this appointment'
            : 'We can’t schedule this appointment online'
        }
      >
        <va-alert
          status={timedOut ? 'warning' : 'error'}
          data-testid={timedOut ? 'warning-alert' : 'error-alert'}
          class="vads-u-margin-top--5"
        >
          <p className="vads-u-margin-top--0 vads-u-margin-bottom--2">
            {timedOut
              ? 'Try refreshing this page. If it still doesn’t work, call your facility’s community care office to schedule an appointment.'
              : 'We’re sorry. Call your facility’s community care office to schedule an appointment'}
          </p>
          <FindCommunityCareOfficeLink />
        </va-alert>
      </ReferralLayout>
    );
  }

  if (isLoading || !isBooked || !appointmentInfo?.attributes) {
    return (
      <ReferralLayout loadingMessage="Confirming your appointment. This may take up to 30 seconds. Please don't refresh the page." />
    );
  }

  const referralLoaded = !!appointmentInfo?.attributes?.id;

  const { attributes } = appointmentInfo;

  return (
    <ReferralLayout
      hasEyebrow
      heading="Your appointment is scheduled"
      apiFailure={isError && appointmentCreateStatus !== FETCH_STATUS.succeeded}
      loadingMessage={
        isLoading || !referralLoaded ? 'Loading your appointment details' : null
      }
    >
      {!!referralLoaded && (
        <>
          <p>We’ve confirmed your appointment.</p>
          <ConfirmationAppointmentCard
            date={attributes.start}
            timezone={attributes.provider.location.timezone}
            typeOfCare={currentReferral.categoryOfCare}
            isCC={isCC}
            providerName={isCC ? currentReferral.provider.name : undefined}
            organizationName={
              isCC ? attributes.provider.location.name : undefined
            }
            clinicName={!isCC ? attributes.provider.name : undefined}
            facilityName={!isCC ? attributes.provider.location.name : undefined}
            modality={attributes.modality}
            address={attributes.provider.location.address}
            detailsLink={`${root.url}/${attributes.id}${
              isCC ? '?eps=true' : ''
            }`}
            onDetailsClick={e => goToDetailsView(e)}
          />
          <div className="vads-u-margin-top--2">
            <va-alert
              status="info"
              data-testid="survey-info-block"
              className="vads-u-padding--2"
            >
              <h3 className="vads-u-font-size--h4 vads-u-margin-top--0">
                Please consider taking our pilot feedback surveys
              </h3>
              <p className="vads-u-margin-top--0">
                First, follow the link below to the sign-up survey with our
                recruitment partner.
              </p>
              <p>
                Next, wait to be contacted by our recruitment partner, who will
                provide the feedback survey.
              </p>
              <p className="vads-u-margin-y--1">
                Our recruiting partner will provide compensation.
              </p>
              <p className="vads-u-margin-bottom--0">
                <va-link
                  href="https://forms.gle/7Lh5H2fab7Qv3DbA9"
                  text="Start the sign-up survey"
                  data-testid="survey-link"
                />
              </p>
            </va-alert>
          </div>
          <div className="vads-u-margin-top--6">
            <h2 className="vads-u-font-size--h3 vads-u-margin-bottom--0">
              Manage your appointments
            </h2>
            <hr
              aria-hidden="true"
              className="vads-u-margin-y--1p5 vads-u-border-color--primary"
            />
            <p>
              <va-link
                text="Schedule a new appointment"
                data-testid="schedule-appointment-link"
                href={`${root.url}${typeOfCare.url}`}
                onClick={handleScheduleClick(dispatch)}
              />
            </p>
            <p>
              <va-link
                text="Review your appointments"
                data-testid="view-appointments-link"
                href={`${root.url}`}
              />
            </p>
            <p>
              <va-link
                text="Review referrals and requests"
                data-testid="return-to-referrals-link"
                href={`${root.url}/referrals-requests`}
              />
            </p>
          </div>
        </>
      )}
    </ReferralLayout>
  );
};

CompleteReferral.propTypes = {
  currentReferral: PropTypes.object.isRequired,
};

export default CompleteReferral;
