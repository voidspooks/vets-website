import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { VaSelect } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { sortOptions } from '../../config';
import { commitSearchQuery, updateSearchQuery } from '../../actions';

/* eslint-disable camelcase */
/* eslint-disable @department-of-veterans-affairs/prefer-button-component */

export const SearchResultsHeader = () => {
  const searchResults = useSelector(state => state.searchResult.searchResults);
  const pagination = useSelector(state => state.searchResult.pagination);
  const searchQuery = useSelector(state => state.searchQuery);
  const { inProgress } = searchQuery;
  const {
    context,
    organization,
    representativeType,
    sortType,
    searchArea,
  } = searchQuery.committedSearchQuery;

  const dispatch = useDispatch();

  const { totalEntries, currentPage, totalPages } = pagination;
  const noResultsFound = !searchResults || !searchResults?.length;

  if (inProgress || !context) {
    return <div style={{ height: '38px' }} />;
  }

  const repFormat = {
    veteran_service_officer: 'Accredited VSO Representative',
    attorney: 'Accredited attorney',
    claim_agents: 'Accredited claims agent',
  };

  const handleNumberOfResults = () => {
    if (noResultsFound) {
      return 'No results found';
    }
    if (totalEntries === 1) {
      return 'Showing 1 result';
    }
    if (totalEntries < 11 && totalEntries > 1) {
      return `Showing ${totalEntries} results`;
    }
    if (totalEntries > 10) {
      const startResultNum = 10 * (currentPage - 1) + 1;
      let endResultNum;

      if (currentPage !== totalPages) {
        endResultNum = 10 * currentPage;
      } else endResultNum = totalEntries;

      return `Showing ${startResultNum} - ${endResultNum} of ${totalEntries} results`;
    }
    return 'Results';
  };

  const options = Object.keys(sortOptions).map(option => (
    <option key={option} value={option}>
      {sortOptions[option]}
    </option>
  ));

  // selection is updated in redux
  const handleSortChange = event => {
    const selectedSortType = event.target.value || sortType;
    const queryUpdateCommitPayload = {
      id: Date.now(),
      page: 1,
      sortType: selectedSortType,
    };

    dispatch(updateSearchQuery(queryUpdateCommitPayload));
    dispatch(commitSearchQuery(queryUpdateCommitPayload));
  };

  return (
    <div className="search-results-header">
      <h2 className="vads-u-margin-y--1">Your search results</h2>
      <div className="vads-u-margin-top--3">
        <p
          data-testid="search-results-subheader"
          id="search-results-subheader"
          className="vads-u-font-family--sans vads-u-font-weight--normal vads-u-margin-bottom--0 vads-u-margin-top--3"
          tabIndex="-1"
        >
          {handleNumberOfResults()} for
          {` `}
          <strong>“{repFormat[representativeType]}”</strong>
          {representativeType === 'veteran_service_officer' &&
            organization && (
              <>
                , <strong>“{organization}”</strong>
              </>
            )}
          {context.repOrgName && (
            <>
              {` `}
              named
              {` `}
              <strong>“{context.repOrgName}”</strong>
            </>
          )}
          {` `}
          {context.location && (
            <>
              within
              {` `}
              <strong>
                {searchArea === 'Show all' ? (
                  '“Show all”'
                ) : (
                  <>“{searchArea} miles”</>
                )}
              </strong>
              {` `}
              of
              {` `}
              <strong>“{context.location}”</strong>{' '}
            </>
          )}
          <>
            sorted by
            {` `}
            <strong>“{sortOptions[sortType]}”</strong>
          </>
        </p>

        {noResultsFound ? (
          <p className="vads-u-margin-bottom--8">
            For better results, try increasing your <strong>search area</strong>
            .
          </p>
        ) : (
          <VaSelect
            className="sort-select vads-u-margin-top--3"
            name="sort"
            value={sortType}
            label="Sort by"
            onVaSelect={handleSortChange}
            uswds
          >
            {options}
          </VaSelect>
        )}
      </div>
    </div>
  );
};

SearchResultsHeader.propTypes = {};

// Only re-render if results or inProgress props have changed
const areEqual = (prevProps, nextProps) => {
  return (
    nextProps.searchResults === prevProps.searchResults &&
    nextProps.inProgress === prevProps.inProgress
  );
};

export default React.memo(SearchResultsHeader, areEqual);
