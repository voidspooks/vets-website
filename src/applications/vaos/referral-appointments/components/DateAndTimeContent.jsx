import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import CalendarWidget from 'platform/shared/calendar/CalendarWidget';
import { setSelectedSlotStartTime } from '../redux/actions';
import FormButtons from '../../components/FormButtons';
import { routeToNextReferralPage, routeToPreviousReferralPage } from '../flow';
import {
  selectCurrentPage,
  getSelectedSlotStartTime,
} from '../redux/selectors';
import { getSlotByDate, normalizeSlotsProvider } from '../utils/provider';
import { getTimezoneDescByTimeZoneString } from '../../utils/timezone';
import { getReferralSlotKey } from '../utils/referrals';
import { scrollAndFocus } from '../../utils/scrollAndFocus';
import FindCommunityCareOfficeLink from './FindCCFacilityLink';
import UrgentCommunicationsBlock from './UrgentCommunicationsBlock';
import NewTabAnchor from '../../components/NewTabAnchor';
import { getIsInPilotReferralStation } from '../utils/pilot';

export const DateAndTimeContent = props => {
  const { currentReferral, draftAppointmentInfo, appointmentsByMonth } = props;
  const dispatch = useDispatch();
  const history = useHistory();

  const { careType } = draftAppointmentInfo.attributes;
  const rawProvider = draftAppointmentInfo.attributes.provider;
  const displayProvider =
    rawProvider?.type === 'unified_provider'
      ? normalizeSlotsProvider(rawProvider)
      : rawProvider;

  const isVAAppointment =
    displayProvider?.providerType === 'va' || careType === 'VA';
  const providerName = displayProvider?.individualProviders?.[0]?.name;
  const organizationName = displayProvider?.providerOrganization?.name;

  const isStationIdValid = getIsInPilotReferralStation(currentReferral);

  // Add a counter state to trigger focusing
  const [focusTrigger, setFocusTrigger] = useState(0);

  const selectedSlotStartTime = useSelector(getSelectedSlotStartTime);
  const currentPage = useSelector(selectCurrentPage);
  const [error, setError] = useState('');

  const providerTimeZone =
    displayProvider?.location?.timezone ||
    draftAppointmentInfo.attributes.provider?.attributes?.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneDescription = getTimezoneDescByTimeZoneString(providerTimeZone);
  const selectedSlotKey = getReferralSlotKey(currentReferral.uuid);
  const latestAvailableSlot = new Date(
    Math.max.apply(
      null,
      draftAppointmentInfo.attributes.slots.map(slot => {
        return new Date(slot.start);
      }),
    ),
  );
  const onChange = useCallback(
    (value, hasConflict = false) => {
      if (hasConflict) {
        setError(
          'You already have an appointment at this time. Please select another day or time.',
        );
      }
      const newSlot = getSlotByDate(
        draftAppointmentInfo.attributes.slots,
        value[0],
      );
      if (!hasConflict && newSlot) {
        setError('');
        sessionStorage.setItem(selectedSlotKey, newSlot.start);
      }
      if (newSlot) {
        dispatch(setSelectedSlotStartTime(newSlot.start));
      }
    },
    [dispatch, draftAppointmentInfo.attributes.slots, selectedSlotKey],
  );

  useEffect(
    () => {
      const savedSelectedSlot = sessionStorage.getItem(selectedSlotKey);
      const savedSlot = getSlotByDate(
        draftAppointmentInfo.attributes.slots,
        savedSelectedSlot,
      );
      if (!savedSlot) {
        return;
      }
      onChange(savedSlot.start);
    },
    [
      dispatch,
      selectedSlotKey,
      draftAppointmentInfo.attributes.slots,
      appointmentsByMonth,
      onChange,
    ],
  );
  const onBack = () => {
    routeToPreviousReferralPage(history, currentPage, currentReferral.uuid);
  };
  const onSubmit = () => {
    if (error) {
      // Increment the focus trigger to force re-focusing the validation message
      setFocusTrigger(prev => prev + 1);
      return;
    }
    if (!selectedSlotStartTime) {
      setError(
        'Please choose your preferred date and time for your appointment',
      );
      return;
    }
    routeToNextReferralPage(history, currentPage, currentReferral.uuid);
  };

  // Effect to focus on validation message whenever error state changes
  useEffect(
    () => {
      scrollAndFocus('.vaos-input-error-message');
    },
    [error, focusTrigger],
  );

  const noSlotsAvailable = !draftAppointmentInfo.attributes.slots.length;

  const disabledMessage = (
    <va-loading-indicator
      data-testid="loadingIndicator"
      set-focus
      message="Finding appointment availability..."
    />
  );

  const getContent = () => {
    // If the station is not in the pilot, show an alert
    if (!isStationIdValid) {
      return (
        <va-alert
          status="warning"
          data-testid="station-id-not-valid-alert"
          class="vads-u-margin-top--3"
        >
          <h2 slot="headline">Online scheduling isn’t available right now</h2>
          <p className="vads-u-margin-top--1 vads-u-margin-bottom--2">
            Call this provider or your facility’s community care office to
            schedule an appointment.
          </p>
          <FindCommunityCareOfficeLink newTab />
        </va-alert>
      );
    }

    // If there are no slots available, show an alert
    if (noSlotsAvailable) {
      if (isVAAppointment) {
        return (
          <va-alert
            status="warning"
            data-testid="no-slots-alert"
            class="vads-u-margin-top--3"
          >
            <h2 slot="headline">
              We couldn’t find an appointment for your selected date
            </h2>
            <p className="vads-u-margin-top--1 vads-u-margin-bottom--2">
              To find an available date to schedule this appointment, you can
              call your local VA health care facility.
            </p>
            <NewTabAnchor
              href="/find-locations"
              data-testid="find-va-facility-link"
            >
              Find your local VA health care facility
            </NewTabAnchor>
            <UrgentCommunicationsBlock />
          </va-alert>
        );
      }
      return (
        <va-alert
          status="warning"
          data-testid="no-slots-alert"
          class="vads-u-margin-top--3"
        >
          <h2 slot="headline">We couldn’t find any open time slots</h2>
          <p className="vads-u-margin-top--1 vads-u-margin-bottom--2">
            Call this provider or your facility’s community care office to
            schedule an appointment.
          </p>
          <FindCommunityCareOfficeLink newTab />
        </va-alert>
      );
    }

    // If there are slots available, show the calendar and form buttons
    return (
      <>
        <div data-testid="cal-widget">
          <CalendarWidget
            maxSelections={1}
            availableSlots={draftAppointmentInfo.attributes.slots}
            value={[selectedSlotStartTime || '']}
            id="dateTime"
            timezone={providerTimeZone}
            additionalOptions={{
              required: true,
            }}
            disabledMessage={disabledMessage}
            onChange={onChange}
            onNextMonth={null}
            onPreviousMonth={null}
            minDate={new Date()}
            maxDate={latestAvailableSlot}
            required
            requiredMessage={error}
            startMonth={new Date()}
            showValidation={error.length > 0}
            showWeekends
            overrideMaxDays
            upcomingAppointments={appointmentsByMonth}
          />
        </div>
        <FormButtons
          onBack={onBack}
          onSubmit={onSubmit}
          loadingText="Page change in progress"
        />
      </>
    );
  };

  return (
    <>
      <div>
        <p className="vads-u-margin--0" data-dd-privacy="mask">
          {`Scheduling with ${providerName}${
            isVAAppointment ? ' clinic' : ''
          } at ${organizationName}.`}
          <br />
          {`Times are displayed in ${timezoneDescription}`}
        </p>
      </div>
      {getContent()}
    </>
  );
};

DateAndTimeContent.propTypes = {
  currentReferral: PropTypes.object.isRequired,
  draftAppointmentInfo: PropTypes.object.isRequired,
  appointmentsByMonth: PropTypes.object,
};

export default DateAndTimeContent;
