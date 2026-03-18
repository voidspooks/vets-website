import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom-v5-compat';
import { useSelector } from 'react-redux';
import { selectCernerFacilityIds } from 'platform/site-wide/drupal-static-data/source-files/vamc-ehr/selectors';
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
  isOracleHealthPrescription,
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
} from '../../util/selectors';
import { selectOracleHealthMigrations } from '../../selectors/selectUser';
import {
  DATETIME_FORMATS,
  RX_SOURCE,
  DISPENSE_STATUS,
  dispStatusObjV2,
  medicationsUrls,
} from '../../util/constants';

const MedicationsListCard = ({ rx }) => {
  const isCernerPilot = useSelector(selectCernerPilotFlag);
  const isV2StatusMapping = useSelector(selectV2StatusMappingFlag);
  const useV2StatusMapping = isCernerPilot && isV2StatusMapping;
  const isPendingDispense =
    rx.prescriptionSource === RX_SOURCE.PENDING_DISPENSE;
  const isManagementImprovements = useSelector(
    selectMedicationsManagementImprovementsFlag,
  );
  const isFillInProgress =
    rx.dispStatus === DISPENSE_STATUS.ACTIVE_REFILL_IN_PROCESS ||
    rx.dispStatus === DISPENSE_STATUS.ACTIVE_SUBMITTED;
  const isFirstFill =
    Array.isArray(rx.rxRfRecords) && rx.rxRfRecords.length === 0;
  const isInitialFill = isFillInProgress && isFirstFill;
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
  const latestTrackingStatus = rx?.trackingList?.[0];
  const isRecentlyShipped =
    rx.dispStatus === DISPENSE_STATUS.ACTIVE_SHIPPED &&
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
  const isActiveNoRefills =
    rx.dispStatus === DISPENSE_STATUS.ACTIVE &&
    rx.refillRemaining === 0 &&
    !isNonVaPrescription;
  const showMedImprovementCard =
    isManagementImprovements &&
    (isFillInProgress || isRecentlyShipped || isActiveNoRefills);

  const cardBodyContent = () => {
    if (pendingRenewal || pendingMed) {
      return (
        <>
          <div className="vads-u-display--flex vads-u-margin-top--2">
            <span className="vads-u-flex--auto vads-u-padding-top--1">
              <va-icon icon="info" size={3} aria-hidden="true" />
            </span>
            <p
              className="vads-u-margin-left--2 vads-u-flex--1"
              data-testid="pending-renewal-rx"
              id={`pending-med-content-${rx.prescriptionId}`}
            >
              {pendingRenewal ? (
                <>
                  This is a renewal you requested. Your VA pharmacy is reviewing
                  it now. Details may change.
                </>
              ) : (
                <>
                  This is a new prescription from your provider. Your VA
                  pharmacy is reviewing it now. Details may change.
                </>
              )}
            </p>
          </div>
        </>
      );
    }
    return (
      <>
        {showMedImprovementCard &&
          isFillInProgress && (
            <StatusAlertBanner testId="fill-in-progress-alert" icon="schedule">
              {isInitialFill ? 'Fill' : 'Refill'} in progress.{' '}
              <Link to={medicationsUrls.MEDICATIONS_IN_PROGRESS}>
                Go to in-progress medications
              </Link>
            </StatusAlertBanner>
          )}
        {showMedImprovementCard &&
          isRecentlyShipped && (
            <StatusAlertBanner testId="shipped-alert" icon="local_shipping">
              {isFirstFill ? 'Fill' : 'Refill'} has shipped.{' '}
              {trackingUrl && (
                <a
                  href={trackingUrl}
                  rel="noreferrer"
                  data-testid="get-tracking-info-link"
                >
                  Get tracking info
                </a>
              )}
            </StatusAlertBanner>
          )}
        {rx &&
          (rx.isRefillable || showMedImprovementCard) &&
          rx.refillRemaining >= 0 && (
            <p
              className="vads-u-margin-bottom--0"
              data-testid="rx-refill-remaining"
              data-dd-privacy="mask"
              id={`refill-remaining-${rx.prescriptionId}`}
            >
              {isManagementImprovements
                ? `Refills left: ${rx.refillRemaining}`
                : `Refills remaining: ${rx.refillRemaining}`}
            </p>
          )}
        {rx && <LastFilledInfo {...rx} />}
        {showMedImprovementCard &&
          isActiveNoRefills && (
            <div
              className="vads-u-margin-top--1"
              data-testid="no-refills-left-alert"
            >
              <p className="vads-u-margin-y--0">
                You have no refills left. If you need more, request a renewal.
              </p>
              <SendRxRenewalMessage
                rx={rx}
                isOracleHealth={isOracleHealth}
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
              className="vads-u-margin-top--1p5 vads-u-padding-bottom--1p5 vads-u-border-bottom--1px vads-u-border-color--gray"
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
        {!isManagementImprovements &&
          rxStatus !== 'Unknown' && (
            <p
              id={`status-${rx.prescriptionId}`}
              className="vads-u-margin-top--1p5 vads-u-font-weight--bold"
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
          !showMedImprovementCard && (
            <ExtraDetails
              {...rx}
              page={pageType.LIST}
              isRefillBlocked={isRefillBlocked}
              isRenewalBlocked={isRenewalBlocked}
            />
          )}
      </>
    );
  };

  return (
    <va-card
      class={`no-print rx-card-container ${
        pendingMed || pendingRenewal ? 'pending-med-or-renewal' : ''
      } vads-u-margin-y--2 no-break`}
    >
      <div className="rx-card-details" data-testid="rx-card-info">
        <Link
          id={`card-header-${rx.prescriptionId}`}
          data-dd-privacy="mask"
          data-dd-action-name={
            dataDogActionNames.medicationsListPage.MEDICATION_NAME_LINK_IN_CARD
          }
          data-testid="medications-history-details-link"
          className="vads-u-font-weight--bold"
          to={getPrescriptionDetailUrl(rx)}
        >
          <span data-dd-privacy="mask">
            {rx?.prescriptionName || rx?.orderableItem}
          </span>
        </Link>
        {!isManagementImprovements &&
          !pendingMed &&
          !pendingRenewal &&
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
        {cardBodyContent()}
      </div>
    </va-card>
  );
};

export default MedicationsListCard;

MedicationsListCard.propTypes = {
  rx: PropTypes.object,
};
