import React, { useEffect, useMemo, useState } from 'react';
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
import {
  getReferralProviderKey,
  snapshotMatchesProviderSlotsParams,
} from '../utils/referrals';
import { mergeProviderSlotsWithSnapshot } from '../utils/provider';
import {
  getProviderSlotsParams,
  getSelectedProviderSnapshot,
} from '../redux/selectors';
import { routeToCCPage } from '../flow';

export const ChooseDateAndTime = props => {
  const currentReferral = props.currentReferral?.attributes;
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const providerSlotsParams = useSelector(getProviderSlotsParams);
  const selectedProviderSnapshot = useSelector(getSelectedProviderSnapshot);
  const providerId =
    urlParams.get('providerId') ||
    (providerSlotsParams?.providerType === 'va'
      ? providerSlotsParams.clinicId
      : providerSlotsParams?.providerServiceId);
  const {
    data: providerSlotsInfo,
    isLoading: isProviderSlotsLoading,
    isError: isProviderSlotsError,
    isSuccess: isProviderSlotsSuccess,
    isUninitialized: isProviderSlotsUninitialized,
  } = useGetProviderSlotsQuery(
    {
      referralId: currentReferral.uuid,
      ...providerSlotsParams,
    },
    { skip: !providerSlotsParams?.providerType },
  );

  const mergedProviderSlotsInfo = useMemo(
    () => {
      if (!providerSlotsInfo || !providerSlotsParams?.providerType) {
        return providerSlotsInfo;
      }
      if (
        !selectedProviderSnapshot ||
        !snapshotMatchesProviderSlotsParams(
          selectedProviderSnapshot,
          providerSlotsParams,
        )
      ) {
        return providerSlotsInfo;
      }
      return mergeProviderSlotsWithSnapshot(
        providerSlotsInfo,
        selectedProviderSnapshot,
        providerSlotsParams,
      );
    },
    [providerSlotsInfo, providerSlotsParams, selectedProviderSnapshot],
  );

  const slotsProviderType =
    mergedProviderSlotsInfo?.attributes?.provider?.attributes?.providerType ??
    providerSlotsParams?.providerType;
  const isVAAppointment = slotsProviderType === 'va';

  const { futureStatus, appointmentsByMonth } = useSelector(
    state => getUpcomingAppointmentListInfo(state),
    shallowEqual,
  );
  const appointmentsByMonthForCalendar = useMemo(
    () =>
      appointmentsByMonth != null && !Array.isArray(appointmentsByMonth)
        ? appointmentsByMonth
        : {},
    [appointmentsByMonth],
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
      if (!providerSlotsParams?.providerType) {
        routeToCCPage(history, 'providerSelection', currentReferral.uuid);
        return;
      }
      if (providerId) {
        dispatch(setSelectedProviderId(providerId));
        sessionStorage.setItem(
          getReferralProviderKey(currentReferral.uuid),
          providerId,
        );
      }
    },
    [dispatch, history, providerId, currentReferral.uuid, providerSlotsParams],
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
      errorAlertLinkNewTab
      isVAAppointment={isVAAppointment}
    >
      <DateAndTimeContent
        draftAppointmentInfo={mergedProviderSlotsInfo}
        currentReferral={currentReferral}
        appointmentsByMonth={appointmentsByMonthForCalendar}
      />
    </ReferralLayout>
  );
};

ChooseDateAndTime.propTypes = {
  currentReferral: PropTypes.object.isRequired,
};

export default ChooseDateAndTime;
