import React, { useState, useEffect, useMemo } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  getSelectedSlotStartTime,
  getSelectedProviderId,
  getProviderSlotsParams,
  getSelectedProviderSnapshot,
} from '../redux/selectors';
import {
  setFormCurrentPage,
  setSelectedSlotStartTime,
  setSelectedProviderId,
} from '../redux/actions';
import {
  usePostReferralAppointmentMutation,
  useGetProviderSlotsQuery,
} from '../../redux/api/vaosApi';

import ReferralLayout from '../components/ReferralLayout';
import ProviderAddress from '../components/ProviderAddress';
import {
  routeToPreviousReferralPage,
  routeToCCPage,
  routeToNextReferralPage,
} from '../flow';

import {
  getReferralSlotKey,
  getReferralProviderKey,
  snapshotMatchesProviderSlotsParams,
} from '../utils/referrals';
import {
  getSlotByDate,
  normalizeSlotsProviderIfUnified,
  mergeProviderSlotsWithSnapshot,
} from '../utils/provider';
import { stripDST } from '../../utils/timezone';
import FindCommunityCareOfficeLink from '../components/FindCCFacilityLink';
import { titleCase } from '../../utils/formatters';
import { getModalityDisplay } from '../utils/modality';

const ReviewAndConfirm = props => {
  const { attributes: currentReferral } = props.currentReferral;
  const dispatch = useDispatch();
  const history = useHistory();

  const selectedProviderId = useSelector(getSelectedProviderId);
  const savedProviderId = sessionStorage.getItem(
    getReferralProviderKey(currentReferral.uuid),
  );
  const providerSlotsParams = useSelector(getProviderSlotsParams);
  const selectedProviderSnapshot = useSelector(getSelectedProviderSnapshot);
  const providerId =
    selectedProviderId ||
    savedProviderId ||
    (providerSlotsParams?.providerType === 'va'
      ? providerSlotsParams.clinicId
      : providerSlotsParams?.providerServiceId);

  const selectedSlot = useSelector(state => getSelectedSlotStartTime(state));
  const [createFailed, setCreateFailed] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const savedSelectedSlot = sessionStorage.getItem(
    getReferralSlotKey(currentReferral.uuid),
  );

  const {
    data: draftAppointmentInfo,
    isLoading: isDraftLoading,
    isError: isDraftError,
    isSuccess: isDraftSuccess,
  } = useGetProviderSlotsQuery(
    {
      referralId: currentReferral.uuid,
      ...providerSlotsParams,
    },
    { skip: !providerSlotsParams?.providerType },
  );

  const mergedDraftAppointmentInfo = useMemo(
    () => {
      if (!draftAppointmentInfo || !providerSlotsParams?.providerType) {
        return draftAppointmentInfo;
      }
      if (
        !selectedProviderSnapshot ||
        !snapshotMatchesProviderSlotsParams(
          selectedProviderSnapshot,
          providerSlotsParams,
        )
      ) {
        return draftAppointmentInfo;
      }
      return mergeProviderSlotsWithSnapshot(
        draftAppointmentInfo,
        selectedProviderSnapshot,
        providerSlotsParams,
      );
    },
    [draftAppointmentInfo, providerSlotsParams, selectedProviderSnapshot],
  );

  const providerRaw = mergedDraftAppointmentInfo?.attributes?.provider;
  const providerForReview = providerRaw
    ? normalizeSlotsProviderIfUnified(providerRaw)
    : null;

  const slotsProviderType =
    mergedDraftAppointmentInfo?.attributes?.provider?.attributes
      ?.providerType ?? providerSlotsParams?.providerType;
  const isCommunityCare = slotsProviderType !== 'va';

  const slotDetails = getSlotByDate(
    mergedDraftAppointmentInfo?.attributes?.slots,
    selectedSlot || savedSelectedSlot,
  );

  const providerTimezone =
    providerForReview?.location?.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { text: modalityText, icon: modalityIcon } = getModalityDisplay(
    providerForReview?.visitMode,
  );

  const [postReferralAppointment] = usePostReferralAppointmentMutation();

  useEffect(
    () => {
      dispatch(setFormCurrentPage('reviewAndConfirm'));
    },
    [dispatch],
  );

  useEffect(
    () => {
      if (!selectedProviderId && savedProviderId) {
        dispatch(setSelectedProviderId(savedProviderId));
      }
    },
    [dispatch, selectedProviderId, savedProviderId],
  );

  useEffect(
    () => {
      if (
        !providerSlotsParams?.providerType ||
        !providerId ||
        (!selectedSlot && !savedSelectedSlot)
      ) {
        routeToCCPage(history, 'scheduleReferral', currentReferral.uuid);
      }
    },
    [
      currentReferral.uuid,
      history,
      providerId,
      providerSlotsParams,
      savedSelectedSlot,
      selectedSlot,
    ],
  );

  useEffect(
    () => {
      if (!selectedSlot && savedSelectedSlot && isDraftSuccess) {
        const savedSlot = getSlotByDate(
          mergedDraftAppointmentInfo?.attributes?.slots,
          savedSelectedSlot,
        );
        if (!savedSlot) {
          routeToCCPage(history, 'scheduleReferral');
        } else {
          dispatch(setSelectedSlotStartTime(savedSlot.start));
        }
      }
    },
    [
      dispatch,
      savedSelectedSlot,
      mergedDraftAppointmentInfo,
      history,
      selectedSlot,
      isDraftSuccess,
    ],
  );

  const handleGoBack = e => {
    e.preventDefault();
    routeToPreviousReferralPage(
      history,
      'reviewAndConfirm',
      currentReferral.uuid,
    );
  };

  const onSubmit = async e => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateFailed(false);

    const provider = normalizeSlotsProviderIfUnified(
      mergedDraftAppointmentInfo.attributes.provider,
    );
    const bookingPayload = isCommunityCare
      ? {
          providerType: 'eps',
          appointmentId: mergedDraftAppointmentInfo.id,
          referralNumber: currentReferral.referralNumber,
          slotId: slotDetails.id,
          networkId: provider.networkIds[0],
          providerServiceId: provider.id,
        }
      : {
          providerType: 'va',
          clinicId: provider.clinicId,
          locationId: provider.locationId,
          serviceType: provider.serviceType,
          slotId: slotDetails.id,
        };

    try {
      await postReferralAppointment(bookingPayload).unwrap();
      const providerType = isCommunityCare ? 'eps' : 'va';
      routeToNextReferralPage(
        history,
        'reviewAndConfirm',
        currentReferral.uuid,
        mergedDraftAppointmentInfo.id,
        null,
        providerType,
      );
    } catch {
      setCreateFailed(true);
    } finally {
      setCreateLoading(false);
    }
  };

  if (isDraftLoading && !isDraftError) {
    return (
      <ReferralLayout
        hasEyebrow
        heading="Review your appointment details"
        loadingMessage="Loading your appointment details"
        apiFailure={false}
      />
    );
  }

  const headingStyles = 'vads-u-margin-top--0 ';

  return (
    <ReferralLayout
      hasEyebrow
      heading="Review your appointment details"
      apiFailure={isDraftError}
      errorAlertLinkNewTab
      isVAAppointment={!isCommunityCare}
      loadingMessage={
        isDraftLoading && !isDraftError
          ? 'Loading your appointment details'
          : null
      }
    >
      <div>
        <hr className="vads-u-margin-y--2" />
        {mergedDraftAppointmentInfo?.attributes && (
          <>
            <div className="vads-l-grid-container vads-u-padding--0">
              <div className="vads-l-row">
                <div className="vads-l-col">
                  <h2 className={headingStyles}>Date and time</h2>
                </div>
                <div className="vads-l-col vads-u-text-align--right">
                  <va-link
                    href={`/my-health/appointments/schedule-referral/date-time?id=${
                      currentReferral.uuid
                    }${providerId ? `&providerId=${providerId}` : ''}`}
                    label="Edit date and time"
                    text="Edit"
                    data-testid="edit-when-information-link"
                    onClick={e => {
                      handleGoBack(e);
                    }}
                  />
                </div>
              </div>
            </div>
            {slotDetails && (
              <p className="vads-u-margin--0" data-testid="slot-day-time">
                <>
                  {formatInTimeZone(
                    new Date(slotDetails.start),
                    providerTimezone,
                    'EEEE, LLLL d, yyyy',
                  )}
                </>
                <br />
                <>
                  {stripDST(
                    formatInTimeZone(
                      new Date(slotDetails.start),
                      providerTimezone,
                      'h:mm aaaa zzz',
                    ),
                  )}
                </>
              </p>
            )}
            <hr className="vads-u-margin-y--2" />
            <div className="vads-l-grid-container vads-u-padding--0">
              <div className="vads-l-row">
                <div className="vads-l-col">
                  <h2 className={headingStyles}>Details</h2>
                </div>
                <div className="vads-l-col vads-u-text-align--right">
                  <va-link
                    href={`/my-health/appointments/schedule-referral/provider-selection?id=${
                      currentReferral.uuid
                    }`}
                    label="Edit details"
                    text="Edit"
                    data-testid="edit-details-link"
                    onClick={e => {
                      e.preventDefault();
                      routeToCCPage(
                        history,
                        'providerSelection',
                        currentReferral.uuid,
                      );
                    }}
                  />
                </div>
              </div>
            </div>
            <p className="vads-u-margin--0">
              <span data-dd-privacy="mask">
                {titleCase(currentReferral.categoryOfCare)}
              </span>
              <br />
              {isCommunityCare ? (
                <>
                  Community care
                  <br />
                  <span data-dd-privacy="mask">{providerForReview?.name}</span>
                </>
              ) : (
                <>
                  VA care
                  <br />
                  <span data-dd-privacy="mask">
                    Clinic: {providerForReview?.name}
                  </span>
                </>
              )}
            </p>
            <p
              className="vads-u-margin-top--0p5 vads-u-margin-bottom--0p5"
              data-testid="review-modality"
            >
              <va-icon icon={modalityIcon} size={3} />{' '}
              <span data-dd-privacy="mask">{modalityText}</span>
            </p>
            <p className="vads-u-margin--0">
              <span data-dd-privacy="mask">
                {isCommunityCare
                  ? providerForReview?.providerOrganization?.name
                  : providerForReview?.location?.name}
              </span>
            </p>
            <ProviderAddress
              address={providerForReview?.location?.address || ''}
            />
            <hr className="vads-u-margin-y--2" />
            <div className="vads-u-margin-top--4">
              <va-button
                data-testid="back-button"
                label="Back"
                text="Back"
                secondary
                uswds
                onClick={e => {
                  handleGoBack(e);
                }}
              />
              <va-button
                data-testid="continue-button"
                loading={createLoading}
                class="vads-u-margin-left--2"
                label="Confirm appointment"
                text="Confirm appointment"
                uswds
                onClick={onSubmit}
              />
            </div>
          </>
        )}
        {createFailed &&
          !createLoading &&
          (isCommunityCare ? (
            <va-alert
              status="error"
              data-testid="create-error-alert"
              class="vads-u-margin-top--4"
            >
              <h3>We couldn’t schedule this appointment</h3>
              <p className="vads-u-margin-top--1 vads-u-margin-bottom--1">
                We’re sorry. Something went wrong when we tried to schedule your
                appointment. Try again later, or call this provider to schedule
                an appointment. If you have questions about scheduling an
                appointment, or about how many appointments you have left, call
                your facility’s community care office.
              </p>
              <p className="vads-u-margin-top--0 vads-u-margin-bottom--2">
                <FindCommunityCareOfficeLink />
              </p>
            </va-alert>
          ) : (
            <va-alert
              status="error"
              data-testid="create-error-alert"
              class="vads-u-margin-top--4"
            >
              <h3>We couldn’t schedule this appointment</h3>
              <p className="vads-u-margin-top--1 vads-u-margin-bottom--1">
                We’re sorry. Something went wrong when we tried to schedule your
                appointment. Try again later. Or call your facility to help with
                your appointment.
              </p>
              <p
                className="vads-u-margin-top--0 vads-u-margin-bottom--0"
                data-testid="va-facility-info"
              >
                <strong>{providerForReview?.location?.name}</strong>
                <br />
                <strong>Main phone:</strong>{' '}
                <va-telephone contact={providerForReview?.phone} />
                <br />
                <va-telephone contact="711" tty />
              </p>
            </va-alert>
          ))}
      </div>
    </ReferralLayout>
  );
};

ReviewAndConfirm.propTypes = {
  currentReferral: PropTypes.object.isRequired,
};

export default ReviewAndConfirm;
