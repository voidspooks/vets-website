/**
 * Compares two sorted string arrays for equality.
 *
 * @param {string[]} a - First array
 * @param {string[]} b - Second array
 * @returns {boolean} True if arrays are equal
 */
export const arraysEqual = (a, b) =>
  a.length === b.length && a.every((val, i) => val === b[i]);
