import PropTypes from 'prop-types';
import React from 'react';

/**
 * @param {{
 * categoryFilter?: string,
 * statusFilter?: string,
 * tabName?: 'Business' | 'Personal',
 * pageStart?: number,
 * pageEnd?: number,
 * total: number,
 * query: string,
 * }} props
 */
export default function SearchDescriptionOld({
  categoryFilter,
  pageEnd,
  pageStart,
  statusFilter,
  tabName,
  total,
  query,
}) {
  const displayCount = total ? `${pageStart}-${pageEnd} of ${total}` : 'no';
  const queryPart = query ? `for "${query}" ` : '';

  const tabInfo = tabName ? `" in "${tabName}` : '';

  return (
    <div id="search-description">
      <h3 className="vads-u-font-family--sans vads-u-font-size--md">
        Showing {displayCount} results {queryPart}
        with the status set to "{statusFilter || 'All'}" and the category set to
        "{categoryFilter || 'All'}
        {tabInfo}
        ."
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

SearchDescriptionOld.propTypes = {
  query: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  categoryFilter: PropTypes.string,
  pageEnd: PropTypes.number,
  pageStart: PropTypes.number,
  statusFilter: PropTypes.string,
  tabName: PropTypes.oneOf(['Business', 'Personal']),
};
