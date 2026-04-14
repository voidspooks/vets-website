import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import * as apiModule from 'platform/utilities/api';
import * as medicalCentersModule from 'platform/utilities/medical-centers/medical-centers';
import { expect } from 'chai';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { I18nextProvider } from 'react-i18next';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import i18nCombinedDebtPortal from '../../../i18n';
import eng from '../../../eng.json';
import * as copaysActions from '../../../combined/actions/copays';
import DetailCopayPage from '../../containers/DetailCopayPage';

const RESOLVE_PAGE_ERROR = eng['combined-debt-portal'].mcp['resolve-page'];

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
    registerMockElement('va-alert');
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

  const renderWithThunkStore = (component, initialState) => {
    const store = createStore(
      combineReducers({
        combinedPortal: (state = initialState.combinedPortal || {}) => state,
        user: (state = initialState.user || {}) => state,
        featureToggles: (
          state = initialState.featureToggles || { loading: false },
        ) => state,
      }),
      applyMiddleware(thunk),
    );
    const dispatchSpy = sinon.spy(store, 'dispatch');

    return {
      ...render(
        <Provider store={store}>
          <Router>{component}</Router>
        </Provider>,
      ),
      dispatchSpy,
    };
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

  describe('copay detail request on mount (container)', () => {
    it('requests copay statement detail once when VHA payment history is enabled and the store has no matching statement', async () => {
      const state = {
        user: { profile: { userFullName: { first: 'John', last: 'Doe' } } },
        combinedPortal: {
          mcp: {
            selectedStatement: {},
            statements: { data: [], meta: null },
            shouldUseLighthouseCopays: true,
            isCopayDetailLoading: false,
            detailFetchError: null,
          },
        },
        featureToggles: {
          [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
          loading: false,
        },
      };

      const { dispatchSpy } = renderWithThunkStore(
        <DetailCopayPage match={mockMatch} />,
        state,
      );

      await waitFor(() => {
        const thunkCalls = dispatchSpy
          .getCalls()
          .filter(call => typeof call.args[0] === 'function');
        expect(thunkCalls.length).to.equal(1);
      });
    });

    it('does not request copay statement detail when VHA payment history is disabled', async () => {
      const state = {
        user: { profile: { userFullName: { first: 'John', last: 'Doe' } } },
        combinedPortal: {
          mcp: {
            selectedStatement: {},
            statements: { data: [], meta: null },
            shouldUseLighthouseCopays: true,
            isCopayDetailLoading: false,
            detailFetchError: null,
          },
        },
        featureToggles: {
          [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: false,
          loading: false,
        },
      };

      const { dispatchSpy } = renderWithThunkStore(
        <DetailCopayPage match={mockMatch} />,
        state,
      );

      await waitFor(() => {
        const thunkCalls = dispatchSpy
          .getCalls()
          .filter(call => typeof call.args[0] === 'function');
        expect(thunkCalls.length).to.equal(0);
      });
    });

    it('does not request copay statement detail again when a prior detail request failed and the store still has no statement id', async () => {
      const state = {
        user: { profile: { userFullName: { first: 'John', last: 'Doe' } } },
        combinedPortal: {
          mcp: {
            selectedStatement: {},
            statements: { data: [], meta: null },
            shouldUseLighthouseCopays: true,
            isCopayDetailLoading: false,
            detailFetchError: {
              title: 'Not found',
              detail: 'No statement',
            },
          },
        },
        featureToggles: {
          [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
          loading: false,
        },
      };

      const { dispatchSpy } = renderWithThunkStore(
        <DetailCopayPage match={mockMatch} />,
        state,
      );

      await waitFor(() => {
        const thunkCalls = dispatchSpy
          .getCalls()
          .filter(call => typeof call.args[0] === 'function');
        expect(thunkCalls.length).to.equal(0);
      });
    });

    it('shows the translated copay detail error when detailFetchError is set and the store has no statement id', () => {
      const state = {
        user: { profile: { userFullName: { first: 'John', last: 'Doe' } } },
        combinedPortal: {
          mcp: {
            selectedStatement: {},
            statements: { data: [], meta: null },
            shouldUseLighthouseCopays: true,
            isCopayDetailLoading: false,
            detailFetchError: {
              title: 'Record not found',
              detail: 'No copay matches this id.',
            },
          },
        },
        featureToggles: {
          [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
          loading: false,
        },
      };

      const store = createStore(
        combineReducers({
          combinedPortal: (s = state.combinedPortal || {}) => s,
          user: (s = state.user || {}) => s,
          featureToggles: (s = state.featureToggles || { loading: false }) => s,
        }),
      );

      const { container } = render(
        <I18nextProvider i18n={i18nCombinedDebtPortal}>
          <Provider store={store}>
            <Router>
              <DetailCopayPage match={mockMatch} />
            </Router>
          </Provider>
        </I18nextProvider>,
      );

      expect(container.textContent).to.include(
        RESOLVE_PAGE_ERROR['error-title'],
      );
      expect(container.textContent).to.include(
        RESOLVE_PAGE_ERROR['error-body'],
      );
    });
  });

  describe('Previous statements', () => {
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

    describe('VBS — groupVbsCopaysByStatements(useVbsGroupedCopaysByCurrentCopay)', () => {
      it('loads list data via GET /v0/medical_copays once, then renders a previous-statement link per prior copay row', async () => {
        // V0 list uses string statement ids (uuid-shaped); hrefs are /copay-balances/:id/statement
        const priorFebLateId = '3fa85f64-5717-4562-b3fc-2c963f66aa01';
        const priorFebEarlyId = '3fa85f64-5717-4562-b3fc-2c963f66aa02';
        const priorJanId = '3fa85f64-5717-4562-b3fc-2c963f66aa03';

        const open = legacyCopay('123', '03/15/2024', {
          pHNewBalance: 100,
          pHTotCharges: 25,
        });
        const febLate = legacyCopay(priorFebLateId, '02/28/2024');
        const febEarly = legacyCopay(priorFebEarlyId, '02/05/2024');
        const jan = legacyCopay(priorJanId, '01/10/2024');

        const listPayload = [open, febLate, febEarly, jan];
        const apiRequestStub = sinon
          .stub(apiModule, 'apiRequest')
          .resolves({ data: listPayload });
        const getMedicalCenterNameByIDStub = sinon
          .stub(medicalCentersModule, 'getMedicalCenterNameByID')
          .returns('Legacy VA Medical Center');

        try {
          const dispatchSpy = sinon.spy();
          await copaysActions.getAllCopayStatements(dispatchSpy);

          expect(dispatchSpy.callCount).to.equal(2);
          expect(apiRequestStub.calledOnce).to.be.true;
          expect(String(apiRequestStub.firstCall.args[0])).to.match(
            /\/v0\/medical_copays$/,
          );

          const { container } = renderWithThunkStore(
            <DetailCopayPage match={mockMatch} />,
            baseLegacyState(listPayload),
          );

          const view = within(container);
          expect(view.getByTestId('view-statements')).to.exist;

          const list = view.getByTestId('otpp-statement-list');
          const vaLinks = list.querySelectorAll('va-link');
          expect(vaLinks).to.have.length(3);

          const expected = [
            {
              testId: `balance-details-${priorFebLateId}-statement-view`,
              href: `/copay-balances/${priorFebLateId}/statement`,
            },
            {
              testId: `balance-details-${priorFebEarlyId}-statement-view`,
              href: `/copay-balances/${priorFebEarlyId}/statement`,
            },
            {
              testId: `balance-details-${priorJanId}-statement-view`,
              href: `/copay-balances/${priorJanId}/statement`,
            },
          ];

          expected.forEach(({ testId, href }) => {
            const link = view.getByTestId(testId);
            expect(link.getAttribute('href')).to.equal(href);
            const label = link.getAttribute('text') ?? link.textContent ?? '';
            expect(label).to.match(/\sstatement$/);
            expect(label.trim().length).to.be.greaterThan(0);
          });
        } finally {
          apiRequestStub.restore();
          getMedicalCenterNameByIDStub.restore();
        }
      });

      it('does not render Previous statements when there are no prior monthly rows', () => {
        const onlyOpen = legacyCopay('123', '03/15/2024', {
          pHNewBalance: 100,
          pHTotCharges: 25,
        });

        const { container } = renderWithStore(
          <DetailCopayPage match={mockMatch} />,
          baseLegacyState([onlyOpen]),
        );

        expect(within(container).queryByTestId('view-statements')).to.not.exist;
      });
    });

    describe('Lighthouse — selectLighthousePreviousStatements', () => {
      it('renders a link per attributes.associatedStatements row', () => {
        const mockStatement = {
          id: '123',
          attributes: {
            facility: { name: 'Lighthouse Facility' },
            invoiceDate: '2024-03-15T12:00:00.000Z',
            accountNumber: 'ACC123',
            lineItems: [
              {
                billingReference: 'ref-1',
                datePosted: '2024-03-10',
                description: 'Outpatient Care',
                providerName: 'TEST VAMC',
                priceComponents: [{ amount: 50.0 }],
              },
            ],
            principalBalance: 100,
            paymentDueDate: '2024-04-15',
            principalPaid: 25,
            associatedStatements: [
              {
                id: '4-assoc-a',
                compositeId: '648-2-2024',
                date: '2024-02-15T00:00:00.000Z',
                attributes: {
                  invoiceDate: '2024-02-15T00:00:00.000Z',
                },
              },
              {
                id: '4-assoc-b',
                compositeId: '648-1-2024',
                date: '2024-01-10T00:00:00.000Z',
              },
            ],
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

        const view = within(container);
        expect(view.getByTestId('view-statements')).to.exist;

        const list = view.getByTestId('otpp-statement-list');
        const vaLinks = list.querySelectorAll('va-link');
        expect(vaLinks).to.have.length(2);

        const linkA = view.getByTestId(
          'balance-details-4-assoc-a-statement-view',
        );
        const linkB = view.getByTestId(
          'balance-details-4-assoc-b-statement-view',
        );

        expect(linkA.getAttribute('href')).to.equal(
          '/copay-balances/4-assoc-a/statement',
        );
        expect(linkB.getAttribute('href')).to.equal(
          '/copay-balances/4-assoc-b/statement',
        );
        const labelA = linkA.getAttribute('text') ?? linkA.textContent ?? '';
        const labelB = linkB.getAttribute('text') ?? linkB.textContent ?? '';
        expect(labelA).to.match(/\sstatement$/);
        expect(labelB).to.match(/\sstatement$/);
        expect(labelA.trim().length).to.be.greaterThan(0);
        expect(labelB.trim().length).to.be.greaterThan(0);
      });

      it('does not render Previous statements when associatedStatements is empty', () => {
        const mockStatement = {
          id: '123',
          attributes: {
            facility: { name: 'Lighthouse Facility' },
            invoiceDate: '2024-03-15T12:00:00.000Z',
            accountNumber: 'ACC123',
            lineItems: [
              {
                billingReference: 'ref-1',
                datePosted: '2024-03-10',
                description: 'Outpatient Care',
                providerName: 'TEST VAMC',
                priceComponents: [{ amount: 50.0 }],
              },
            ],
            principalBalance: 100,
            paymentDueDate: '2024-04-15',
            principalPaid: 25,
            associatedStatements: [],
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

        expect(within(container).queryByTestId('view-statements')).to.not.exist;
      });
    });
  });
});
