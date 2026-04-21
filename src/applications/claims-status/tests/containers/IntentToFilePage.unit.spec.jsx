import React from 'react';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import sinon from 'sinon';
import { addDays, formatISO } from 'date-fns';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom-v5-compat';
import * as api from '@department-of-veterans-affairs/platform-utilities/api';
import * as recordEventModule from '~/platform/monitoring/record-event';
import { INTENT_TO_FILE_PATH } from '../../constants';
import intentsToFileReducer from '../../reducers/intents-to-file';
import IntentToFilePage from '../../containers/IntentToFilePage';

const getStore = (cstIntentsToFileEnabled = true) =>
  createStore(
    combineReducers({
      featureToggles: () => ({
        // eslint-disable-next-line camelcase
        cst_intents_to_file: cstIntentsToFileEnabled,
      }),
      disability: combineReducers({
        status: combineReducers({
          intentsToFile: intentsToFileReducer,
        }),
      }),
    }),
    applyMiddleware(thunk),
  );

const renderWithRouterAtPath = (store, path = `/${INTENT_TO_FILE_PATH}`) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path={`/${INTENT_TO_FILE_PATH}`}
            element={<IntentToFilePage />}
          />
          <Route
            path="/your-claims"
            element={<div data-testid="claims-index">Claims Index</div>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

const makeActiveItf = (today, { id, type, expiresInDays }) => ({
  id,
  type,
  creationDate: new Date(Date.now()).toISOString(),
  expirationDate: formatISO(addDays(today, expiresInDays)),
  status: 'active',
});

describe('<IntentToFilePage>', () => {
  let apiStub;
  let recordEventStub;

  beforeEach(() => {
    apiStub = sinon.stub(api, 'apiRequest');
    recordEventStub = sinon.stub(recordEventModule, 'default');
  });

  afterEach(() => {
    apiStub.restore();
    recordEventStub.restore();
  });

  context('when cstIntentsToFile feature toggle is enabled', () => {
    context('with empty ITF response', () => {
      beforeEach(() => {
        apiStub.resolves({ data: [] });
      });

      it('should render the page heading and empty state', async () => {
        const screen = renderWithRouterAtPath(getStore(true));

        expect(
          screen.getByRole('heading', {
            level: 1,
            name: 'Your intents to file',
          }),
        ).to.exist;

        await waitFor(() => {
          expect(screen.getByTestId('itf-empty-state')).to.exist;
        });
      });

      it('should record analytics for empty ITF state', async () => {
        renderWithRouterAtPath(getStore(true));

        await waitFor(() => {
          expect(
            recordEventStub.calledWithMatch({
              event: 'claims-itf-status',
              'api-name': 'GET intents to file',
              'api-status': 'successful',
              'itf-none': true,
              'itf-expiring-count': 0,
              'itf-not-expiring-count': 0,
            }),
          ).to.be.true;
        });
      });
    });

    context('with populated ITF response', () => {
      const mockItfs = [
        {
          id: '2',
          type: 'pension',
          creationDate: '2025-06-01T12:00:00.000+00:00',
          expirationDate: '2026-06-01T12:00:00.000+00:00',
          status: 'active',
        },
        {
          id: '1',
          type: 'compensation',
          creationDate: '2025-04-01T12:00:00.000+00:00',
          expirationDate: '2026-04-01T12:00:00.000+00:00',
          status: 'active',
        },
      ];

      beforeEach(() => {
        apiStub.resolves({ data: mockItfs });
      });

      it('should render ITF cards', async () => {
        const screen = renderWithRouterAtPath(getStore(true));

        await waitFor(() => {
          expect(screen.getByTestId('itf-card-compensation')).to.exist;
        });

        expect(screen.getByTestId('itf-card-pension')).to.exist;
        expect(screen.queryByTestId('itf-empty-state')).to.not.exist;
      });

      it('should sort ITF cards by creation date (oldest first)', async () => {
        const screen = renderWithRouterAtPath(getStore(true));

        await waitFor(() => {
          const cards = screen.container.querySelectorAll('va-card');
          expect(cards).to.have.length(2);
        });

        const cards = screen.container.querySelectorAll('va-card');
        expect(cards[0]).to.contain.text('Disability compensation');
        expect(cards[1]).to.contain.text('Pension');
      });
    });

    context('while loading', () => {
      beforeEach(() => {
        apiStub.returns(new Promise(() => {}));
      });

      it('should not render the error alert, empty state, or ITF cards', () => {
        const screen = renderWithRouterAtPath(getStore(true));

        expect(screen.queryByTestId('itf-error-alert')).to.not.exist;
        expect(screen.queryByTestId('itf-empty-state')).to.not.exist;
        expect(screen.container.querySelectorAll('va-card')).to.have.length(0);
      });

      context(
        'when ITF response contains active ITFs not nearing expiration',
        () => {
          it('should record event with the correct not-expiring count', async () => {
            const today = new Date();
            apiStub.resolves({
              data: [
                makeActiveItf(today, {
                  id: '1',
                  type: 'compensation',
                  expiresInDays: 61,
                }),
              ],
            });

            renderWithRouterAtPath(getStore(true));

            await waitFor(() => {
              expect(
                recordEventStub.calledWithMatch({
                  event: 'claims-itf-status',
                  'api-name': 'GET intents to file',
                  'api-status': 'successful',
                  'itf-none': false,
                  'itf-expiring-count': 0,
                  'itf-not-expiring-count': 1,
                }),
              ).to.be.true;
            });
          });
        },
      );

      context(
        'when ITF response contains active ITFs nearing expiration',
        () => {
          it('should record event with the correct expiring count', async () => {
            const today = new Date();
            apiStub.resolves({
              data: [
                makeActiveItf(today, {
                  id: '1',
                  type: 'compensation',
                  expiresInDays: 45,
                }),
                makeActiveItf(today, {
                  id: '2',
                  type: 'pension',
                  expiresInDays: 30,
                }),
              ],
            });

            renderWithRouterAtPath(getStore(true));

            await waitFor(() => {
              expect(
                recordEventStub.calledWithMatch({
                  event: 'claims-itf-status',
                  'api-name': 'GET intents to file',
                  'api-status': 'successful',
                  'itf-none': false,
                  'itf-expiring-count': 2,
                  'itf-not-expiring-count': 0,
                }),
              ).to.be.true;
            });
          });
        },
      );

      context(
        'when ITF response contains both expiring and non-expiring ITFs',
        () => {
          it('should record a single event with both counts', async () => {
            const today = new Date();
            apiStub.resolves({
              data: [
                makeActiveItf(today, {
                  id: '1',
                  type: 'compensation',
                  expiresInDays: 45,
                }),
                makeActiveItf(today, {
                  id: '2',
                  type: 'pension',
                  expiresInDays: 61,
                }),
              ],
            });

            renderWithRouterAtPath(getStore(true));

            await waitFor(() => {
              expect(
                recordEventStub.calledWithMatch({
                  event: 'claims-itf-status',
                  'api-name': 'GET intents to file',
                  'api-status': 'successful',
                  'itf-none': false,
                  'itf-expiring-count': 1,
                  'itf-not-expiring-count': 1,
                }),
              ).to.be.true;
            });
          });
        },
      );

      context('with server error', () => {
        let screen;

        beforeEach(() => {
          apiStub.rejects({
            errors: [{ status: '500', title: 'Internal Server Error' }],
          });
          screen = renderWithRouterAtPath(getStore(true));
        });

        it('should render the error alert without the empty state or cards', async () => {
          expect(await screen.findByTestId('itf-error-alert')).to.exist;

          expect(screen.queryByTestId('itf-empty-state')).to.not.exist;
          expect(screen.container.querySelectorAll('va-card')).to.have.length(
            0,
          );
        });

        it('should record a failed API call event', async () => {
          await waitFor(() => {
            expect(
              recordEventStub.calledWithMatch({
                event: 'claims-itf-status',
                'api-name': 'GET intents to file',
                'api-status': 'failed',
                'error-key': '500',
                'itf-none': false,
                'itf-expiring-count': 0,
                'itf-not-expiring-count': 0,
              }),
            ).to.be.true;
          });
        });
      });
    });
  });

  context('when cstIntentsToFile feature toggle is disabled', () => {
    beforeEach(() => {
      apiStub.resolves({ data: [] });
    });

    it('should redirect to the claims index page', () => {
      const screen = renderWithRouterAtPath(getStore(false));
      expect(screen.queryByText('Your intents to file')).to.be.null;
      expect(screen.getByTestId('claims-index')).to.exist;
    });
  });
});
