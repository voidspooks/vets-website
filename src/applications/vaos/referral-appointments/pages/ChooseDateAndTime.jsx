import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import ReferralLayout from '../components/ReferralLayout';
// eslint-disable-next-line import/no-restricted-paths
import { getUpcomingAppointmentListInfo } from '../../appointment-list/redux/selectors';
import { setFormCurrentPage, setSelectedProviderId } from '../redux/actions';
// eslint-disable-next-line import/no-restricted-paths
import { fetchFutureAppointments } from '../../appointment-list/redux/actions';
import { useGetProviderSlotsQuery } from '../../redux/api/vaosApi';
import { FETCH_STATUS } from '../../utils/constants';
import DateAndTimeContent from '../components/DateAndTimeContent';
import { getReferralProviderKey } from '../utils/referrals';
import { routeToCCPage } from '../flow';

export const ChooseDateAndTime = props => {
  const { attributes: currentReferral } = props.currentReferral;
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const providerId = urlParams.get('providerId');
  const {
    data: providerSlotsInfo,
    isLoading: isProviderSlotsLoading,
    isError: isProviderSlotsError,
    isSuccess: isProviderSlotsSuccess,
    isUninitialized: isProviderSlotsUninitialized,
  } = useGetProviderSlotsQuery(
    {
      referralId: currentReferral.uuid,
      providerId,
    },
    { skip: !providerId },
  );

  const { futureStatus, appointmentsByMonth } = useSelector(
    state => getUpcomingAppointmentListInfo(state),
    shallowEqual,
  );
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const scheduleHeader = 'What date and time do you want for this appointment?';

  useEffect(
    () => {
      if (providerSlotsInfo?.attributes) {
        if (futureStatus === FETCH_STATUS.notStarted) {
          dispatch(fetchFutureAppointments({ includeRequests: false }));
        }
        if (futureStatus === FETCH_STATUS.succeeded) {
          setLoading(false);
        }
      } else if (
        isProviderSlotsUninitialized ||
        futureStatus === FETCH_STATUS.notStarted
      ) {
        if (futureStatus === FETCH_STATUS.notStarted) {
          dispatch(fetchFutureAppointments({ includeRequests: false }));
        }
      } else if (isProviderSlotsError || futureStatus === FETCH_STATUS.failed) {
        setLoading(false);
        setFailed(true);
      }
    },
    [
      currentReferral,
      dispatch,
      providerSlotsInfo,
      futureStatus,
      isProviderSlotsError,
      isProviderSlotsSuccess,
      isProviderSlotsUninitialized,
    ],
  );
  useEffect(
    () => {
      dispatch(setFormCurrentPage('scheduleAppointment'));
    },
    [location, dispatch],
  );

  useEffect(
    () => {
      if (providerId) {
        dispatch(setSelectedProviderId(providerId));
        sessionStorage.setItem(
          getReferralProviderKey(currentReferral.uuid),
          providerId,
        );
      } else {
        routeToCCPage(history, 'scheduleReferral', currentReferral.uuid);
      }
    },
    [dispatch, history, providerId, currentReferral.uuid],
  );

  // Check for error state before showing loading indicator to prevent race condition
  // where isProviderSlotsError becomes true while loading is still true
  if ((loading || isProviderSlotsLoading) && !isProviderSlotsError) {
    return (
      <ReferralLayout
        data-testid="loading"
        loadingMessage="Loading available appointment times..."
        hasEyebrow
        heading={scheduleHeader}
      />
    );
  }

  return (
    <ReferralLayout
      hasEyebrow
      apiFailure={failed || isProviderSlotsError}
      heading={scheduleHeader}
    >
      <DateAndTimeContent
        draftAppointmentInfo={providerSlotsInfo}
        currentReferral={currentReferral}
        appointmentsByMonth={appointmentsByMonth}
      />
    </ReferralLayout>
  );
};

ChooseDateAndTime.propTypes = {
  currentReferral: PropTypes.object.isRequired,
};

export default ChooseDateAndTime;
