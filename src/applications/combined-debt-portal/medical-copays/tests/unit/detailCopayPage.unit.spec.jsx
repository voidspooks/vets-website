import React from 'react';
import { render, within } from '@testing-library/react';
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
    registerMockElement('va-link');
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
          statements: { data: [mockStatement], meta: null },
          shouldUseLighthouseCopays: false,
          isCopayDetailLoading: false,
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
          statements: { data: [mockStatement], meta: null },
          shouldUseLighthouseCopays: true,
          isCopayDetailLoading: false,
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
          statements: { data: [mockStatement], meta: null },
          shouldUseLighthouseCopays: false,
          isCopayDetailLoading: false,
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

  it('renders VHA unspaced account number split into 5 parts', () => {
    const mockStatement = {
      id: '123',
      attributes: {
        facility: { name: 'James A. Haley' },
        invoiceDate: '2024-01-15',
        accountNumber: '5160000000024571JONES',
        lineItems: [],
        principalBalance: 100,
        paymentDueDate: '2024-02-15',
        principalPaid: 25,
      },
    };

    const mockState = {
      user: { profile: { userFullName: { first: 'John', last: 'Doe' } } },
      combinedPortal: {
        mcp: {
          selectedStatement: mockStatement,
          statements: { data: [mockStatement], meta: null },
          shouldUseLighthouseCopays: true,
          isCopayDetailLoading: false,
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

    expect(container.textContent).to.include('516 0000 0000 24571 JONES');
  });

  it('renders CDW spaced account number correctly', () => {
    const mockStatement = {
      id: '123',
      station: { facilityName: 'Tampa VA Medical Center' },
      pSStatementDateOutput: '01/15/2024',
      accountNumber: '516 0000 0000 24571 JONES',
      details: [],
      pHNewBalance: 100,
      pHTotCharges: 25,
    };

    const mockState = {
      user: { profile: { userFullName: { first: 'John', last: 'Doe' } } },
      combinedPortal: {
        mcp: {
          selectedStatement: mockStatement,
          statements: { data: [mockStatement], meta: null },
          shouldUseLighthouseCopays: false,
          isCopayDetailLoading: false,
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

    expect(container.textContent).to.include('516 0000 0000 24571 JONES');
  });

  describe('legacy previous statements (getCopaysForPriorMonthlyStatements)', () => {
    const FACILITY = '648';

    const legacyCopay = (id, pSStatementDateOutput, overrides = {}) => ({
      id,
      station: { facilityName: 'Legacy VA Medical Center' },
      pSFacilityNum: FACILITY,
      pSStatementDateOutput,
      accountNumber: 'ACC123',
      details: [],
      pHNewBalance: 50,
      pHTotCharges: 10,
      ...overrides,
    });

    const baseLegacyState = statementsData => ({
      user: {
        profile: {
          userFullName: { first: 'John', last: 'Doe' },
        },
      },
      combinedPortal: {
        mcp: {
          selectedStatement: statementsData[0],
          statements: { data: statementsData, meta: null },
          shouldUseLighthouseCopays: false,
          isCopayDetailLoading: false,
        },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
        loading: false,
      },
    });

    it('renders a previous-statement link for each prior copay row (including multiple rows in the same month)', () => {
      const open = legacyCopay('123', '03/15/2024', {
        pHNewBalance: 100,
        pHTotCharges: 25,
      });
      const febLate = legacyCopay('feb-late', '02/28/2024');
      const febEarly = legacyCopay('feb-early', '02/05/2024');
      const jan = legacyCopay('jan', '01/10/2024');

      const { container } = renderWithStore(
        <DetailCopayPage match={mockMatch} />,
        baseLegacyState([open, febLate, febEarly, jan]),
      );

      const view = within(container);
      expect(view.getByTestId('view-statements')).to.exist;
      expect(view.getByTestId('balance-details-feb-late-statement-view')).to
        .exist;
      expect(view.getByTestId('balance-details-feb-early-statement-view')).to
        .exist;
      expect(view.getByTestId('balance-details-jan-statement-view')).to.exist;
    });
  });
});
