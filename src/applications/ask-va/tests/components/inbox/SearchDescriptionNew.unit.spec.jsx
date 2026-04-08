import { expect } from 'chai';
import { render } from '@testing-library/react';
import React from 'react';
import { filterAndSort } from 'applications/ask-va/utils/inbox';
import SearchDescriptionNew from '../../../components/inbox/SearchDescriptionNew';

describe('SearchDescriptionNew', () => {
  const { sortOptions } = filterAndSort;
  it('renders correct sentence with default settings', () => {
    const sentence =
      'Showing 1-5 of 5 results, sorted by last updated (newest to oldest).';
    const view = render(
      <SearchDescriptionNew
        sortOrder={sortOptions.lastUpdate.newest}
        total={5}
        pageStart={1}
        pageEnd={5}
      />,
    );
    const heading = view.getByRole('heading', { level: 3, name: /showing/i });
    expect(heading.textContent).to.equal(sentence);

    expect(view.queryByTestId('no-results-suggestion')).to.not.exist;
  });

  it('renders correct sentence with filters count written out', () => {
    const sentence =
      'Showing 5-8 of 10 results with two filters applied, sorted by last updated (newest to oldest).';
    const view = render(
      <SearchDescriptionNew
        filtersCount={2}
        sortOrder={sortOptions.lastUpdate.newest}
        total={10}
        pageStart={5}
        pageEnd={8}
      />,
    );
    const heading = view.getByRole('heading', { level: 3, name: /showing/i });
    expect(heading.textContent).to.equal(sentence);
  });

  it('renders correct sentence with filters count as numerals', () => {
    const sentence =
      'Showing 5-8 of 10 results with 12 filters applied, sorted by last updated (newest to oldest).';
    const view = render(
      <SearchDescriptionNew
        filtersCount={12}
        sortOrder={sortOptions.lastUpdate.newest}
        total={10}
        pageStart={5}
        pageEnd={8}
      />,
    );
    const heading = view.getByRole('heading', { level: 3, name: /showing/i });
    expect(heading.textContent).to.equal(sentence);
  });

  it('renders correct sentence with sort order changed', () => {
    const sentence =
      'Showing 5-8 of 10 results with 12 filters applied, sorted by last updated (oldest to newest).';
    const view = render(
      <SearchDescriptionNew
        filtersCount={12}
        sortOrder={sortOptions.lastUpdate.oldest}
        total={10}
        pageStart={5}
        pageEnd={8}
      />,
    );
    const heading = view.getByRole('heading', { level: 3, name: /showing/i });
    expect(heading.textContent).to.equal(sentence);
  });

  it('renders no results message with a filter', () => {
    // Missing spaces are necessary because certain parts are in different elements,
    // rendering on different lines in the UI, but appearing collapsed here
    const sentence =
      'Showing no results with one filter applied.Search 1 of these 3 things to get more results:Reference numberCategory nameOriginal question';
    const view = render(
      <SearchDescriptionNew
        filtersCount={1}
        sortOrder={sortOptions.lastUpdate.newest}
        total={0}
        pageStart={undefined}
        pageEnd={0}
      />,
    );
    const heading = view.getByRole('heading', {
      level: 3,
      name: /showing/i,
    });
    expect(view.queryByTestId('no-results-suggestion')).to.exist;
    expect(heading.parentElement.textContent).to.equal(sentence);
  });

  describe('with search query', () => {
    it('renders correct sentence without filters', () => {
      const sentence =
        'Showing 1-4 of 5 results for "last week," sorted by last updated (newest to oldest).';
      const view = render(
        <SearchDescriptionNew
          sortOrder={sortOptions.lastUpdate.newest}
          total={5}
          pageStart={1}
          pageEnd={4}
          query="last week"
        />,
      );
      const heading = view.getByRole('heading', { level: 3, name: /showing/i });
      expect(heading.textContent).to.equal(sentence);
    });

    it('renders correct sentence with filters', () => {
      const sentence =
        'Showing 1-4 of 5 results for "last week" with one filter applied, sorted by last updated (newest to oldest).';
      const view = render(
        <SearchDescriptionNew
          sortOrder={sortOptions.lastUpdate.newest}
          total={5}
          filtersCount={1}
          pageStart={1}
          pageEnd={4}
          query="last week"
        />,
      );
      const heading = view.getByRole('heading', { level: 3, name: /showing/i });
      expect(heading.textContent).to.equal(sentence);
    });

    it('renders no results message', () => {
      const sentence =
        'Showing no results for "last week."Search 1 of these 3 things to get more results:Reference numberCategory nameOriginal question';
      const view = render(
        <SearchDescriptionNew
          sortOrder={sortOptions.lastUpdate.newest}
          total={0}
          filtersCount={0}
          pageStart={undefined}
          pageEnd={0}
          query="last week"
        />,
      );

      const heading = view.getByRole('heading', { level: 3, name: /showing/i });
      expect(heading.parentElement.textContent).to.equal(sentence);
    });

    it('renders no results message with filters', () => {
      const sentence =
        'Showing no results for "last week" with two filters applied.Search 1 of these 3 things to get more results:Reference numberCategory nameOriginal question';
      const view = render(
        <SearchDescriptionNew
          sortOrder={sortOptions.lastUpdate.newest}
          total={0}
          filtersCount={2}
          pageStart={undefined}
          pageEnd={0}
          query="last week"
        />,
      );

      const heading = view.getByRole('heading', { level: 3, name: /showing/i });
      expect(heading.parentElement.textContent).to.equal(sentence);
    });
  });
});
