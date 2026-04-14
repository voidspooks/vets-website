import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { SearchResultsHeader } from '../../components/results/SearchResultsHeader';
import testDataRepresentative from '../../constants/mock-representative-v0.json';
import testDataResponse from '../../constants/mock-representative-data.json';

describe('SearchResultsHeader', () => {
  const mockStore = configureMockStore([thunk]);

  const buildStore = (query, searchResults, pagination) =>
    mockStore({
      featureToggles: {
        // eslint-disable-next-line camelcase
        find_a_representative_flagging_feature_enabled: true,
      },
      searchQuery: {
        ...query,
        committedSearchQuery: query,
      },
      searchResult: {
        searchResults,
        pagination,
      },
    });

  it('should not render header if context is not provided', () => {
    const store = buildStore(
      {
        inProgress: false,
        searchArea: '50',
      },
      [],
      { totalEntries: 0 },
    );

    const { queryByTestId } = render(
      <Provider store={store}>
        <SearchResultsHeader />
      </Provider>,
    );

    expect(queryByTestId('search-results-subheader')).not.to.exist;
  });

  it('should render header if results are empty and context exists', () => {
    const store = buildStore(
      {
        representativeType: 'attorney',
        inProgress: false,
        context: { location: '11111' },
        searchArea: '50',
        sortType: 'distance_asc',
      },
      [],
      { totalEntries: 0 },
    );

    const { getByTestId } = render(
      <Provider store={store}>
        <SearchResultsHeader />
      </Provider>,
    );

    const expectedString =
      'No results found for “Accredited attorney” within “50 miles” of “11111” sorted by “Distance (closest to farthest)”';
    const actualString = getByTestId('search-results-subheader').textContent;

    // Remove whitespaces and special characters
    const cleanExpected = expectedString.replace(/\s+/g, '');
    const cleanActual = actualString.replace(/\s+/g, '');

    expect(cleanActual).to.equal(cleanExpected);
  });

  it('should not render header if inProgress is true', () => {
    const store = buildStore(
      {
        inProgress: true,
        searchArea: '50',
      },
      [{}],
      {
        totalEntries: 3,
        currentPage: 1,
        totalPages: 1,
      },
    );

    const { queryByTestId } = render(
      <Provider store={store}>
        <SearchResultsHeader />
      </Provider>,
    );
    expect(queryByTestId('search-results-subheader')).not.to.exist;
  });

  it('should render header if results exist', () => {
    const store = buildStore(
      {
        representativeType: 'attorney',
        inProgress: false,
        context: { location: 'new york' },
        searchArea: '50',
        sortType: 'distance_asc',
      },
      [{}],
      { totalEntries: 5 },
    );

    const { getByTestId } = render(
      <Provider store={store}>
        <SearchResultsHeader />
      </Provider>,
    );

    expect(getByTestId('search-results-subheader')).to.exist;
  });

  it('should render "Showing 1 result" if totalEntries === 1', () => {
    const store = buildStore(
      {
        representativeType: 'attorney',
        inProgress: false,
        context: { location: 'new york' },
        searchArea: '50',
        sortType: 'distance_asc',
      },
      [testDataRepresentative],
      { totalEntries: 1 },
    );

    const { getByTestId } = render(
      <Provider store={store}>
        <SearchResultsHeader />
      </Provider>,
    );

    const expectedString =
      'Showing 1 result for “Accredited attorney” within “50 miles” of “new york” sorted by “Distance (closest to farthest)”';
    const actualString = getByTestId('search-results-subheader').textContent;

    // Remove whitespaces and special characters
    const cleanExpected = expectedString.replace(/\s+/g, '');
    const cleanActual = actualString.replace(/\s+/g, '');

    expect(cleanActual).to.equal(cleanExpected);
  });

  it('endResultNum should equal totalEntries when totalEntries > 10 and currentPage does equal totalPages', () => {
    const store = buildStore(
      {
        representativeType: 'attorney',
        inProgress: false,
        context: { location: 'new york' },
        searchArea: '50',
        sortType: 'distance_asc',
      },
      testDataResponse.data,
      { totalEntries: 12, currentPage: 2, totalPages: 2 },
    );

    const { getByTestId } = render(
      <Provider store={store}>
        <SearchResultsHeader />
      </Provider>,
    );

    const expectedString =
      'Showing 11 - 12 of 12 results for “Accredited attorney” within “50 miles” of “new york” sorted by “Distance (closest to farthest)”';
    const actualString = getByTestId('search-results-subheader').textContent;

    // Remove whitespaces and special characters
    const cleanExpected = expectedString.replace(/\s+/g, '');
    const cleanActual = actualString.replace(/\s+/g, '');

    expect(cleanActual).to.equal(cleanExpected);
  });

  it('should render "Showing _ results" if totalEntries is between 1 and 11', () => {
    const store = buildStore(
      {
        representativeType: 'attorney',
        inProgress: false,
        context: { location: 'new york' },
        searchArea: '50',
        sortType: 'distance_asc',
      },
      testDataResponse.data,
      { totalEntries: 5 },
    );

    const { getByTestId } = render(
      <Provider store={store}>
        <SearchResultsHeader />
      </Provider>,
    );
    const expectedString =
      'Showing 5 results for “Accredited attorney” within “50 miles” of “new york” sorted by “Distance (closest to farthest)”';
    const actualString = getByTestId('search-results-subheader').textContent;

    // Remove whitespaces and special characters
    const cleanExpected = expectedString.replace(/\s+/g, '');
    const cleanActual = actualString.replace(/\s+/g, '');

    expect(cleanActual).to.equal(cleanExpected);
  });

  it('should render "Showing {startResultNum} - {endResultNum} of {totalEntries} results" if totalEntries is 11 or higher', () => {
    const store = buildStore(
      {
        representativeType: 'attorney',
        inProgress: false,
        context: { location: 'new york' },
        searchArea: '50',
        sortType: 'distance_asc',
      },
      testDataResponse.data,
      { totalEntries: 12, currentPage: 1, totalPages: 2 },
    );

    const { getByTestId } = render(
      <Provider store={store}>
        <SearchResultsHeader />
      </Provider>,
    );

    const expectedString =
      'Showing 1-10 of 12 results for “Accredited attorney” within “50 miles” of “new york” sorted by “Distance (closest to farthest)”';
    const actualString = getByTestId('search-results-subheader').textContent;

    // Remove whitespaces and special characters
    const cleanExpected = expectedString.replace(/\s+/g, '');
    const cleanActual = actualString.replace(/\s+/g, '');

    expect(cleanActual).to.equal(cleanExpected);
  });

  it('should render endResultNum as 10 * currentPage if not on final page', () => {
    const store = buildStore(
      {
        representativeType: 'claim_agents',
        inProgress: false,
        context: { location: 'new york' },
        searchArea: '50',
        sortType: 'distance_asc',
      },
      testDataResponse.data,
      { totalEntries: 25, currentPage: 2, totalPages: 3 },
    );

    const { getByTestId } = render(
      <Provider store={store}>
        <SearchResultsHeader />
      </Provider>,
    );

    const expectedString =
      'Showing 11 - 20 of 25 results for “Accredited claims agent” within “50 miles” of “new york” sorted by “Distance (closest to farthest)”';
    const actualString = getByTestId('search-results-subheader').textContent;

    // Remove whitespaces and special characters
    const cleanExpected = expectedString.replace(/\s+/g, '');
    const cleanActual = actualString.replace(/\s+/g, '');

    expect(cleanActual).to.equal(cleanExpected);
  });

  it('should render results where sort option is last name (non-officer)', () => {
    const store = buildStore(
      {
        representativeType: 'claim_agents',
        sortType: 'last_name_asc',
        inProgress: false,
        context: { location: 'new york' },
        searchArea: '50',
      },
      testDataResponse.data,
      { totalEntries: 25, currentPage: 2, totalPages: 3 },
    );

    const { getByTestId } = render(
      <Provider store={store}>
        <SearchResultsHeader />
      </Provider>,
    );

    const expectedString =
      'Showing 11 - 20 of 25 results for “Accredited claims agent” within “50 miles” of “new york” sorted by “Last name (A-Z)”';
    const actualString = getByTestId('search-results-subheader').textContent;

    // Remove whitespaces and special characters
    const cleanExpected = expectedString.replace(/\s+/g, '');
    const cleanActual = actualString.replace(/\s+/g, '');

    expect(cleanActual).to.equal(cleanExpected);
  });

  it('should render organization name if vso is selected and organization value exists', () => {
    const store = buildStore(
      {
        representativeType: 'veteran_service_officer',
        organization: 'American Legion',
        inProgress: false,
        context: { location: 'new york' },
        searchArea: '50',
        sortType: 'distance_asc',
      },
      testDataResponse.data,
      { totalEntries: 5 },
    );

    const { getByTestId } = render(
      <Provider store={store}>
        <SearchResultsHeader />
      </Provider>,
    );
    const expectedString =
      'Showing 5 results for “Accredited VSO Representative”, “American Legion” within “50 miles” of“ new york” sorted by “Distance (closest to farthest)”';
    const actualString = getByTestId('search-results-subheader').textContent;

    // Remove whitespaces and special characters
    const cleanExpected = expectedString.replace(/\s+/g, '');
    const cleanActual = actualString.replace(/\s+/g, '');

    expect(cleanActual).to.equal(cleanExpected);
  });

  it('should not render organization name if vso is selected and organization value is empty', () => {
    const store = buildStore(
      {
        representativeType: 'veteran_service_officer',
        organization: '',
        inProgress: false,
        context: { location: 'new york' },
        searchArea: '50',
        sortType: 'distance_asc',
      },
      testDataResponse.data,
      { totalEntries: 5 },
    );

    const { getByTestId } = render(
      <Provider store={store}>
        <SearchResultsHeader />
      </Provider>,
    );
    const expectedString =
      'Showing 5 results for “Accredited VSO Representative” within “50 miles” of “new york” sorted by “Distance (closest to farthest)”';
    const actualString = getByTestId('search-results-subheader').textContent;

    // Remove whitespaces and special characters
    const cleanExpected = expectedString.replace(/\s+/g, '');
    const cleanActual = actualString.replace(/\s+/g, '');

    expect(cleanActual).to.equal(cleanExpected);
  });

  it('should not render organization name if vso is not selected and organization value exists', () => {
    const store = buildStore(
      {
        representativeType: 'attorney',
        organization: 'American Legion',
        inProgress: false,
        context: { location: 'new york' },
        searchArea: '50',
        sortType: 'distance_asc',
      },
      testDataResponse.data,
      { totalEntries: 5 },
    );

    const { getByTestId } = render(
      <Provider store={store}>
        <SearchResultsHeader />
      </Provider>,
    );
    const expectedString =
      'Showing 5 results for “Accredited attorney” within “50 miles” of “new york” sorted by “Distance (closest to farthest)”';
    const actualString = getByTestId('search-results-subheader').textContent;

    // Remove whitespaces and special characters
    const cleanExpected = expectedString.replace(/\s+/g, '');
    const cleanActual = actualString.replace(/\s+/g, '');

    expect(cleanActual).to.equal(cleanExpected);
  });
});
