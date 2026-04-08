import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { subMonths } from 'date-fns';
import { VaAlert } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import * as SmApi from '../../api/SmApi';
import { Alerts, DefaultFolders, Paths } from '../../util/constants';
import { findCareTeamChangeMessage } from '../../actions/careTeamChanges';
import RouterLink from './RouterLink';

const TOOLTIP_NAME = Alerts.Message.CARE_TEAM_CHANGE_TOOLTIP_NAME;

const CareTeamNameChangeAlert = () => {
  const dispatch = useDispatch();
  const { changes, isLoading, messageId } = useSelector(
    state => state.sm.careTeamChanges,
  );
  const { alertVisible, alertList } = useSelector(state => state.sm.alerts);

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipId, setTooltipId] = useState(null);
  const [recentSentIds, setRecentSentIds] = useState(null);

  // Fetch raw recent recipient IDs from Sent folder (unfiltered by allowedRecipients).
  // After migration, VISTA team IDs are removed from allowedRecipients, so the
  // reducer's recentRecipients filter would exclude them. We need the raw IDs
  // to match against crosswalk vistaTriageGroupId values.
  useEffect(
    () => {
      if (!changes || changes.length === 0) return;

      const fetchRecentSentIds = async () => {
        try {
          const toDateTime = new Date().toISOString();
          const fromDateTime = subMonths(new Date(), 6).toISOString();
          const response = await SmApi.searchFolderAdvanced(
            DefaultFolders.SENT.id,
            { fromDate: fromDateTime, toDate: toDateTime },
          );
          const ids = [
            ...new Set(
              (response?.data || []).map(msg => msg.attributes.recipientId),
            ),
          ];
          setRecentSentIds(ids);
        } catch {
          setRecentSentIds([]);
        }
      };

      fetchRecentSentIds();
    },
    [changes],
  );

  // Filter crosswalk entries to those the user recently sent to, preserving
  // recency order and capping at 4. Falls back to the first 4 crosswalk
  // entries when no recent sent messages match (e.g., user already messaged
  // OH teams, or has no sent history for VISTA teams).
  const filteredChanges = useMemo(
    () => {
      if (!Array.isArray(recentSentIds)) return [];
      const matched = recentSentIds
        .map(id => changes.find(change => change.vistaTriageGroupId === id))
        .filter(Boolean)
        .slice(0, 4);
      if (matched.length > 0) return matched;
      // Fallback: no recent matches — show first 4 crosswalk entries
      return changes.slice(0, 4);
    },
    [changes, recentSentIds],
  );

  // Check if any active error or warning alerts are showing
  const hasActiveErrorOrWarning =
    alertVisible &&
    alertList.some(
      alert =>
        alert.isActive &&
        (alert.alertType === 'error' || alert.alertType === 'warning'),
    );

  // Fetch or create tooltip for dismiss state (local, not Redux)
  useEffect(
    () => {
      if (!filteredChanges || filteredChanges.length === 0) return;

      const fetchOrCreateTooltip = async () => {
        try {
          const tooltips = await SmApi.getTooltipsList();
          const existing = tooltips?.find?.(
            t => t.tooltipName === TOOLTIP_NAME,
          );

          if (existing?.id) {
            setTooltipId(existing.id);
            setTooltipVisible(!existing.hidden);
          } else {
            const created = await SmApi.createTooltip(TOOLTIP_NAME);
            if (created?.id) {
              setTooltipId(created.id);
              setTooltipVisible(!created.hidden);
            }
          }
        } catch {
          // If tooltip API fails, show the alert anyway
          setTooltipVisible(true);
        }
      };

      fetchOrCreateTooltip();
    },
    [filteredChanges],
  );

  // Search inbox for the "Your new care team names" system message
  useEffect(
    () => {
      if (filteredChanges?.length > 0 && messageId === null) {
        dispatch(findCareTeamChangeMessage());
      }
    },
    [filteredChanges, messageId, dispatch],
  );

  const handleClose = useCallback(
    () => {
      setTooltipVisible(false);
      if (tooltipId) {
        SmApi.hideTooltip(tooltipId).catch(() => {});
      }
    },
    [tooltipId],
  );

  if (
    isLoading ||
    !filteredChanges ||
    filteredChanges.length === 0 ||
    !tooltipVisible ||
    hasActiveErrorOrWarning
  ) {
    return null;
  }

  return (
    <VaAlert
      status="warning"
      closeable
      closeBtnAriaLabel="Close notification"
      onCloseEvent={handleClose}
      className="vads-u-margin-bottom--2"
      data-testid="care-team-name-change-alert"
      data-dd-privacy="mask"
      data-dd-action-name="Care team name change alert"
    >
      <h2 slot="headline">
        {Alerts.Message.CARE_TEAM_CHANGE_HEADLINE(filteredChanges.length)}
      </h2>
      <p>{Alerts.Message.CARE_TEAM_CHANGE_INTRO(filteredChanges.length)}</p>
      <ul>
        {filteredChanges.map(change => (
          <li key={change.vistaTriageGroupId}>
            {change.vistaTriageGroupName} is now {change.ohTriageGroupName}
          </li>
        ))}
      </ul>
      <p>{Alerts.Message.CARE_TEAM_CHANGE_FOOTER}</p>
      {messageId !== null && (
        <RouterLink
          href={`${Paths.MESSAGE_THREAD}${messageId}/`}
          text={Alerts.Message.CARE_TEAM_CHANGE_LINK_TEXT}
          data-testid="care-team-change-message-link"
          data-dd-action-name="Read care team change message link"
        />
      )}
    </VaAlert>
  );
};

export default CareTeamNameChangeAlert;
