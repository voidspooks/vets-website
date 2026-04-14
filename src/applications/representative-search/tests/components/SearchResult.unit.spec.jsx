import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { render } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import SearchResult from '../../components/results/SearchResult';

describe('SearchResults', () => {
  const mockStore = configureMockStore([thunk]);
  const store = mockStore({
    featureToggles: {
      // eslint-disable-next-line camelcase
      find_a_representative_flagging_feature_enabled: true,
    },
    searchQuery: {},
    searchResult: {
      searchResults: [],
    },
  });

  const baseProps = {
    officer: 'Test Officer',
    phone: '945-456-7890',
    email: 'test@example.com',
    representativeId: '123',
    query: { context: { location: 'UserLocation' } },
    key: 0,
  };

  const fullAddressProps = {
    ...baseProps,
    addressLine1: '123 Main St',
    addressLine2: 'Suite 100',
    city: 'Columbus',
    stateCode: 'OH',
    zipCode: '43210',
  };

  let dataLayerPushStub;

  beforeEach(() => {
    window.dataLayer = window.dataLayer || [];
    dataLayerPushStub = sinon.stub(window.dataLayer, 'push');
  });

  afterEach(() => {
    if (dataLayerPushStub?.restore) {
      dataLayerPushStub.restore();
    }
    window.dataLayer = [];
  });

  it('should push to dataLayer on click of contact link', () => {
    const { getByLabelText } = render(
      <Provider store={store}>
        <SearchResult {...fullAddressProps} />
      </Provider>,
    );

    const addressLink = getByLabelText(fullAddressProps.addressLine1, {
      exact: false,
    });
    expect(addressLink).to.exist;

    addressLink.click();
    expect(dataLayerPushStub.callCount).to.eq(1);

    addressLink.click();
    expect(dataLayerPushStub.callCount).to.eq(2);

    const firstPayload = dataLayerPushStub.firstCall.args[0];
    expect(firstPayload).to.have.property('event', 'far-search-results-click');
  });

  it('should render rep email if rep email exists', () => {
    const { container } = render(
      <Provider store={store}>
        <SearchResult {...fullAddressProps} />
      </Provider>,
    );

    const emailLink = container.querySelector(
      'a[href="mailto:test@example.com"]',
    );
    expect(emailLink).to.exist;
    expect(emailLink).to.have.text(fullAddressProps.email);
  });

  describe('address rendering rules', () => {
    it('renders address link when street address exists (full address)', () => {
      const { getByLabelText } = render(
        <Provider store={store}>
          <SearchResult {...fullAddressProps} />
        </Provider>,
      );

      const addressLink = getByLabelText(fullAddressProps.addressLine1, {
        exact: false,
      });
      expect(addressLink).to.exist;
    });

    it('does NOT render an address link when ONLY city exists (ambiguous city-only)', () => {
      const cityOnlyProps = {
        ...baseProps,
        city: 'Springfield',
        addressLine1: '',
        stateCode: '',
        zipCode: '',
      };

      const { container } = render(
        <Provider store={store}>
          <SearchResult {...cityOnlyProps} />
        </Provider>,
      );

      const addressLinkContainer = container.querySelector('.address-link');
      expect(addressLinkContainer).to.not.exist;
    });

    it('renders an address link when city + state exists (no street)', () => {
      const cityStateProps = {
        ...baseProps,
        city: 'Newark',
        stateCode: 'NJ',
        addressLine1: '',
        zipCode: '',
      };

      const { container, getByText } = render(
        <Provider store={store}>
          <SearchResult {...cityStateProps} distance="5.5" />
        </Provider>,
      );

      const addressLinkContainer = container.querySelector('.address-link');
      expect(addressLinkContainer).to.exist;

      expect(getByText('No street address provided')).to.exist;

      const addressAnchor = container.querySelector('.address-link > a');
      expect(addressAnchor).to.exist;
      expect(addressAnchor.textContent).to.equal('Newark, NJ');
    });

    it('renders an address link when zip exists (no street, no city/state)', () => {
      const zipOnlyProps = {
        ...baseProps,
        addressLine1: '',
        city: '',
        stateCode: '',
        zipCode: '07102',
      };

      const { container, getByText } = render(
        <Provider store={store}>
          <SearchResult {...zipOnlyProps} distance="5.5" />
        </Provider>,
      );

      const addressLinkContainer = container.querySelector('.address-link');
      expect(addressLinkContainer).to.exist;

      expect(getByText('No street address provided')).to.exist;

      const addressAnchor = container.querySelector('.address-link > a');
      expect(addressAnchor).to.exist;
      expect(addressAnchor.textContent).to.equal('07102');
    });

    it('renders city/state/zip in partial location text when city+state and zip exist (no street)', () => {
      const cityStateZipProps = {
        ...baseProps,
        addressLine1: '',
        city: 'Newark',
        stateCode: 'NJ',
        zipCode: '07102',
      };

      const { container } = render(
        <Provider store={store}>
          <SearchResult {...cityStateZipProps} distance="5.5" />
        </Provider>,
      );

      const addressAnchor = container.querySelector('.address-link > a');
      expect(addressAnchor).to.exist;
      expect(addressAnchor.textContent).to.equal('Newark, NJ 07102');
    });

    it('does NOT render an address link when there is no address info at all', () => {
      const noAddressProps = {
        ...baseProps,
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        stateCode: '',
        zipCode: '',
      };

      const { container } = render(
        <Provider store={store}>
          <SearchResult {...noAddressProps} />
        </Provider>,
      );

      const addressLinkContainer = container.querySelector('.address-link');
      expect(addressLinkContainer).to.not.exist;
    });
  });

  describe('distance label "(estimated)"', () => {
    it('does NOT show "(estimated)" when street address exists', () => {
      const { container } = render(
        <Provider store={store}>
          <SearchResult {...fullAddressProps} distance="5.5" />
        </Provider>,
      );

      const distanceElement = container.querySelector('h3 span.distance');
      expect(distanceElement).to.exist;
      expect(distanceElement.textContent).to.contain('miles');
      expect(distanceElement.textContent).to.not.contain('(estimated)');
    });

    it('renders distance when distance is 0 (exact match)', () => {
      const { container } = render(
        <Provider store={store}>
          <SearchResult {...fullAddressProps} distance={0} />
        </Provider>,
      );

      const distanceElement = container.querySelector('h3 span.distance');

      expect(distanceElement).to.exist;
      expect(distanceElement.textContent).to.contain('0 miles');
    });

    it('shows "(estimated)" when street address is missing but city+state exists', () => {
      const cityStateProps = {
        ...baseProps,
        addressLine1: '',
        city: 'Newark',
        stateCode: 'NJ',
        zipCode: '',
      };

      const { container } = render(
        <Provider store={store}>
          <SearchResult {...cityStateProps} distance="5.5" />
        </Provider>,
      );

      const distanceElement = container.querySelector('h3 span.distance');
      expect(distanceElement).to.exist;
      expect(distanceElement.textContent).to.contain('(estimated)');
    });

    it('shows "(estimated)" when street address is missing but zip exists', () => {
      const zipOnlyProps = {
        ...baseProps,
        addressLine1: '',
        city: '',
        stateCode: '',
        zipCode: '07102',
      };

      const { container } = render(
        <Provider store={store}>
          <SearchResult {...zipOnlyProps} distance="5.5" />
        </Provider>,
      );

      const distanceElement = container.querySelector('h3 span.distance');
      expect(distanceElement).to.exist;
      expect(distanceElement.textContent).to.contain('(estimated)');
    });
  });

  it('sets the aria-label on the address link', () => {
    const { container } = render(
      <Provider store={store}>
        <SearchResult {...fullAddressProps} />
      </Provider>,
    );

    const expectedAriaLabel =
      '123 Main St Suite 100 Columbus, OH 43210 (opens in a new tab)';

    const addressAnchor = container.querySelector('.address-link a');
    expect(addressAnchor).to.exist;
    expect(addressAnchor.getAttribute('aria-label')).to.eq(expectedAriaLabel);
  });

  it('renders addressLine2 if it exists (full address)', () => {
    const { container } = render(
      <Provider store={store}>
        <SearchResult {...fullAddressProps} />
      </Provider>,
    );

    const addressAnchor = container.querySelector('.address-link > a');
    expect(addressAnchor).to.exist;
    expect(addressAnchor.textContent).to.have.string(
      fullAddressProps.addressLine2,
    );
  });

  it('renders without addressLine2 when not provided (full address)', () => {
    const noAddressLine2Props = {
      ...baseProps,
      addressLine1: '123 Main St',
      addressLine2: undefined,
      city: 'Columbus',
      stateCode: 'OH',
      zipCode: '43210',
    };

    const { queryByText } = render(
      <Provider store={store}>
        <SearchResult {...noAddressLine2Props} />
      </Provider>,
    );

    const addressLine2Text = queryByText('Suite 100');
    expect(addressLine2Text).to.be.null;
  });

  it('renders the trigger button text for associated organizations', () => {
    const { container } = render(
      <Provider store={store}>
        <SearchResult
          {...fullAddressProps}
          associatedOrgs={['Org1', 'Org2', 'Org3']}
        />
      </Provider>,
    );

    const triggerButton = container
      .querySelector('.associated-organizations-info va-additional-info')
      .getAttribute('trigger');

    expect(triggerButton).to.equal('Check organizations for Test Officer');
  });

  it('renders distance information when distance is provided', () => {
    const { container } = render(
      <Provider store={store}>
        <SearchResult {...fullAddressProps} distance="5.5" />
      </Provider>,
    );

    const officerElement = container.querySelector('h3 span.officer');
    expect(officerElement).to.exist;

    const distanceElement = container.querySelector('h3 span.distance');
    expect(distanceElement).to.exist;
  });
});
