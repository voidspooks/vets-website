import { dispStatusObj, dispStatusObjV2 } from '../constants';

/**
 * Number of days a prescription remains eligible for SM renewal request
 * after reaching Expired/Inactive/Discontinued status.
 */
export const RENEWAL_ELIGIBILITY_WINDOW_DAYS = 120;

/**
 * Determines if a prescription has an Expired/Inactive/Discontinued status
 * and its expiration date is within the last 120 days (inclusive).
 *
 * Used to determine eligibility for the pre-populated SM renewal flow (S10).
 *
 * @param {Object} prescription - The prescription object
 * @param {string} prescription.dispStatus - The prescription's display status
 * @param {string} prescription.expirationDate - The prescription's expiration date (ISO string)
 * @returns {boolean} True if expired/inactive/discontinued within 120 days
 */
export const isExpiredWithin120Days = prescription => {
  const { dispStatus, expirationDate } = prescription;

  const isExpiredOrInactiveStatus =
    dispStatus === dispStatusObj.expired ||
    dispStatus === dispStatusObj.discontinued ||
    dispStatus === dispStatusObjV2.expired ||
    dispStatus === dispStatusObjV2.inactive;

  if (!isExpiredOrInactiveStatus || !expirationDate) {
    return false;
  }

  const expirationDateObj = new Date(expirationDate);

  // Validate the date is valid
  if (Number.isNaN(expirationDateObj.getTime())) {
    return false;
  }

  const currentDate = new Date();
  const cutoffDate = new Date(
    currentDate.getTime() -
      RENEWAL_ELIGIBILITY_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );

  // Expiration must be within the window (inclusive) and not in the future
  return expirationDateObj >= cutoffDate && expirationDateObj <= currentDate;
};
