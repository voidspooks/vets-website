import PropTypes from 'prop-types';
import React from 'react';

const numbersText = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
];

/** **IMPORTANT:** these must line up with `filterAndSort.sortOptions` */
export const sortOrderSentences = {
  'lastUpdate.newest': 'last updated (newest to oldest)',
  'lastUpdate.oldest': 'last updated (oldest to newest)',
};

/** @typedef {keyof sortOrderSentences} sortOption */

/**
 * @param {{
 * filtersCount?: number,
 * sortOrder: sortOption
 * pageStart?: number,
 * pageEnd?: number,
 * total: number,
 * query: string,
 * }} props
 */
export default function SearchDescriptionNew({
  filtersCount,
  sortOrder,
  pageEnd,
  pageStart,
  total,
  query,
}) {
  const displayCount = total ? `${pageStart}-${pageEnd} of ${total}` : 'no';
  const queryPart = query
    ? ` for "${query}${total && !filtersCount ? ',' : ''}${
        total || filtersCount ? '"' : ''
      }`
    : '';

  const filtersPart =
    filtersCount && filtersCount > 0
      ? ` with ${numbersText[filtersCount - 1] || filtersCount} filter${
          filtersCount === 1 ? '' : 's'
        } applied`
      : '';

  const sortOrderPart = total
    ? `${query && !filtersCount ? '' : ','} sorted by ${
        sortOrderSentences[sortOrder]
      }`
    : '';

  const closingPeriod = query && !total && !filtersCount ? '."' : '.';

  return (
    <div id="search-description">
      <h3 className="vads-u-font-family--sans vads-u-font-size--md">
        Showing {displayCount} results
        {queryPart}
        {filtersPart}
        {sortOrderPart}
        {closingPeriod}
      </h3>
      {!total && (
        <>
          <p data-testid="no-results-suggestion">
            Search 1 of these 3 things to get more results:
          </p>
          <ul>
            <li>Reference number</li>
            <li>Category name</li>
            <li>Original question</li>
          </ul>
        </>
      )}
    </div>
  );
}

SearchDescriptionNew.propTypes = {
  query: PropTypes.string.isRequired,
  sortOrder: PropTypes.oneOf(Object.keys(sortOrderSentences)).isRequired,
  total: PropTypes.number.isRequired,
  filtersCount: PropTypes.number,
  pageEnd: PropTypes.number,
  pageStart: PropTypes.number,
};
