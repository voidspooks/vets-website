import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { dataDogLogger } from 'platform/monitoring/Datadog';

/**
 * Logs a Datadog browser-log metric exactly once per mount when the alert
 * becomes visible. Uses a ref guard so re-renders do not duplicate the log.
 *
 * Automatically includes facilityIds from the user profile. Callers on
 * Thread / Reply pages may pass an optional stationNumber.
 *
 * @param {Object}  options
 * @param {string}  options.alertName     — human-readable alert identifier
 * @param {boolean} options.isVisible     — whether the alert is currently rendered
 * @param {string}  [options.stationNumber] — station number from the context (message thread, recipient, medication, medical record etc.)
 * @param {string|string[]} [options.currentPhase]  — current migration phase (e.g. p1, p4)
 */
const useOhMigrationAlertMetric = ({
  alertName,
  isVisible,
  stationNumber,
  currentPhase,
} = {}) => {
  const hasLogged = useRef(false);
  const facilities = useSelector(state => state.user.profile?.facilities);

  useEffect(
    () => {
      if (isVisible && !hasLogged.current) {
        const facilityIds = facilities?.map(f => f.facilityId) || [];
        const logOptions = {
          message: `OH Migration Alert Rendered: ${alertName}`,
          attributes: {
            alertName,
            facilityIds,
            ...(stationNumber ? { stationNumber } : {}),
            ...(currentPhase ? { currentPhase } : {}),
          },
          status: 'info',
        };

        dataDogLogger(logOptions);
        hasLogged.current = true;
      }
    },
    [isVisible, alertName, stationNumber, currentPhase, facilities],
  );
};

export default useOhMigrationAlertMetric;
