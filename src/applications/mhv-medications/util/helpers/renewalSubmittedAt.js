/**
 * Converts a millisecond timestamp to a Date object.
 * Returns null if the timestamp is falsy.
 *
 * @param {number|null} renewalSubmittedTimestamp - Unix timestamp in milliseconds
 * @returns {Date|null}
 */
export const renewalSubmittedAt = renewalSubmittedTimestamp => {
  if (!renewalSubmittedTimestamp) return null;
  return new Date(renewalSubmittedTimestamp);
};

/**
 * Checks if the renewal was submitted within the last 72 hours.
 *
 * @param {number|null} renewalSubmittedTimestamp - Unix timestamp in milliseconds
 * @returns {boolean}
 */
export const isRenewalWithin72Hours = renewalSubmittedTimestamp => {
  const renewalDate = renewalSubmittedAt(renewalSubmittedTimestamp);
  if (!renewalDate) return false;

  const seventyTwoHoursInMs = 72 * 60 * 60 * 1000;
  return Date.now() - renewalDate.getTime() <= seventyTwoHoursInMs;
};
