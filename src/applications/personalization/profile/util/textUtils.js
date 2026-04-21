/**
 * Join an array of strings with commas and an Oxford comma for the last item.
 * Examples:
 * [] -> ''
 * ['A'] -> 'A'
 * ['A', 'B'] -> 'A and B'
 * ['A', 'B', 'C'] -> 'A, B, and C'
 */
export function oxfordCommaList(items = []) {
  if (!Array.isArray(items) || items.length < 2) {
    return items.toString();
  }
  if (items.length === 2) return items.join(' and ');

  const head = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];
  return `${head}, and ${last}`;
}

/**
 * Convert a string to initial caps (first letter of each word capitalized).
 * @param {string} text - text to be converted
 * @returns {string}
 */
export const toInitialCaps = text =>
  text.replace(/\b([a-z])/g, char => char.toUpperCase());
