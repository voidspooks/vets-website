import { sippableId } from '../index';
import { arraysEqual } from './comparisonUtils';

// A condition that has not been filled out uses the string "blank" as its sippableId.
const checkIfConditionIsBlank = condition => condition === 'blank';

/**
 * Generates sorted sippableId arrays from rated disabilities where view:selected is true.
 *
 * @param {Array} disabilities - Array of rated disability objects
 * @returns {string[]} Sorted array of sippableId strings for selected disabilities
 */
const selectedRatedIds = disabilities =>
  (disabilities || [])
    .filter(d => d['view:selected'])
    .map(d => sippableId(d.name))
    .sort();

/**
 * Generates sorted sippableId arrays for comparison from condition arrays.
 *
 * @param {Array} conditions - Array of condition objects with 'condition' property
 * @returns {string[]} Sorted array of sippableId strings
 */
export const conditionIds = conditions =>
  (conditions || [])
    .map(c => sippableId(c.condition))
    .filter(c => !checkIfConditionIsBlank(c))
    .sort();

/**
 * @type {import('./highImpactFields').HighImpactFieldEntry[]}
 */
const CONDITIONS_V1_HIGH_IMPACT_FIELDS = [
  {
    pathMatcher: pathname => pathname === '/new-disabilities/add',
    field: 'newDisabilities',
    resetToChapter: 1,
    hasImpactfulChange: (oldVal, newVal) =>
      !arraysEqual(conditionIds(oldVal), conditionIds(newVal)),
  },
  {
    pathMatcher: pathname => pathname === '/conditions/summary',
    field: 'newDisabilities',
    resetToChapter: 1,
    hasImpactfulChange: (oldVal, newVal) =>
      !arraysEqual(conditionIds(oldVal), conditionIds(newVal)),
  },
  {
    pathMatcher: pathname => /^\/conditions\/\d+\/condition$/.test(pathname),
    field: 'newDisabilities',
    resetToChapter: 1,
    hasImpactfulChange: (oldVal, newVal) =>
      !arraysEqual(conditionIds(oldVal), conditionIds(newVal)),
  },
];

/**
 * @type {import('./highImpactFields').HighImpactFieldEntry[]}
 */
const CONDITIONS_V2_HIGH_IMPACT_FIELDS = [
  {
    pathMatcher: pathname =>
      /^\/conditions\/\d+\/new-condition$/.test(pathname),
    field: 'newDisabilities',
    resetToChapter: 1,
    hasImpactfulChange: (oldVal, newVal) =>
      !arraysEqual(conditionIds(oldVal), conditionIds(newVal)),
  },
];

export default [
  ...CONDITIONS_V1_HIGH_IMPACT_FIELDS,
  ...CONDITIONS_V2_HIGH_IMPACT_FIELDS,
  {
    pathMatcher: pathname => pathname === '/disabilities/rated-disabilities',
    field: 'ratedDisabilities',
    resetToChapter: 1,
    hasImpactfulChange: (oldVal, newVal) =>
      !arraysEqual(selectedRatedIds(oldVal), selectedRatedIds(newVal)),
  },
  {
    pathMatcher: pathname => pathname === '/claim-type',
    field: 'view:claimType',
    resetToChapter: 1,
    hasImpactfulChange: (oldVal, newVal) =>
      oldVal?.['view:claimingNew'] !== newVal?.['view:claimingNew'] ||
      oldVal?.['view:claimingIncrease'] !== newVal?.['view:claimingIncrease'],
  },
];
