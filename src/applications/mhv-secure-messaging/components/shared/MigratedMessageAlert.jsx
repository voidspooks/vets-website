import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useOhMigrationAlertMetric from 'platform/mhv/hooks/useOhMigrationAlertMetric';
import { hasMessageMigratedToOracleHealth } from '../../util/helpers';
import { Paths } from '../../util/constants';
import RouterLinkAction from './RouterLinkAction';

const DATADOG_START_NEW_MESSAGE_LINK =
  'Start a new message link - in migrated message alert';

// MigratedMessageAlert displays an alert when a message has been migrated to Oracle Health.
const MigratedMessageAlert = () => {
  const messages = useSelector(
    state => state.sm?.threadDetails?.messages || [],
  );
  const crosswalkChanges = useSelector(
    state => state.sm?.careTeamChanges?.changes || [],
  );

  const userMessagePostMigration = useMemo(
    () => {
      return hasMessageMigratedToOracleHealth(messages);
    },
    [messages],
  );

  const crosswalkMatch = useMemo(
    () => {
      if (!userMessagePostMigration || crosswalkChanges.length === 0) {
        return null;
      }
      const recipientId = messages?.[0]?.recipientId;
      return crosswalkChanges.find(
        change => change.vistaTriageGroupId === recipientId,
      );
    },
    [userMessagePostMigration, crosswalkChanges, messages],
  );

  useOhMigrationAlertMetric({
    alertName: 'PostMigrationMessageAlert-OH',
    isVisible: userMessagePostMigration,
    stationNumber: messages?.[0]?.triageGroup?.stationNumber,
    currentPhase: messages?.[0]?.ohMigrationPhase,
  });

  if (userMessagePostMigration) {
    return (
      <va-alert-expandable
        status="warning"
        trigger="You can’t send messages in this conversation"
        data-testid="migrated-message-alert"
        data-dd-privacy="mask"
        data-dd-action-name="Migrated Message Alert Expandable"
      >
        <div className="vads-u-padding-bottom--1">
          <p className="vads-u-margin-bottom--1p5">
            We’ve updated this care team’s name.
            {crosswalkMatch && (
              <>
                {' '}
                <strong>{crosswalkMatch.vistaTriageGroupName}</strong> is now{' '}
                <strong>{crosswalkMatch.ohTriageGroupName}</strong>.
              </>
            )}{' '}
            If you need to contact them, you can call your VA health care
            facility directly.
          </p>
          <va-link
            data-testid="find-facility-link"
            href="https://www.va.gov/find-locations/"
            text="Find your facility's contact information"
          />
          <p className="vads-u-margin-bottom--1p5">
            {' '}
            Or you can send a new message to this care team. To send a message,
            you’ll need to select your care team’s updated name.
          </p>
          <RouterLinkAction
            data-dd-action-name={DATADOG_START_NEW_MESSAGE_LINK}
            href={Paths.COMPOSE}
            text="Start a new message"
          />
        </div>
      </va-alert-expandable>
    );
  }
  return null;
};

export default MigratedMessageAlert;
