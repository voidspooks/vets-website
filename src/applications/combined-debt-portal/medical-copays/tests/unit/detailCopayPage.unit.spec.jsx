import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { combineReducers, createStore } from 'redux';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import DetailCopayPage from '../../containers/DetailCopayPage';

describe('DetailCopayPage', () => {
  const registerMockElement = name => {
    class MockWebComponent extends HTMLElement {}
    if (!window.customElements.get(name)) {
      window.customElements.define(name, MockWebComponent);
    }
  };

  before(() => {
    registerMockElement('va-breadcrumbs');
    registerMockElement('va-loading-indicator');
  });

  const renderWithStore = (component, initialState) => {
    const store = createStore(
      combineReducers({
        combinedPortal: (state = initialState.combinedPortal || {}) => state,
        user: (state = initialState.user || {}) => state,
        featureToggles: (
          state = initialState.featureToggles || { loading: false },
        ) => state,
      }),
    );

    return render(
      <Provider store={store}>
        <Router>{component}</Router>
      </Provider>,
    );
  };

  const mockMatch = { params: { id: '123' } };

  it('uses station.facilityName for TITLE when flag is true and isCerner is true (legacy)', () => {
    const mockStatement = {
      id: '123',
      attributes: { facility: { name: 'Lighthouse Name' } },
      station: { facilityName: 'Legacy VA Medical Center' },
      pSStatementDateOutput: '01/15/2024',
      accountNumber: 'ACC123',
      details: [],
      pHNewBalance: 100,
      pHTotCharges: 25,
    };

    const mockState = {
      user: {
        profile: {
          userFullName: { first: 'John', last: 'Doe' },
        },
      },
      combinedPortal: {
        mcp: {
          selectedStatement: mockStatement,
          statements: [mockStatement],
          isCerner: true,
        },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <DetailCopayPage match={mockMatch} />,
      mockState,
    );

    expect(container.textContent).to.include(
      'Copay bill for Legacy VA Medical Center',
    );
  });

  it('uses attributes.facility for TITLE when flag is true and isCerner is false (Lighthouse)', () => {
    const mockStatement = {
      id: '123',
      attributes: {
        facility: { name: 'Lighthouse Facility When Cerner' },
        invoiceDate: '2024-01-15',
        accountNumber: 'ACC123',
        lineItems: [],
        principalBalance: 100,
        paymentDueDate: '2024-02-15',
        principalPaid: 25,
      },
      station: {
        facilityName: 'Legacy Tampa VA Medical Center',
      },
    };

    const mockState = {
      user: {
        profile: {
          userFullName: { first: 'John', last: 'Doe' },
        },
      },
      combinedPortal: {
        mcp: {
          selectedStatement: mockStatement,
          statements: [mockStatement],
          isCerner: false,
        },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <DetailCopayPage match={mockMatch} />,
      mockState,
    );

    expect(container.textContent).to.include(
      'Copay bill for Lighthouse Facility When Cerner',
    );
  });

  it('uses station.facilityName for TITLE when VHA payment history flag is false', () => {
    const mockStatement = {
      id: '123',
      station: {
        facilityName: 'Tampa VA Medical Center',
      },
      pSStatementDateOutput: '01/15/2024',
      accountNumber: 'ACC123',
      details: [],
      pHNewBalance: 100,
      pHTotCharges: 25,
    };

    const mockState = {
      user: {
        profile: {
          userFullName: { first: 'John', last: 'Doe' },
        },
      },
      combinedPortal: {
        mcp: {
          selectedStatement: mockStatement,
          statements: [mockStatement],
          isCerner: true,
        },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: false,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <DetailCopayPage match={mockMatch} />,
      mockState,
    );

    expect(container.textContent).to.include(
      'Copay bill for Tampa VA Medical Center',
    );
  });
});
