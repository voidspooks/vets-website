import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { VaAlert } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { focusElement } from '@department-of-veterans-affairs/platform-utilities/ui';
import useOhMigrationAlertMetric from 'platform/mhv/hooks/useOhMigrationAlertMetric';
import useTooltipLifecycle from '../../hooks/useTooltipLifecycle';
import { Alerts, ContactListMigrationAlertContent } from '../../util/constants';
import { filterSchedulesByPhase } from '../../util/helpers';

/**
 * ContactListMigrationAlert displays a warning alert on the Contact List page
 * when the user has facilities in a migration phase defined in
 * ContactListMigrationAlertContent.
 *
 * The component receives migration data as props from the parent container
 * and renders the appropriate variant content (headline, body text,
 * facility list). New variants can be added to ContactListMigrationAlertContent
 * in constants.js without modifying this component.
 *
 * Uses the IPE API via Redux to manage dismissible state, persisting
 * the user's preference to close the alert across sessions.
 *
 * @param {Object} props
 * @param {boolean} props.userFacilityMigratingToOh - Whether the user has a facility migrating to Oracle Health
 * @param {Array} props.migrationSchedules - Array of migration schedule objects
 */
const ContactListMigrationAlert = ({
  userFacilityMigratingToOh,
  migrationSchedules,
}) => {
  // Memoize phase matching and facility dedup so they only recompute when
  // migrationSchedules actually changes, avoiding unnecessary re-renders.
  const {
    matchedPhaseContent,
    facilities,
    bodyTopNode,
    bodyBottomNode,
  } = useMemo(
    () => {
      // Find the first content variant that matches any schedule's current phase
      const contentOptions = Object.values(ContactListMigrationAlertContent);
      const content = contentOptions.find(option => {
        const matching = filterSchedulesByPhase(
          migrationSchedules,
          option.phases,
        );
        return matching.length > 0;
      });

      if (!content)
        return {
          matchedPhaseContent: null,
          facilities: [],
          bodyTopNode: null,
          bodyBottomNode: null,
        };

      // Get schedules matching the found content's phases
      const matchingSchedules = filterSchedulesByPhase(
        migrationSchedules,
        content.phases,
      );

      // Collect all facilities from matching schedules, de-duplicating by facilityId
      const facilitiesMap = new Map();
      matchingSchedules.forEach(schedule => {
        schedule.facilities?.forEach(facility => {
          if (facility.facilityId && facility.facilityName) {
            facilitiesMap.set(facility.facilityId, facility);
          }
        });
      });

      const significantDates = {};

      const alteredMigrationDate = (date, preOrPost, days) => {
        const migrationDateObj = new Date(date);
        if (preOrPost === 'pre') {
          migrationDateObj.setDate(migrationDateObj.getDate() - days);
        } else if (preOrPost === 'post') {
          migrationDateObj.setDate(migrationDateObj.getDate() + days);
        }
        return migrationDateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

      // Get migration date from the first matching schedule
      const scheduleMigrationDate = matchingSchedules[0]?.migrationDate;

      significantDates.tMinus6 = alteredMigrationDate(
        scheduleMigrationDate,
        'pre',
        6,
      );
      significantDates.tPlus2 = alteredMigrationDate(
        scheduleMigrationDate,
        'post',
        2,
      );

      return {
        matchedPhaseContent: content,
        facilities: Array.from(facilitiesMap.values()),
        bodyTopNode: content.bodyTop(significantDates.tMinus6),
        bodyBottomNode: content.bodyBottom(significantDates.tPlus2),
      };
    },
    [migrationSchedules],
  );

  // Only run the IPE lifecycle when the alert could potentially be shown —
  // skip fetch/increment/create if the user has no migrating facility,
  // no matching phase content, or no facilities, to avoid inflating view counts
  // or generating unnecessary PATCH traffic.
  const { tooltipVisible, dismiss } = useTooltipLifecycle(
    Alerts.Message.CONTACT_LIST_MIGRATION_ALERT_TOOLTIP_NAME,
    {
      skip:
        !userFacilityMigratingToOh ||
        !matchedPhaseContent ||
        facilities.length === 0,
    },
  );

  const handleClose = useCallback(
    () => {
      dismiss();
      focusElement(document.querySelector('h1'));
    },
    [dismiss],
  );

  const alertVisible = useMemo(
    () => {
      return (
        tooltipVisible &&
        userFacilityMigratingToOh &&
        !!matchedPhaseContent &&
        facilities.length > 0
      );
    },
    [
      tooltipVisible,
      userFacilityMigratingToOh,
      matchedPhaseContent,
      facilities,
    ],
  );

  useOhMigrationAlertMetric({
    alertName: 'ContactListMigrationAlert',
    isVisible: alertVisible,
    currentPhase: matchedPhaseContent?.phases,
  });

  if (!alertVisible) {
    return null;
  }

  return (
    <VaAlert
      class="vads-u-margin-bottom--2"
      closeBtnAriaLabel="Close notification"
      closeable
      onCloseEvent={handleClose}
      status="warning"
      visible
      data-testid="contact-list-migration-alert"
      data-dd-action-name="Contact List Migration Alert"
    >
      <h2 slot="headline">{matchedPhaseContent.headline}</h2>
      <div>
        {bodyTopNode}
        <ul>
          {facilities.map(facility => (
            <li key={facility.facilityId} data-dd-privacy="mask">
              {facility.facilityName}
            </li>
          ))}
        </ul>
        {bodyBottomNode}
      </div>
    </VaAlert>
  );
};

ContactListMigrationAlert.propTypes = {
  migrationSchedules: PropTypes.arrayOf(
    PropTypes.shape({
      facilities: PropTypes.arrayOf(
        PropTypes.shape({
          facilityId: PropTypes.string,
          facilityName: PropTypes.string,
        }),
      ),
      phases: PropTypes.shape({
        current: PropTypes.string,
      }),
    }),
  ),
  userFacilityMigratingToOh: PropTypes.bool,
};

ContactListMigrationAlert.defaultProps = {
  migrationSchedules: [],
  userFacilityMigratingToOh: false,
};

export default ContactListMigrationAlert;
