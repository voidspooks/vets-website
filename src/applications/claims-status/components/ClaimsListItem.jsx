import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Toggler,
  useFeatureToggle,
} from '~/platform/utilities/feature-toggles';
import {
  getClaimPhaseTypeHeaderText,
  buildDateFormatter,
  getStatusDescription,
  generateClaimTitle,
  getShowEightPhases,
  getFailedSubmissionsWithinLast30Days,
} from '../utils/helpers';
import { getListItemLabel } from '../utils/appeals-v2-helpers';
import ClaimCard from './ClaimCard';
import UploadType2ErrorAlertSlim from './UploadType2ErrorAlertSlim';

const formatDate = buildDateFormatter();

const getLastUpdated = (claim, listCardMeta = {}) => {
  const phaseChangeDate = claim.attributes.claimPhaseDates?.phaseChangeDate;
  const updatedOn = phaseChangeDate ? formatDate(phaseChangeDate) : null;
  if (!updatedOn || updatedOn === 'Invalid date') return null;

  const prefix = listCardMeta.lastUpdatedPrefix || 'Moved to this step on';
  return `${prefix} ${updatedOn}`;
};

const showPreDecisionCommunications = claim => {
  const { decisionLetterSent, status } = claim.attributes;

  return !decisionLetterSent && status !== 'COMPLETE';
};

const CommunicationsItem = ({ children, icon }) => {
  return (
    <li className="vads-u-margin--0">
      <va-icon
        icon={icon}
        size={3}
        class="vads-u-margin-right--1"
        aria-hidden="true"
      />
      {children}
    </li>
  );
};

CommunicationsItem.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.string.isRequired,
};

export default function ClaimsListItem({ claim }) {
  const {
    claimDate,
    claimPhaseDates,
    claimTypeCode,
    claimStatusMeta,
    decisionLetterSent,
    documentsNeeded,
    status,
    evidenceSubmissions = [],
  } = claim.attributes || {};

  const { TOGGLE_NAMES, useToggleValue } = useFeatureToggle();
  const cstClaimPhasesEnabled = useToggleValue(TOGGLE_NAMES.cstClaimPhases);
  const cstMultiClaimProviderEnabled = useToggleValue(
    TOGGLE_NAMES.cstMultiClaimProvider,
  );
  const showEightPhases = getShowEightPhases(
    claimTypeCode,
    cstClaimPhasesEnabled,
  );
  const listCardMeta = claimStatusMeta?.listCard || {};
  const stepContent = showEightPhases
    ? claimStatusMeta?.whatWeAreDoing?.phaseTypeMap?.[
        claimPhaseDates?.phaseType
      ]
    : claimStatusMeta?.whatWeAreDoing?.statusMap?.[status];

  const label = getListItemLabel(claim);
  const showPrecomms = showPreDecisionCommunications(claim);
  const formattedReceiptDate = formatDate(claimDate);
  const humanStatus =
    stepContent?.title ||
    (showEightPhases
      ? getClaimPhaseTypeHeaderText(claimPhaseDates.phaseType)
      : getStatusDescription(status));
  const cardTitle = listCardMeta.title || generateClaimTitle(claim);
  const receivedLabel = listCardMeta.receivedLabel || 'Received on';
  const lastUpdated = getLastUpdated(claim, listCardMeta);
  const showAlert = showPrecomms && documentsNeeded;

  const ariaLabel = `Details for claim submitted on ${formattedReceiptDate}`;
  const provider = cstMultiClaimProviderEnabled
    ? claim.attributes?.provider
    : null;
  const href = provider
    ? `/your-claims/${claim.id}/status?type=${provider}`
    : `/your-claims/${claim.id}/status`;

  // Memoize failed submissions to prevent UploadType2ErrorAlertSlim from receiving
  // a new array reference on every render, which would break its useEffect tracking
  const failedSubmissionsWithinLast30Days = useMemo(
    () => getFailedSubmissionsWithinLast30Days(evidenceSubmissions),
    [evidenceSubmissions],
  );
  const showActionTag =
    showAlert || failedSubmissionsWithinLast30Days.length > 0;

  return (
    <ClaimCard
      title={cardTitle}
      label={label}
      subtitle={`${receivedLabel} ${formattedReceiptDate}`}
    >
      <ul className="communications">
        {decisionLetterSent && (
          <CommunicationsItem icon="mail">
            You have a decision letter ready
          </CommunicationsItem>
        )}
      </ul>
      <div className="card-status">
        {humanStatus && <p>{humanStatus}</p>}
        {lastUpdated && <p>{lastUpdated}</p>}
      </div>
      <Toggler
        toggleName={Toggler.TOGGLE_NAMES.cstAlertImprovementsEvidenceRequests}
      >
        <Toggler.Enabled>
          {showActionTag && (
            <va-tag-status status="warning" text="Action may be needed" />
          )}
        </Toggler.Enabled>
        <Toggler.Disabled>
          <UploadType2ErrorAlertSlim
            claimId={claim.id}
            failedSubmissions={failedSubmissionsWithinLast30Days}
          />
          {showAlert && (
            <va-alert status="info" slim>
              <span className="vads-u-font-weight--bold">
                We requested more information from you:
              </span>{' '}
              Check the claim details to learn more.
              <div className="vads-u-margin-top--2">
                This message will go away when we finish reviewing your
                response.
              </div>
            </va-alert>
          )}
        </Toggler.Disabled>
      </Toggler>
      <ClaimCard.Link ariaLabel={ariaLabel} href={href} />
    </ClaimCard>
  );
}

ClaimsListItem.propTypes = {
  claim: PropTypes.object,
};
