import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom-v5-compat';
import { useSelector, useDispatch } from 'react-redux';
import { selectCernerFacilityIds } from 'platform/site-wide/drupal-static-data/source-files/vamc-ehr/selectors';
import { VaAlert } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import ExtraDetails from '../shared/ExtraDetails';
import LastFilledInfo from '../shared/LastFilledInfo';
import SendRxRenewalMessage from '../shared/SendRxRenewalMessage';
import StatusAlertBanner from '../shared/StatusAlertBanner';
import { OracleHealthInCardAlert } from '../shared/OracleHealthTransitionAlerts';
import {
  dateFormat,
  getPrescriptionDetailUrl,
  getRxStatus,
  rxSourceIsNonVA,
  getTrackingUrl,
  isExpirationDatePassed,
  isInitialFill,
  isOracleHealthPrescription,
  isRenewalWithin72Hours,
  RENEWAL_ELIGIBILITY_WINDOW_DAYS,
} from '../../util/helpers';
import { dataDogActionNames, pageType } from '../../util/dataDogConstants';
import {
  shouldBlockRefills,
  shouldBlockRenewals,
} from '../../util/oracleHealthTransition';
import {
  selectMhvMedicationsOracleHealthCutoverFlag,
  selectCernerPilotFlag,
  selectV2StatusMappingFlag,
  selectMedicationsManagementImprovementsFlag,
  selectSecureMessagingMedicationsRenewalRequestFlag,
} from '../../util/selectors';
import { selectOracleHealthMigrations } from '../../selectors/selectUser';
import {
  DATETIME_FORMATS,
  RX_SOURCE,
  DISPENSE_STATUS,
  dispStatusObj,
  dispStatusObjV2,
  medicationsUrls,
  NON_VA_MEDICATION_MESSAGE,
  IN_PROGRESS_FILTER_KEY,
} from '../../util/constants';
import { setFilterOption } from '../../redux/preferencesSlice';

const MedicationsListCard = ({ rx }) => {
  const dispatch = useDispatch();
  const isCernerPilot = useSelector(selectCernerPilotFlag);
  const isV2StatusMapping = useSelector(selectV2StatusMappingFlag);
  const useV2StatusMapping = isCernerPilot && isV2StatusMapping;
  const isPendingDispense =
    rx.prescriptionSource === RX_SOURCE.PENDING_DISPENSE;
  const isMedsImprovements = useSelector(
    selectMedicationsManagementImprovementsFlag,
  );
  const showSecureMessagingRenewalRequest = useSelector(
    selectSecureMessagingMedicationsRenewalRequestFlag,
  );
  const isFillInProgress =
    rx.dispStatus === DISPENSE_STATUS.ACTIVE_REFILL_IN_PROCESS ||
    rx.dispStatus === DISPENSE_STATUS.ACTIVE_SUBMITTED;
  const isInitialFillRx = isInitialFill(rx);
  const isInitialFillInProgress = isFillInProgress && isInitialFillRx;
  const isOracleHealthCutoverEnabled = useSelector(
    selectMhvMedicationsOracleHealthCutoverFlag,
  );
  const migratingFacilities = useSelector(selectOracleHealthMigrations);
  const isRefillBlocked = shouldBlockRefills({
    prescription: rx,
    isFeatureFlagEnabled: isOracleHealthCutoverEnabled,
    migrations: migratingFacilities,
  });
  const isRenewalBlocked = shouldBlockRenewals({
    prescription: rx,
    isFeatureFlagEnabled: isOracleHealthCutoverEnabled,
    migrations: migratingFacilities,
  });
  const pendingMed =
    isPendingDispense &&
    (useV2StatusMapping
      ? rx?.dispStatus === dispStatusObjV2.inprogress &&
        rx?.refillStatus?.toLowerCase() === 'neworder'
      : rx?.dispStatus === DISPENSE_STATUS.NEW_ORDER);
  const pendingRenewal =
    isPendingDispense &&
    (useV2StatusMapping
      ? rx?.dispStatus === dispStatusObjV2.inprogress &&
        rx?.refillStatus?.toLowerCase() === 'renew'
      : rx?.dispStatus === DISPENSE_STATUS.RENEW);
  const showPendingCardImprovements =
    isMedsImprovements && (pendingMed || pendingRenewal);
  const latestTrackingStatus = rx?.trackingList?.[0];
  const isRecentlyShipped =
    rx.dispStatus === dispStatusObj.active &&
    rx.isTrackable &&
    Boolean(latestTrackingStatus);
  const trackingUrl =
    getTrackingUrl(
      latestTrackingStatus?.carrier,
      latestTrackingStatus?.trackingNumber,
    ) || latestTrackingStatus?.trackingNumber;
  const isNonVaPrescription = rxSourceIsNonVA(rx);
  const cernerFacilityIds = useSelector(selectCernerFacilityIds);
  const isOracleHealth = isOracleHealthPrescription(rx, cernerFacilityIds);
  const rxStatus = getRxStatus(rx);
  const isOnHold = rx.dispStatus === dispStatusObj.onHold;
  const isUnknownStatus =
    rxStatus === dispStatusObj.unknown ||
    (useV2StatusMapping && rxStatus === dispStatusObjV2.statusNotAvailable);
  const isDiscontinued = rx.dispStatus === dispStatusObj.discontinued;
  const isTransferred = rx.dispStatus === dispStatusObj.transferred;
  const isActiveNoRefills =
    rx.dispStatus === DISPENSE_STATUS.ACTIVE &&
    rx.refillRemaining === 0 &&
    !isNonVaPrescription;
  const expirationDate = rx.expirationDate ? new Date(rx.expirationDate) : null;
  const isExpiredOver120Days =
    expirationDate &&
    expirationDate <
      new Date(
        Date.now() - RENEWAL_ELIGIBILITY_WINDOW_DAYS * 24 * 60 * 60 * 1000,
      );
  const isNonRenewableExpired =
    showSecureMessagingRenewalRequest &&
    (rx.dispStatus === dispStatusObj.expired ||
      rx.dispStatus === dispStatusObj.discontinued) &&
    !rx.isRefillable &&
    !rx.isRenewable &&
    isExpiredOver120Days;
  const isExpiredRenewable =
    rx.dispStatus === DISPENSE_STATUS.EXPIRED &&
    rx.isRenewable &&
    rx.refillRemaining === 0 &&
    !isNonVaPrescription &&
    showSecureMessagingRenewalRequest;
  const isExpiredNoRenewalFlow =
    rx.dispStatus === DISPENSE_STATUS.EXPIRED &&
    !isExpiredRenewable &&
    isExpirationDatePassed(rx.expirationDate) &&
    !isNonVaPrescription;
  const showMedImprovementCard =
    isMedsImprovements &&
    (isFillInProgress ||
      isRecentlyShipped ||
      isActiveNoRefills ||
      isExpiredRenewable ||
      isExpiredNoRenewalFlow ||
      isNonRenewableExpired);

  const renewalWithin72Hours = isRenewalWithin72Hours(
    rx.renewalSubmittedTimestamp,
  );

  const isRecentlyRenewed =
    (isActiveNoRefills || isExpiredRenewable) &&
    renewalWithin72Hours &&
    showSecureMessagingRenewalRequest;

  const renderNonVaCard = () => (
    <>
      <p
        className="rx-card-section-header"
        data-testid="non-va-medication-label"
      >
        Non-VA medication
      </p>
      <p className="rx-card-paragraph" data-testid="non-VA-prescription">
        {NON_VA_MEDICATION_MESSAGE}
      </p>
    </>
  );

  const renderPendingCard = () => (
    <p
      className="rx-card-section-content"
      data-testid="pending-renewal-rx"
      id={`pending-med-content-${rx.prescriptionId}`}
    >
      {pendingRenewal ? (
        <>
          This is a renewal you requested. Your VA pharmacy is reviewing it now.
          Details may change.
        </>
      ) : (
        <>
          This is a new prescription from your provider. Your VA pharmacy is
          reviewing it now. Details may change.
        </>
      )}
    </p>
  );

  const renderTransferredCard = () => (
    <p className="rx-card-section-content" data-testid="transferred-content">
      This is a previous record of your medication. If you need a refill, find
      the current medication in your medications list. If you don’t have a
      current one, contact your provider.
    </p>
  );

  const renderExpiredCard = () => (
    <>
      <LastFilledInfo {...rx} />
      <p className="rx-card-status" data-testid="expired-status">
        {rxStatus}
      </p>
      <p className="rx-card-paragraph" data-testid="expired-no-renewal-content">
        This prescription is too old to refill. If you need more, request a
        renewal.
      </p>
    </>
  );

  const cardBodyContent = () => {
    if (isMedsImprovements && isNonVaPrescription) return renderNonVaCard();
    if (isMedsImprovements && isTransferred) return renderTransferredCard();
    if (isMedsImprovements && isNonRenewableExpired)
      return (
        <>
          <LastFilledInfo {...rx} />
          <p
            className="rx-card-status"
            data-testid="rxStatus"
            data-dd-privacy="mask"
          >
            Expired
          </p>
          <p
            className="rx-card-expired-content"
            data-testid="expired-non-renewable"
            data-dd-privacy="mask"
          >
            This prescription is too old to refill. If you need more,{' '}
            <SendRxRenewalMessage
              rx={rx}
              isOracleHealth={isOracleHealth}
              fallbackContent={
                <a
                  href={medicationsUrls.RENEW_PRESCRIPTIONS_URL}
                  data-testid="learn-to-renew-prescriptions-link"
                >
                  request a renewal
                </a>
              }
            />
          </p>
        </>
      );
    if (isMedsImprovements && isExpiredNoRenewalFlow)
      return renderExpiredCard();
    if (showPendingCardImprovements) return renderPendingCard();

    return (
      <>
        {isMedsImprovements &&
          isFillInProgress && (
            <StatusAlertBanner testId="fill-in-progress-alert" icon="schedule">
              {isInitialFillInProgress ? 'Fill' : 'Refill'} in progress.{' '}
              <Link
                to={medicationsUrls.subdirectories.LIST}
                onClick={() =>
                  dispatch(setFilterOption(IN_PROGRESS_FILTER_KEY))
                }
              >
                Review prescription status
              </Link>
            </StatusAlertBanner>
          )}
        {isMedsImprovements &&
          isRecentlyShipped && (
            <StatusAlertBanner testId="shipped-alert" icon="local_shipping">
              {isInitialFillRx ? 'Fill' : 'Refill'} has shipped.{' '}
              {trackingUrl ? (
                <a
                  href={trackingUrl}
                  rel="noreferrer"
                  data-testid="get-tracking-info-link"
                >
                  Get tracking info
                </a>
              ) : (
                <Link to={getPrescriptionDetailUrl(rx)}>Get tracking info</Link>
              )}
            </StatusAlertBanner>
          )}
        {rx &&
          (rx.isRefillable || showMedImprovementCard) &&
          rx.refillRemaining >= 0 &&
          !(isMedsImprovements && isUnknownStatus) && (
            <p
              className="rx-card-section-content"
              data-testid="rx-refill-remaining"
              data-dd-privacy="mask"
              id={`refill-remaining-${rx.prescriptionId}`}
            >
              {isMedsImprovements
                ? `Refills left: ${rx.refillRemaining}`
                : `Refills remaining: ${rx.refillRemaining}`}
            </p>
          )}
        {rx &&
          !(isMedsImprovements && isOnHold) &&
          !(isMedsImprovements && isUnknownStatus) && (
            <LastFilledInfo {...rx} />
          )}
        {showMedImprovementCard &&
          !isRecentlyRenewed &&
          (isActiveNoRefills || isExpiredRenewable) && (
            <div
              className="rx-card-section-content"
              data-testid="no-refills-left-alert"
            >
              <p className="rx-card-paragraph">
                {isOracleHealth &&
                rx.isRenewable &&
                showSecureMessagingRenewalRequest
                  ? 'You have no refills left. If you need more, request a renewal.'
                  : 'You can’t refill this prescription. If you need more, send a secure message to your care team.'}
              </p>
              <SendRxRenewalMessage
                rx={rx}
                isOracleHealth={isOracleHealth}
                hideExpiredMessage
                fallbackContent={
                  <a
                    href={medicationsUrls.RENEW_PRESCRIPTIONS_URL}
                    data-testid="learn-to-renew-prescriptions-link"
                  >
                    Learn how to renew prescriptions
                  </a>
                }
              />
            </div>
          )}
        {latestTrackingStatus &&
          !showMedImprovementCard && (
            <p
              className="rx-card-shipped-info"
              data-testid="rx-card-details--shipped-on"
              data-dd-privacy="mask"
            >
              <va-icon icon="local_shipping" size={3} aria-hidden="true" />
              <span
                className="vads-u-margin-left--2"
                data-testid="shipping-date"
                data-dd-privacy="mask"
              >
                Shipped on{' '}
                {dateFormat(
                  latestTrackingStatus.completeDateTime,
                  DATETIME_FORMATS.longMonthDate,
                )}
              </span>
            </p>
          )}
        {(!isMedsImprovements || isDiscontinued) &&
          rxStatus !== 'Unknown' && (
            <p
              id={`status-${rx.prescriptionId}`}
              className={
                isMedsImprovements && isDiscontinued
                  ? 'rx-card-status-discontinued'
                  : 'rx-card-status'
              }
              data-testid="rxStatus"
              data-dd-privacy="mask"
            >
              {rxStatus}
            </p>
          )}
        {isRefillBlocked &&
          rx.isRefillable && (
            <OracleHealthInCardAlert
              stationNumber={rx.stationNumber}
              prescriptionId={rx.prescriptionId}
            />
          )}
        {rx &&
          !showMedImprovementCard &&
          (() => {
            const extraDetailsContent = (
              <ExtraDetails
                {...rx}
                page={pageType.LIST}
                isRefillBlocked={isRefillBlocked}
                isRenewalBlocked={isRenewalBlocked}
              />
            );

            if (isMedsImprovements && (isOnHold || isUnknownStatus)) {
              return (
                <div className="rx-card-section-content">
                  {extraDetailsContent}
                </div>
              );
            }
            return extraDetailsContent;
          })()}
      </>
    );
  };

  const displayGrayBackground =
    isMedsImprovements &&
    (isDiscontinued ||
      isTransferred ||
      isNonRenewableExpired ||
      isExpiredNoRenewalFlow);

  return (
    <va-card
      background={displayGrayBackground || undefined}
      style={
        displayGrayBackground
          ? { border: '1px solid var(--vads-color-gray-medium)' }
          : undefined
      }
      class={`no-print rx-card-container ${
        showPendingCardImprovements ? 'pending-med-or-renewal' : ''
      }${
        displayGrayBackground
          ? ' vads-u-border--1px vads-u-border-color--gray-medium'
          : ''
      } vads-u-margin-y--2 no-break`}
    >
      <div className="rx-card-details" data-testid="rx-card-info">
        {isRecentlyRenewed && (
          <VaAlert
            data-testid="rx-details-refill-alert"
            status="info"
            className="vads-u-margin-bottom--2"
            uswds
          >
            <p>
              You may have already requested a renewal. Check your sent messages
              for a renewal request.
            </p>
            <p className="vads-u-margin-bottom--0">
              <va-link
                className="vads-u-margin-bottom--0"
                href="/my-health/secure-messages/sent/"
                text="Go to your sent messages"
                data-testid="go-to-sent-messages-alert-link"
              />
            </p>
          </VaAlert>
        )}
        <Link
          id={`card-header-${rx.prescriptionId}`}
          data-dd-privacy="mask"
          data-dd-action-name={
            dataDogActionNames.medicationsListPage.MEDICATION_NAME_LINK_IN_CARD
          }
          data-testid="medications-list-details-link"
          className="vads-u-font-weight--bold"
          to={getPrescriptionDetailUrl(rx)}
        >
          <span data-dd-privacy="mask">
            {rx?.prescriptionName || rx?.orderableItem}
          </span>
        </Link>
        {!isMedsImprovements &&
          rxStatus !== 'Unknown' &&
          !isNonVaPrescription && (
            <p
              data-testid="rx-number"
              data-dd-privacy="mask"
              id={`prescription-number-${rx.prescriptionId}`}
            >
              Prescription number:{' '}
              <span data-dd-privacy="mask">
                {rx.prescriptionNumber || 'Not available'}
              </span>
            </p>
          )}
        {isMedsImprovements &&
          !isNonVaPrescription &&
          !isUnknownStatus && (
            <p
              data-testid="rx-number"
              data-dd-privacy="mask"
              id={`prescription-number-${rx.prescriptionId}`}
              className="rx-card-rx-number"
            >
              Rx #: {rx.prescriptionNumber || 'Not available'}
            </p>
          )}
        {cardBodyContent()}
      </div>
    </va-card>
  );
};

export default MedicationsListCard;

MedicationsListCard.propTypes = {
  rx: PropTypes.object,
};
