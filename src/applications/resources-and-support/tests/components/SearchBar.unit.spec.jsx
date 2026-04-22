import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import { stub, spy } from 'sinon';
import SearchBar from '../../components/SearchBar';

describe('SearchBar - Rendering', () => {
  const searchBarProps = {
    onInputChange: () => {},
    previousValue: 'test',
    setSearchData: () => {},
    userInput: 'new test',
  };

  it('should render the correct view for mobile', () => {
    window.innerWidth = 400;
    render(<SearchBar {...searchBarProps} />);

    expect(document.querySelector('[data-testid="rs-mobile-expand-collapse"]'))
      .to.exist;
    expect(document.querySelector('va-icon[icon="add"]')).to.exist;
    expect(document.querySelector('va-icon[icon="remove"]')).to.exist;
    expect(
      document.querySelector(
        '[label="Search resources and support articles or all of VA.gov"]',
      ),
    ).to.exist;
    expect(document.querySelector('[label="Resources and Support"]')).to.exist;
    expect(document.querySelector('[label="All VA.gov"]')).to.exist;
    expect(document.querySelector('va-search-input')).to.exist;
  });

  it('should expand and collapse the search input on mobile when the expand/collapse button is clicked', () => {
    window.innerWidth = 400;
    render(<SearchBar {...searchBarProps} />);

    const expandCollapseButton = document.querySelector(
      '[data-testid="rs-mobile-expand-collapse"]',
    );
    const addIcon = document.querySelector('va-icon[icon="add"]');
    const removeIcon = document.querySelector('va-icon[icon="remove"]');
    const searchContainer = document.querySelector(
      '[data-testid="resources-support-search"]',
    );
    // Initially, the search input should be collapsed
    expect(addIcon).to.not.have.class('vads-u-display--none');
    expect(removeIcon).to.have.class('vads-u-display--none');
    expect(searchContainer).to.have.class('vads-u-display--none');
    // Click the button to expand the search input
    fireEvent.click(expandCollapseButton);

    // The search input should now be expanded
    expect(addIcon).to.have.class('vads-u-display--none');
    expect(removeIcon).to.not.have.class('vads-u-display--none');
    expect(searchContainer).to.not.have.class('vads-u-display--none');

    // Click the button again to collapse the search input
    fireEvent.click(expandCollapseButton);

    // The search input should be collapsed again
    expect(addIcon).to.not.have.class('vads-u-display--none');
    expect(removeIcon).to.have.class('vads-u-display--none');
    expect(searchContainer).to.have.class('vads-u-display--none');
  });

  it('should render the correct view for desktop', () => {
    window.innerWidth = 1200;
    render(<SearchBar {...searchBarProps} />);

    expect(
      document.querySelector(
        '[label="Search resources and support articles or all of VA.gov"]',
      ),
    ).to.exist;
    expect(document.querySelector('[label="Resources and Support"]')).to.exist;
    expect(document.querySelector('[label="All VA.gov"]')).to.exist;
    expect(document.querySelector('va-search-input')).to.exist;
  });
});

describe('SearchBar - Search Behavior', () => {
  const searchBarProps = {
    onInputChange: () => {},
    previousValue: 'test',
    setSearchData: () => {},
    userInput: 'new test',
  };

  let locationAssignStub;
  let historyPushStateStub;
  let originalLocation;

  const mockWindowLocation = url => {
    originalLocation = window.location;
    locationAssignStub = stub().returns(undefined);

    delete window.location;
    Object.defineProperty(window, 'location', {
      value: {
        href: url,
        pathname: new URL(url).pathname,
        assign: locationAssignStub,
      },
      writable: true,
      configurable: true,
    });

    return locationAssignStub;
  };

  const mockWindowHistory = () => {
    historyPushStateStub = stub(window.history, 'pushState').returns(undefined);
    return historyPushStateStub;
  };

  const submitSearch = container => {
    const searchInput = container.querySelector('va-search-input');
    fireEvent(
      searchInput,
      new CustomEvent('submit', { bubbles: true, cancelable: true }),
    );
  };

  beforeEach(() => {
    window.innerWidth = 1200;

    mockWindowLocation('http://localhost:3000/resources-and-support');
    mockWindowHistory();
  });

  afterEach(() => {
    historyPushStateStub?.restore();

    if (originalLocation) {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    }

    locationAssignStub = null;
    historyPushStateStub = null;
    originalLocation = null;
  });

  it('should check if input only has spaces and trim it before submitting', async () => {
    const onChange = spy();
    const { container } = render(
      <SearchBar
        {...searchBarProps}
        onInputChange={onChange}
        userInput="     "
        previousValue=""
      />,
    );

    const searchInput = container.querySelector('va-search-input');
    searchInput.value = '     ';
    fireEvent(searchInput, new Event('input', { bubbles: true }));

    await waitFor(() => {
      expect(onChange.calledOnce).to.be.true;
      expect(onChange.firstCall.args[0]).to.equal('');
    });
  });

  it('should show an error if the user tries to submit an empty search', async () => {
    const { container, getByText } = render(
      <SearchBar {...searchBarProps} userInput="" />,
    );

    submitSearch(container);

    await waitFor(() => {
      expect(container.querySelector('[role="alert"]')).to.exist;
      expect(getByText('Please fill in a keyword, phrase, or question.')).to
        .exist;
    });
  });

  it('should update window.location.assign with correct query params on resources search', async () => {
    const { container } = render(
      <SearchBar
        {...searchBarProps}
        userInput="disability benefits"
        previousValue=""
      />,
    );

    submitSearch(container);

    await waitFor(() => {
      expect(locationAssignStub.called).to.be.true;
      const callArg = locationAssignStub.getCall(0).args[0];
      expect(callArg).to.include('query=disability+benefits');
    });
  });

  it('should update window.location.assign with correct URL for global search', async () => {
    const { container } = render(
      <SearchBar
        {...searchBarProps}
        userInput="veterans benefits"
        previousValue=""
      />,
    );

    // Switch to global search
    const globalSearchRadio = container.querySelector('[value="All VA.gov"]');
    fireEvent.click(globalSearchRadio);

    submitSearch(container);

    await waitFor(() => {
      expect(locationAssignStub.called).to.be.true;
      const callArg = locationAssignStub.getCall(0).args[0];
      expect(callArg).to.include('query=veterans+benefits');
    });
  });

  it('should call window.history.pushState when previousValue exists', async () => {
    const { container } = render(
      <SearchBar
        {...searchBarProps}
        userInput="new search term"
        previousValue="old search"
      />,
    );

    submitSearch(container);

    await waitFor(() => {
      expect(historyPushStateStub.called).to.be.true;
      const { args } = historyPushStateStub.getCall(0);
      // args[0] = state, args[1] = title, args[2] = url
      expect(args[0]).to.be.null;
      expect(args[1]).to.equal('');
      expect(args[2]).to.include('query=new+search+term');
    });
  });

  it('should not call window.history.pushState when previousValue is empty', async () => {
    const { container } = render(
      <SearchBar
        {...searchBarProps}
        userInput="search term"
        previousValue=""
      />,
    );

    submitSearch(container);

    await waitFor(() => {
      expect(locationAssignStub.called).to.be.true;
      expect(historyPushStateStub.called).to.be.false;
    });
  });

  it('should not submit when search term equals previousValue and not global search', async () => {
    const { container } = render(
      <SearchBar {...searchBarProps} userInput="test" previousValue="test" />,
    );

    submitSearch(container);

    await waitFor(() => {
      expect(locationAssignStub.called).to.be.false;
      expect(historyPushStateStub.called).to.be.false;
    });
  });
});
