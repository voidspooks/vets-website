import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import {
  filterAndSort,
  standardizeInquiries,
} from '~/applications/ask-va/utils/inbox';
import { expect } from 'chai';
import InboxLayoutNew from '~/applications/ask-va/components/inbox/InboxLayoutNew';
import { mockInquiries as rawInquiries } from '../../utils/mock-inquiries';

describe('<InboxLayoutNew />', () => {
  const mockData = standardizeInquiries(rawInquiries);
  const personalInquiries = mockData.standardInquiries.filter(
    inq => inq.levelOfAuthentication === 'Personal',
  );
  const businessInquiries = mockData.standardInquiries.filter(
    inq => inq.levelOfAuthentication === 'Business',
  );
  const selectedStatus = 'In progress';
  const appliedStatusFilter = {
    detail: [
      {
        label: 'Status',
        category: [{ label: selectedStatus, active: true }],
      },
    ],
  };

  function setupStore(initialState) {
    return configureStore({
      reducer: state => state,
      preloadedState: { ...initialState, askVA: {} },
    });
  }

  // TODO delete after new inbox goes live
  function renderWithStore(children) {
    const store = setupStore({});
    return {
      store,
      view: render(<Provider store={store}>{children}</Provider>),
    };
  }

  it('displays a message when there are no inquiries', () => {
    const { view } = renderWithStore(
      <InboxLayoutNew
        categoryOptions={mockData.uniqueCategories}
        statusOptions={mockData.uniqueStatuses}
        inquiryTypes={[]}
        inquiries={[]}
      />,
    );

    const emptyInboxAlert = view.getByText(
      'You haven’t submitted a question yet.',
    );
    const inquiryResult = view.queryByTestId('inquiry-card');
    expect(emptyInboxAlert).to.exist;
    expect(inquiryResult).to.not.exist;
  });

  it('renders a list of inquiries', () => {
    const { view } = renderWithStore(
      <InboxLayoutNew
        categoryOptions={mockData.uniqueCategories}
        statusOptions={mockData.uniqueStatuses}
        inquiryTypes={['Personal']}
        inquiries={personalInquiries}
      />,
    );

    const inquiryResults = view.getAllByTestId('inquiry-card');
    expect(inquiryResults.length).to.be.greaterThanOrEqual(1);
  });

  it('only renders filter options available in the list', () => {
    const { view } = renderWithStore(
      <InboxLayoutNew
        categoryOptions={mockData.uniqueCategories}
        statusOptions={mockData.uniqueStatuses}
        inquiryTypes={['Personal']}
        inquiries={personalInquiries}
      />,
    );

    const searchFilters = view.container.querySelector('va-search-filter');
    const visibleCategories = searchFilters.filterOptions
      .find(({ label }) => label === 'Category')
      .category.map(({ label }) => label);
    const visibleStatuses = searchFilters.filterOptions
      .find(({ label }) => label === 'Status')
      .category.map(({ label }) => label);

    expect(visibleCategories).to.eql(mockData.uniqueCategories);
    expect(visibleStatuses).to.eql(mockData.uniqueStatuses);
  });

  it('applies and clears a filter', () => {
    const { view } = renderWithStore(
      <InboxLayoutNew
        categoryOptions={mockData.uniqueCategories}
        statusOptions={mockData.uniqueStatuses}
        inquiryTypes={['Personal']}
        inquiries={personalInquiries}
      />,
    );

    // Confirm filter's starting value and list's variety
    const searchFilters = view.container.querySelector('va-search-filter');
    const startingResults = view.getAllByTestId('inquiry-card');

    expect(
      searchFilters.filterOptions
        .find(({ label }) => label === 'Status')
        .category.some(({ active }) => active),
    ).to.equal(false);
    expect(
      startingResults.every(result =>
        result.textContent.includes(`Status ${selectedStatus}`),
      ),
    ).to.be.false;

    // Set status filter to "In progress" and apply filters
    searchFilters.__events.vaFilterApply(appliedStatusFilter);

    expect(
      searchFilters.filterOptions
        .find(({ label }) => label === 'Status')
        .category.filter(({ active }) => active).length,
    ).to.equal(1);

    // Confirm only selected status is present
    const filteredResults = view.getAllByTestId('inquiry-card');
    expect(
      filteredResults.every(result =>
        result.textContent.includes(`Status ${selectedStatus}`),
      ),
    ).to.be.true;

    // Reset filters & list, confirm it matches starting state
    searchFilters.__events.vaFilterClearAll();
    const endingResults = view.getAllByTestId('inquiry-card');
    const endTextContent = endingResults.map(end => end.textContent);
    const startTextContent = startingResults.map(start => start.textContent);
    const filteredTextContent = filteredResults.map(
      filtered => filtered.textContent,
    );

    // expect(statusSelect.getAttribute('value')).to.equal('All');

    expect(endTextContent)
      .to.eql(startTextContent)
      .but.not.eql(filteredTextContent);
  });

  it('updates sort order implicitly on selection', () => {
    function getLastUpdatedDates(resultsArray) {
      const q1 = 'Last updated: ';
      const q2 = 'Reference number: ';
      const firstResultText = resultsArray[0].textContent;
      const lastResultText = resultsArray[resultsArray.length - 1].textContent;

      // Get text between q1 and q2
      const firstDate = firstResultText.split(q1)[1].split(q2)[0];
      const lastDate = lastResultText.split(q1)[1].split(q2)[0];
      return [firstDate, lastDate];
    }

    const { view } = renderWithStore(
      <InboxLayoutNew
        categoryOptions={mockData.uniqueCategories}
        statusOptions={mockData.uniqueStatuses}
        inquiryTypes={['Personal']}
        inquiries={personalInquiries}
      />,
    );

    // Confirm newer values first
    const sortSelect = view.container.querySelector('va-sort');
    expect(sortSelect.getAttribute('value')).to.equal(
      filterAndSort.sortOptions.lastUpdate.newest,
    );

    const initialResults = view.getAllByTestId('inquiry-card');
    const [initialFirstDate, initialLastDate] = getLastUpdatedDates(
      initialResults,
    );
    expect(new Date(initialFirstDate).getTime()).to.be.greaterThanOrEqual(
      new Date(initialLastDate).getTime(),
    );

    // Change sort order
    sortSelect.__events.vaSortSelect({
      target: { value: filterAndSort.sortOptions.lastUpdate.oldest },
    });

    // Confirm older values first
    expect(sortSelect.getAttribute('value')).to.equal(
      filterAndSort.sortOptions.lastUpdate.oldest,
    );
    const finalResults = view.getAllByTestId('inquiry-card');
    const [finalFirstDate, finalLastDate] = getLastUpdatedDates(finalResults);
    expect(new Date(finalFirstDate).getTime()).to.be.lessThanOrEqual(
      new Date(finalLastDate).getTime(),
    );
  });

  it('shifts focus to search description after applying and clearing a filter', () => {
    const { view } = renderWithStore(
      <InboxLayoutNew
        categoryOptions={mockData.uniqueCategories}
        statusOptions={mockData.uniqueStatuses}
        inquiryTypes={['Personal']}
        inquiries={personalInquiries}
      />,
    );

    const getFocusedElement = () => view.container.ownerDocument.activeElement;

    // Check starting focus
    const searchDescription = view.getByText(/showing/i);
    expect(getFocusedElement()).to.not.equal(searchDescription.parentElement);

    // Apply filters and confirm focus shifted
    const searchFilters = view.container.querySelector('va-search-filter');
    searchFilters.__events.vaFilterApply(appliedStatusFilter);
    expect(getFocusedElement()).to.equal(searchDescription.parentElement);

    // Move focus elsewhere
    const firstCard = view.getAllByTestId('inquiry-card')[0];
    userEvent.click(firstCard);
    expect(getFocusedElement()).to.not.equal(searchDescription.parentElement);

    // Clear all filters and confirm focus shifted
    searchFilters.__events.vaFilterClearAll();
    expect(getFocusedElement()).to.equal(searchDescription.parentElement);
  });

  it('shifts focus to search description after selecting a sort order', () => {
    const { view } = renderWithStore(
      <InboxLayoutNew
        categoryOptions={mockData.uniqueCategories}
        statusOptions={mockData.uniqueStatuses}
        inquiryTypes={['Personal']}
        inquiries={personalInquiries}
      />,
    );
    const sortSelect = view.container.querySelector('va-sort');

    sortSelect.__events.vaSortSelect({
      target: { value: filterAndSort.sortOptions.lastUpdate.oldest },
    });

    const focusedElement = view.container.ownerDocument.activeElement;
    const searchDescription = view.getByText(/showing/i);

    expect(focusedElement).to.equal(searchDescription.parentElement);
  });

  it('searches results based on a query', () => {
    // Add an inquiry with a reference number guaranteed to be different
    const inquiriesCopy = [...personalInquiries];
    const newItem = {
      ...inquiriesCopy[inquiriesCopy.length - 1],
      inquiryNumber: 'A-3',
    };
    inquiriesCopy.push(newItem);

    const { view } = renderWithStore(
      <InboxLayoutNew
        categoryOptions={mockData.uniqueCategories}
        statusOptions={mockData.uniqueStatuses}
        inquiryTypes={['Personal']}
        inquiries={inquiriesCopy}
      />,
    );

    // Confirm starting state
    const startingResults = view.getAllByTestId('inquiry-card');
    expect(startingResults.length).to.equal(6);
    expect(startingResults[0].textContent).to.include('Reference number: A-2');

    const searchBox = view.container.querySelector('va-search-input');
    expect(searchBox.value).to.equal(undefined);

    // Input a search query and apply
    searchBox.value = 'A-3';
    searchBox.dispatchEvent(new Event('submit', { bubbles: true }));
    expect(searchBox.value).to.equal('A-3');

    // Confirm the list is now just one desired result
    const endingResults = view.getAllByTestId('inquiry-card');
    expect(endingResults.length).to.equal(1);
    expect(endingResults[0].textContent).to.include('Reference number: A-3');
  });

  describe('"Inquiry Types" section', () => {
    const labelRegex = /inquiry type/i;

    /** @param {HTMLVaSearchFilterElement['filterOptions']} filterOptions */
    const getInquiryTypeFilters = filterOptions =>
      filterOptions.filter(({ label }) => labelRegex.test(label));

    it('hides section if only personal inquiries', () => {
      const { view } = renderWithStore(
        <InboxLayoutNew
          categoryOptions={mockData.uniqueCategories}
          statusOptions={mockData.uniqueStatuses}
          inquiryTypes={['Personal']}
          inquiries={personalInquiries}
        />,
      );

      const searchFilters = view.container.querySelector('va-search-filter');
      expect(searchFilters.filterOptions.length).to.equal(2);
      expect(
        getInquiryTypeFilters(searchFilters.filterOptions),
      ).to.have.lengthOf(0);
    });

    it('hides section if only business inquiries', () => {
      const { view } = renderWithStore(
        <InboxLayoutNew
          categoryOptions={mockData.uniqueCategories}
          statusOptions={mockData.uniqueStatuses}
          inquiryTypes={['Business']}
          inquiries={businessInquiries}
        />,
      );

      const searchFilters = view.container.querySelector('va-search-filter');
      expect(searchFilters.filterOptions.length).to.equal(2);
      expect(
        getInquiryTypeFilters(searchFilters.filterOptions),
      ).to.have.lengthOf(0);
    });

    it('shows section and defaults to "Business" if both types present', () => {
      const { view } = renderWithStore(
        <InboxLayoutNew
          categoryOptions={mockData.uniqueCategories}
          statusOptions={mockData.uniqueStatuses}
          inquiryTypes={mockData.types}
          inquiries={mockData.standardInquiries}
        />,
      );

      const searchFilters = view.container.querySelector('va-search-filter');
      const inquiryFilters = getInquiryTypeFilters(searchFilters.filterOptions);

      expect(searchFilters.filterOptions.length).to.equal(3);
      expect(inquiryFilters).to.have.lengthOf(1);

      const businessFilterOption = inquiryFilters[0].category.find(
        ({ label }) => /business/i.test(label),
      );
      expect(businessFilterOption.active).to.be.true;
    });
  });
});
