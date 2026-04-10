/**
 * Determines if a prescription is a first/initial fill (never been dispensed before).
 * This is inferred from an empty rxRfRecords array.
 *
 * @param {Object} prescription - The prescription object
 * @returns {boolean} True if this is an initial fill (no prior dispense history)
 */
export const isInitialFill = prescription =>
  Boolean(
    prescription &&
      Array.isArray(prescription.rxRfRecords) &&
      prescription.rxRfRecords.length === 0,
  );
