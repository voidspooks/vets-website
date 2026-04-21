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
      const recipientId = messages?.[0]?.triageGroup?.triageTeamId;
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
      <va-alert
        status="warning"
        data-testid="migrated-message-alert"
        data-dd-privacy="mask"
        data-dd-action-name="Migrated Message Alert"
      >
        <h2 slot="headline">You can’t send a message in this conversation</h2>
        <div className="vads-u-padding-bottom--1">
          <p className="vads-u-margin-bottom--1p5">
            We’ve updated this care team’s name.
          </p>
          {crosswalkMatch && (
            <p className="vads-u-margin-bottom--1p5">
              {' '}
              <strong>{crosswalkMatch.vistaTriageGroupName}</strong> is now{' '}
              <strong>{crosswalkMatch.ohTriageGroupName}</strong>
            </p>
          )}
          <p className="vads-u-margin-bottom--1p5">
            To contact them, you’ll need to start a new message. Then you can
            select your care team’s updated name.
          </p>
          <RouterLinkAction
            data-dd-action-name={DATADOG_START_NEW_MESSAGE_LINK}
            href={Paths.COMPOSE}
            text="Start a new message"
          />
        </div>
      </va-alert>
    );
  }
  return null;
};

export default MigratedMessageAlert;
