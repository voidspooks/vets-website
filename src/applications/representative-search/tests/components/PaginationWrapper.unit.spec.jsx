import React from 'react';
import { expect } from 'chai';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import PaginationWrapper from '../../components/results/PaginationWrapper';

const handlePageSelect = () => {};

describe('PaginationWrapper', () => {
  const mockStore = configureMockStore([thunk]);
  let store;

  it('Should render when all required props are provided', () => {
    const currentPage = 1;
    const totalPages = 2;
    store = mockStore({
      searchResult: {
        pagination: { currentPage, totalPages },
      },
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <PaginationWrapper handlePageSelect={handlePageSelect} />
      </Provider>,
    );

    expect(getByTestId('pagination-container')).to.exist;
  });

  it('Should not render if currentPage is undefined', () => {
    const totalPages = 2;
    const results = [1, 2];
    const currentPage = null;

    store = mockStore({
      searchResult: {
        pagination: { currentPage, totalPages, results },
      },
    });
    const { queryByTestId } = render(
      <Provider store={store}>
        <PaginationWrapper handlePageSelect={handlePageSelect} />
      </Provider>,
    );

    expect(queryByTestId('pagination-container')).not.to.exist;
  });
});
