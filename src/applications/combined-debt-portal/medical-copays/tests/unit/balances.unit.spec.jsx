import { expect } from 'chai';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import React from 'react';
import { render } from '@testing-library/react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import Balances from '../../components/Balances';

/**
 * Helper to render components with a mock Redux store
 */
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

describe('Balances', () => {
  it('flag true and isCerner false - renders with new data structure (Lighthouse)', () => {
    const mockState = {
      user: {},
      combinedPortal: {
        debtLetters: {
          isProfileUpdating: false,
          isPending: false,
          isPendingVBMS: false,
          isError: false,
          isVBMSError: false,
          debts: [],
          selectedDebt: {},
          debtLinks: [],
          errors: [],
          hasDependentDebts: false,
        },
        mcp: {
          pending: false,
          error: null,
          isCerner: false,
          statements: {
            data: [
              {
                id: '4-1abZUKu7xIvIw6',
                type: 'medicalCopays',
                attributes: {
                  url: null,
                  facility: 'TEST VAMC',
                  facilityId: '4-O3d8XK44ejMS',
                  city: 'LYONS',
                  externalId: '4-1abZUKu7xIvIw6',
                  latestBillingRef: '4-6c9ZE23XQm5VawK',
                  currentBalance: 0,
                  previousBalance: 65.71,
                  previousUnpaidBalance: 0,
                  lastUpdatedAt: '2025-08-29T00:00:00Z',
                },
              },
            ],
            meta: {
              total: 10,
              page: 1,
              perPage: 3,
              copaySummary: {
                totalCurrentBalance: 0.0,
                copayBillCount: 1,
                lastUpdatedOn: '2025-08-29T00:00:00Z',
              },
            },
            links: {
              self:
                'http://127.0.0.1:3000/services/health-care-costs-coverage/v0/r4/Invoice?_count=3&patient=10000003&page=1',
              first:
                'http://127.0.0.1:3000/services/health-care-costs-coverage/v0/r4/Invoice?_count=3&patient=10000003&page=1',
              next:
                'http://127.0.0.1:3000/services/health-care-costs-coverage/v0/r4/Invoice?_count=3&patient=10000003&page=2',
              last:
                'http://127.0.0.1:3000/services/health-care-costs-coverage/v0/r4/Invoice?_count=3&patient=10000003&page=4',
            },
          },
        },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <Balances
        statements={mockState.combinedPortal.mcp.statements.data}
        paginationText="TRUE SET"
        useLighthouseCopays
      />,
      mockState,
    );

    // Verify component renders
    expect(container).to.exist;

    // Verify BalanceCard is rendered with correct data
    const balanceCard = container.querySelector(
      '[data-testid="balance-card-4-1abZUKu7xIvIw6"]',
    );
    expect(balanceCard).to.exist;

    // Verify amount is displayed correctly from copaySummary
    const cardAmount = container.querySelector(
      '[data-testid="amount-4-1abZUKu7xIvIw6"]',
    );
    expect(cardAmount).to.exist;
    expect(cardAmount.textContent).to.include('$0.00');

    // Verify date is displayed from copaySummary.lastUpdatedOn
    const cardDate = container.querySelector(
      '[data-testid="due-date-4-1abZUKu7xIvIw6"]',
    );
    expect(cardDate).to.exist;
    expect(cardDate.textContent).to.include('August 29, 2025');

    // Verify detail link is present
    const detailLink = container.querySelector(
      '[data-testid="detail-link-4-1abZUKu7xIvIw6"]',
    );
    expect(detailLink).to.exist;
    expect(detailLink.text).to.include('Review details');

    // Verify resolve link is present
    const resolveLink = container.querySelector(
      '[data-testid="resolve-link-4-1abZUKu7xIvIw6"]',
    );
    expect(resolveLink).to.exist;
    expect(resolveLink.text).to.include('Resolve this bill');
  });

  it('showVHAPaymentHistory is true and isCerner is false - renders with new data structure (Lighthouse)', () => {
    const mockState = {
      user: {},
      combinedPortal: {
        debtLetters: {
          isProfileUpdating: false,
          isPending: false,
          isPendingVBMS: false,
          isError: false,
          isVBMSError: false,
          debts: [],
          selectedDebt: {},
          debtLinks: [],
          errors: [],
          hasDependentDebts: false,
        },
        mcp: {
          pending: false,
          error: null,
          isCerner: false,
          statements: {
            data: [
              {
                id: '4-cerner-lh',
                type: 'medicalCopays',
                attributes: {
                  url: null,
                  facility: 'Cerner Lighthouse VAMC',
                  facilityId: '4-O3d8XK44ejMS',
                  city: 'LYONS',
                  externalId: '4-cerner-lh',
                  latestBillingRef: '4-6c9ZE23XQm5VawK',
                  currentBalance: 99.99,
                  previousBalance: 65.71,
                  previousUnpaidBalance: 0,
                  lastUpdatedAt: '2025-08-29T00:00:00Z',
                },
              },
            ],
            meta: {
              total: 10,
              page: 1,
              perPage: 3,
              copaySummary: {
                totalCurrentBalance: 99.99,
                copayBillCount: 1,
                lastUpdatedOn: '2025-08-29T00:00:00Z',
              },
            },
            links: {},
          },
        },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <Balances
        statements={mockState.combinedPortal.mcp.statements.data}
        paginationText="FLAG TRUE CERNER FALSE"
        useLighthouseCopays
      />,
      mockState,
    );

    expect(container).to.exist;
    const balanceCard = container.querySelector(
      '[data-testid="balance-card-4-cerner-lh"]',
    );
    expect(balanceCard).to.exist;
    const cardAmount = container.querySelector(
      '[data-testid="amount-4-cerner-lh"]',
    );
    expect(cardAmount).to.exist;
    expect(cardAmount.textContent).to.include('$99.99');
  });

  // TODO: to be removed once toggle is fully enabled
  it('showVHAPaymentHistory is false - renders with legacy data structure', () => {
    const mockState = {
      user: {},
      combinedPortal: {
        debtLetters: {
          isProfileUpdating: false,
          isPending: false,
          isPendingVBMS: false,
          isError: false,
          isVBMSError: false,
          debts: [],
          selectedDebt: {},
          debtLinks: [],
          errors: [],
          hasDependentDebts: false,
        },
        mcp: {
          pending: false,
          error: null,
          isCerner: true,
          statements: [
            {
              id: '1',
              pSStatementDateOutput: '2025-01-05',
              pHAmtDue: 150.25,
              station: {
                facilityName: 'Test VAMC',
                city: 'Test City',
              },
            },
          ],
        },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: false,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <Balances
        statements={mockState.combinedPortal.mcp.statements}
        paginationText="FALSE SET"
        useLighthouseCopays={false}
      />,
      mockState,
    );

    // Verify component renders
    expect(container).to.exist;

    // Verify BalanceCard is rendered with correct data
    const balanceCard = container.querySelector(
      '[data-testid="balance-card-1"]',
    );
    expect(balanceCard).to.exist;

    // Verify amount is calculated from array
    const cardAmount = container.querySelector('[data-testid="amount-1"]');
    expect(cardAmount).to.exist;
    expect(cardAmount.textContent).to.include('$150.25');

    // Verify date is from latest bill
    const cardDate = container.querySelector('[data-testid="due-date-1"]');
    expect(cardDate).to.exist;
    expect(cardDate.textContent).to.include('January 5, 2025');

    // Verify detail link is present
    const detailLink = container.querySelector('[data-testid="detail-link-1"]');
    expect(detailLink).to.exist;
    expect(detailLink.text).to.include('Review details');

    // Verify resolve link is present
    const resolveLink = container.querySelector(
      '[data-testid="resolve-link-1"]',
    );
    expect(resolveLink).to.exist;
    expect(resolveLink.text).to.include('Resolve this bill');
  });
});
