import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { recordEvent } from '@department-of-veterans-affairs/platform-monitoring/exports';
import { GA_PREFIX } from 'applications/vaos/utils/constants';
import ReferralLayout from '../components/ReferralLayout';
import { routeToNextReferralPage } from '../flow';
import { setFormCurrentPage, setInitReferralFlow } from '../redux/actions';
import { selectCurrentPage } from '../redux/selectors';
import { getReferralSlotKey, getReferralProviderKey } from '../utils/referrals';
import { titleCase } from '../../utils/formatters';
import FindCommunityCareOfficeLink from '../components/FindCCFacilityLink';
import NewTabAnchor from '../../components/NewTabAnchor';
import { getIsInPilotReferralStation } from '../utils/pilot';

export default function ScheduleReferral(props) {
  const { attributes: currentReferral, meta } = props.currentReferral;
  const location = useLocation();
  const history = useHistory();
  const currentPage = useSelector(selectCurrentPage);
  const dispatch = useDispatch();
  const selectedSlotKey = getReferralSlotKey(currentReferral.uuid);
  const selectedProviderKey = getReferralProviderKey(currentReferral.uuid);
  const hasVeteranAddress = meta.veteranAddressPresent;
  const expirationDate = currentReferral?.expirationDate
    ? format(new Date(currentReferral.expirationDate), 'MMMM d, yyyy')
    : '';

  const stationIdValid = getIsInPilotReferralStation(currentReferral);
  // Set when the user reaches this page after clicking "Schedule an
  // appointment" on a pending referral card whose cached list data was stale
  // (the fresh referral fetch showed the referral now has an appointment).
  const alreadyScheduledAlert =
    location.state?.alreadyScheduledAlert === true &&
    currentReferral.hasAppointments;
  useEffect(
    () => {
      dispatch(setFormCurrentPage('scheduleReferral'));
      dispatch(setInitReferralFlow());
      sessionStorage.removeItem(selectedSlotKey);
      sessionStorage.removeItem(selectedProviderKey);
    },
    [location, dispatch, selectedSlotKey, selectedProviderKey],
  );
  const categoryOfCare = titleCase(currentReferral.categoryOfCare);

  const handleClick = () => {
    return e => {
      e.preventDefault();
      recordEvent({
        event: `${GA_PREFIX}-review-upcoming-link`,
      });
      routeToNextReferralPage(history, currentPage, currentReferral.uuid);
    };
  };

  // onlineSchedule is not yet implemented on the backend for pilot. Default to true if it is null/undefined.
  const onlineSchedule = currentReferral.onlineSchedule ?? true;
  const canScheduleAppointment =
    hasVeteranAddress &&
    onlineSchedule &&
    !currentReferral.hasAppointments &&
    stationIdValid;

  return (
    <ReferralLayout hasEyebrow heading={`Referral for ${categoryOfCare}`}>
      <div>
        {!hasVeteranAddress && (
          <va-alert
            status="warning"
            data-testid="address-alert"
            class="vads-u-margin-bottom--2"
          >
            <h2 className="vads-u-margin-top--0">
              Add a home address to schedule an appointment
            </h2>
            <p>
              To schedule an appointment, you need a home address on file. To
              update your address, go to your VA.gov profile. Allow some time
              for your address update to process through our system.
            </p>
            <NewTabAnchor href="/profile" data-testid="va-profile-link">
              Go to your VA.gov profile (opens in new tab)
            </NewTabAnchor>
          </va-alert>
        )}
        {alreadyScheduledAlert && (
          <va-alert
            status="warning"
            data-testid="already-scheduled-alert"
            class="vads-u-margin-bottom--2"
          >
            <h2 slot="headline" className="vads-u-margin-top--0">
              You’ve already scheduled an appointment for this referral
            </h2>
            <p className="vads-u-margin-top--0 vads-u-margin-bottom--0">
              Contact this provider if you need to reschedule or cancel your
              appointment. Or if you need to make another appointment for this
              referral.
            </p>
          </va-alert>
        )}
        {hasVeteranAddress &&
          currentReferral.hasAppointments &&
          !alreadyScheduledAlert && (
            <div data-testid="has-appointments-content">
              <p className="vads-u-margin-top--0">
                You’ve scheduled 1 or more appointments for this referral. Go to
                your appointments list to review your upcoming appointments.
              </p>
              <va-link
                href="/my-health/appointments"
                text="Go to your appointments list"
                data-testid="appointments-list-link"
              />
              <p>
                If you have other appointments to schedule for this referral,
                contact your community care office.
              </p>
              <FindCommunityCareOfficeLink newTab />
            </div>
          )}
        {hasVeteranAddress &&
          !currentReferral.hasAppointments &&
          !canScheduleAppointment && (
            <va-alert
              status="warning"
              data-testid="referral-alert"
              class="vads-u-margin-bottom--2"
            >
              <p className="vads-u-margin-top--0 vads-u-margin-bottom--1">
                Online scheduling isn’t available for this referral right now.
                Call your community care provider or your facility’s community
                care office to schedule an appointment.
              </p>
              <FindCommunityCareOfficeLink newTab />
            </va-alert>
          )}

        {(!currentReferral.hasAppointments || alreadyScheduledAlert) && (
          <p data-testid="subtitle">
            We’ve approved your referral for community care.
            {canScheduleAppointment
              ? ' You can schedule your first appointment now.'
              : ''}
          </p>
        )}
        {canScheduleAppointment && (
          <va-link-action
            className="vads-u-margin-top--1"
            href={`/my-health/appointments/schedule-referral?id=${
              currentReferral.uuid
            }`}
            text="Schedule your appointment"
            onClick={handleClick()}
            data-testid="schedule-appointment-button"
          />
        )}
        <h2
          className={
            currentReferral.hasAppointments ? 'vads-u-margin-top--3' : ''
          }
        >
          Details about your referral
        </h2>
        <p data-testid="referral-details">
          <strong>Expiration date: </strong>
          {expirationDate}
          <br />
          <strong>Referral number: </strong>
          <span data-dd-privacy="mask">{currentReferral.referralNumber}</span>
        </p>
        <h2>Common questions about referrals</h2>
        <va-accordion open-single>
          <va-accordion-item
            header="What if I have questions or need to make changes to my referral?"
            id="questions-changes"
          >
            <p>
              Contact your facility’s community care office for any of these
              reasons:
            </p>
            <ul>
              <li>If you have questions about scheduling an appointment</li>
              <li>
                If you already scheduled your first appointment and want us to
                add it to your appointments list
              </li>
              <li>If you want to know how many appointments you have left</li>
              <li>If you need to make changes to your referral</li>
              <li>If a referral you need has expired</li>
            </ul>
            <FindCommunityCareOfficeLink />
          </va-accordion-item>
          <va-accordion-item
            header="How do I schedule my next appointment for this referral?"
            id="schedule-next-appointment"
          >
            <p>
              You can only schedule the first appointment for your referral
              online. To schedule your next appointments, contact your community
              care provider.
            </p>
          </va-accordion-item>
        </va-accordion>
      </div>
    </ReferralLayout>
  );
}

ScheduleReferral.propTypes = {
  currentReferral: PropTypes.object.isRequired,
};
