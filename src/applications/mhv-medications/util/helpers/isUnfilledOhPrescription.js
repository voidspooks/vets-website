import { isOracleHealthPrescription } from './isOracleHealthPrescription';

/**
 * Determines if a prescription is an Oracle Health medication that is active
 * but has never been dispensed (original fill has not been filled yet).
 *
 * When this is true, the user cannot request a refill and we should show
 * additional context explaining why.
 *
 * @param {Object} rx - The prescription object
 * @param {Array} cernerFacilityIds - Array of Cerner facility IDs
 * @returns {boolean} True if this is an unfilled Oracle Health prescription
 */
export const isUnfilledOhPrescription = (rx, cernerFacilityIds = []) => {
  if (!rx) return false;
  if (rx.isRefillable) return false;
  if (!isOracleHealthPrescription(rx, cernerFacilityIds)) return false;
  if (rx.dispStatus !== 'Active') return false;

  const hasOriginalDispense = !!rx.dispensedDate || !!rx.sortedDispensedDate;
  const hasRefillDispense =
    Array.isArray(rx.rxRfRecords) &&
    rx.rxRfRecords.some(
      record => record.dispensedDate || record.whenHandedOver,
    );

  return !hasOriginalDispense && !hasRefillDispense;
};
