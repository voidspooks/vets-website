import CONDITIONS_HIGH_IMPACT_FIELDS from './conditionsHighImpactFields';

/**
 * @typedef HighImpactFieldEntry - Configuration object that defines a form field whose changes should trigger a side
 * nav chapter reset.
 * @type {Object}
 * @property {function(string): boolean} pathMatcher - Function to match URL paths
 * @property {string} field - Form data field to watch for changes
 * @property {number} resetToChapter - Chapter number to reset side nav to on impactful change. If this is higher than
 * the current chapter at the time of the change, the side nav will reset to the current chapter instead.
 * @property {function(any, any): boolean} hasImpactfulChange - Function to determine if a change is impactful
 */

/**
 * Registry of high-impact fields that should trigger a side nav chapter reset when their values change. Each entry
 * defines which page paths it covers, which formData field to watch, which chapter the side nav should reset to, and
 * how to detect impactful changes.
 *
 * Developer note - It would be ideal to keep this array in order of the side nav chapters, as the first matching entry
 * is used when determining if a page is high-impact.
 *
 * @type {HighImpactFieldEntry[]}
 */
export const HIGH_IMPACT_FIELDS = [...CONDITIONS_HIGH_IMPACT_FIELDS];

/**
 * Determines if a given pathname belongs to any of the high-impact fields and if so, returns
 * the metadata for that field.
 *
 * @param {string} pathname - Current URL pathname
 * @returns {HighImpactFieldEntry|null} Matching registry entry or null
 */
export const findHighImpactFieldEntryForPath = pathname =>
  HIGH_IMPACT_FIELDS.find(entry => entry.pathMatcher(pathname)) || null;
