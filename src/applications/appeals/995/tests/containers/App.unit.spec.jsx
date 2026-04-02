import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import sinon from 'sinon';
import { setStoredSubTask } from '@department-of-veterans-affairs/platform-forms/sub-task';
import { $ } from '@department-of-veterans-affairs/platform-forms-system/ui';
import { SET_DATA } from 'platform/forms-system/src/js/actions';
import { mockApiRequest, resetFetch } from 'platform/testing/unit/helpers';
import * as RoutedSavableAppModule from 'platform/forms/save-in-progress/RoutedSavableApp';
import App from '../../containers/App';
import { HAS_VA_EVIDENCE } from '../../constants';
import { CONTESTABLE_ISSUES_API } from '../../constants/apis';
import { SELECTED } from '../../../shared/constants';
import {
  FETCH_CONTESTABLE_ISSUES_SUCCEEDED,
  FETCH_CONTESTABLE_ISSUES_FAILED,
} from '../../../shared/actions';
import { contestableIssuesResponse } from '../../../shared/tests/fixtures/mocks/contestable-issues.json';

const hasComp = { benefitType: 'compensation' };

const createTestStore = initialState =>
  createStore(
    combineReducers({
      featureToggles: (state = {}) => state,
      scheduledDowntime: (state = {}) => state,
      routes: (state = []) => state,
      user: (state = {}) => state,
      form: (state = {}, action) => {
        if (action.type === SET_DATA) {
          return { ...state, data: action.data };
        }
        return state;
      },
      contestableIssues: (state = {}, action) => {
        if (action.type === FETCH_CONTESTABLE_ISSUES_SUCCEEDED) {
          return {
            status: FETCH_CONTESTABLE_ISSUES_SUCCEEDED,
            issues: action.response.data,
            legacyCount: action.response.legacyCount,
          };
        }
        if (action.type === FETCH_CONTESTABLE_ISSUES_FAILED) {
          return {
            status: FETCH_CONTESTABLE_ISSUES_FAILED,
            issues: [],
          };
        }
        return state;
      },
    }),
    initialState,
    applyMiddleware(thunk),
  );

const getData = ({
  loggedIn = true,
  savedForms = [],
  verified = true,
  data = hasComp,
  accountUuid = '',
  pathname = '/introduction',
  push = () => {},
  status = '',
} = {}) => {
  setStoredSubTask({ benefitType: data?.benefitType || '' });

  return {
    props: {
      location: { pathname, search: '' },
      children: <h1>Intro</h1>,
      router: { push },
      routes: [{ path: pathname }],
    },
    initialState: {
      featureToggles: { loading: false },
      scheduledDowntime: {
        globalDowntime: null,
        isReady: true,
        isPending: false,
        serviceMap: { get() {} },
        dismissedDowntimeWarnings: [],
      },
      routes: [{ path: pathname }],
      user: {
        login: { currentlyLoggedIn: loggedIn },
        profile: {
          savedForms,
          verified,
          accountUuid,
          prefillsAvailable: [],
        },
      },
      form: {
        loadedStatus: 'success',
        savedStatus: '',
        loadedData: {
          metadata: { inProgressFormId: '5678' },
        },
        data,
      },
      contestableIssues: { status },
    },
  };
};

describe('App', () => {
  let routedSavableAppStub;

  beforeEach(() => {
    // Stub RoutedSavableApp to avoid rendering the full platform form tree,
    // which requires router/state our mock store doesn't fully provide
    routedSavableAppStub = sinon
      .stub(RoutedSavableAppModule, 'default')
      .callsFake(({ children }) => <div>{children}</div>);
  });

  afterEach(() => {
    routedSavableAppStub.restore();
  });

  describe('rendering', () => {
    it('should render logged out state', () => {
      const { props, initialState } = getData({ loggedIn: false });
      const { container } = render(
        <Provider store={createTestStore(initialState)}>
          <App {...props} />
        </Provider>,
      );

      const article = $('#form-0995', container);
      expect(article).to.exist;
      expect(article.getAttribute('data-location')).to.equal('introduction');
      expect($('h1', container).textContent).to.equal('Intro');
    });

    it('should not show contestable issue loading indicator on introduction page', () => {
      const { props, initialState } = getData();
      const { container } = render(
        <Provider store={createTestStore(initialState)}>
          <App {...props} />
        </Provider>,
      );

      expect($('va-loading-indicator', container)).to.not.exist;
    });
  });

  describe('redirect to /start', () => {
    it('should redirect and show loading when benefit type is missing', () => {
      const push = sinon.spy();
      const { props, initialState } = getData({ push, data: {} });
      const { container } = render(
        <Provider store={createTestStore(initialState)}>
          <App {...props} />
        </Provider>,
      );

      expect(push.calledWith('/start')).to.be.true;
      const indicator = $('va-loading-indicator', container);
      expect(indicator).to.exist;
      expect(indicator.getAttribute('message')).to.contain('restart the app');
    });

    it('should redirect for unsupported benefit types', () => {
      const push = sinon.spy();
      const { props, initialState } = getData({
        push,
        data: { benefitType: 'other' },
      });
      const { container } = render(
        <Provider store={createTestStore(initialState)}>
          <App {...props} />
        </Provider>,
      );

      expect(push.calledWith('/start')).to.be.true;
      expect($('va-loading-indicator', container)).to.exist;
    });

    it('should not redirect to start for unsupported benefit types and already on the start page', () => {
      const push = sinon.spy();
      const { props, initialState } = getData({
        push,
        pathname: '/start',
        data: { benefitType: 'other' },
      });
      const { container } = render(
        <Provider store={createTestStore(initialState)}>
          <App {...props} />
        </Provider>,
      );

      expect($('va-loading-indicator', container)).to.not.exist;
      expect(push.notCalled).to.be.true;
    });
  });

  describe('benefit type sync', () => {
    it('should set benefit type from session storage when missing from form data', async () => {
      const { props, initialState } = getData({ loggedIn: true, data: {} });
      const store = createTestStore(initialState);
      setStoredSubTask(hasComp);

      render(
        <Provider store={store}>
          <App {...props} />
        </Provider>,
      );

      await waitFor(() => {
        const { data: formData } = store.getState().form;
        expect(formData.benefitType).to.equal('compensation');
      });
    });
  });

  describe('contestable issues', () => {
    it('should call the API when logged in with a supported benefit type', async () => {
      mockApiRequest(contestableIssuesResponse);
      const { props, initialState } = getData({
        data: { ...hasComp, internalTesting: true },
      });

      render(
        <Provider store={createTestStore(initialState)}>
          <App {...props} />
        </Provider>,
      );

      await waitFor(() => {
        expect(global.fetch.args[0][0]).to.contain(CONTESTABLE_ISSUES_API);
      });

      resetFetch();
    });

    it('should update contested issues when the API succeeds and issues changed', async () => {
      const { props, initialState } = getData({
        loggedIn: true,
        data: {
          ...hasComp,
          internalTesting: true,
          contestedIssues: [
            {
              attributes: {
                ratingIssueSubjectText: 'test',
                approxDecisionDate: '2000-01-01',
              },
            },
          ],
        },
      });
      const store = createTestStore({
        ...initialState,
        contestableIssues: {
          status: FETCH_CONTESTABLE_ISSUES_SUCCEEDED,
          issues: [
            {
              attributes: {
                ratingIssueSubjectText: 'test',
                approxDecisionDate: '2000-01-02',
              },
            },
          ],
          legacyCount: 0,
        },
      });

      render(
        <Provider store={store}>
          <App {...props} />
        </Provider>,
      );

      await waitFor(() => {
        const { data: formData } = store.getState().form;
        expect(formData.contestedIssues).to.deep.equal([
          {
            attributes: {
              ratingIssueSubjectText: 'test',
              approxDecisionDate: '2000-01-02',
              description: '',
            },
          },
        ]);
        expect(formData.legacyCount).to.equal(0);
      });
    });

    it('should not update contested issues when the API fails', async () => {
      const { props, initialState } = getData({
        loggedIn: true,
        data: {
          ...hasComp,
          internalTesting: true,
          contestedIssues: [
            {
              attributes: {
                ratingIssueSubjectText: 'test',
                approxDecisionDate: '2000-01-01',
              },
            },
          ],
        },
      });
      const store = createTestStore({
        ...initialState,
        contestableIssues: {
          status: FETCH_CONTESTABLE_ISSUES_FAILED,
          issues: [],
          legacyCount: undefined,
        },
      });

      render(
        <Provider store={store}>
          <App {...props} />
        </Provider>,
      );

      await waitFor(() => {
        const { data: formData } = store.getState().form;
        expect(
          formData.contestedIssues[0].attributes.approxDecisionDate,
        ).to.equal('2000-01-01');
      });
    });
  });

  describe('evidence sync', () => {
    it('should update evidence when selected issues have changed', async () => {
      const { props, initialState } = getData({
        loggedIn: true,
        data: {
          ...hasComp,
          contestedIssues: [],
          legacyCount: 0,
          [HAS_VA_EVIDENCE]: true,
          locations: [{ issues: ['abc', 'def'] }],
          additionalIssues: [{ issue: 'bbb', [SELECTED]: true }],
          internalTesting: true,
        },
      });
      const store = createTestStore({
        ...initialState,
        contestableIssues: {
          status: 'done',
          issues: [],
          legacyCount: 0,
        },
      });

      render(
        <Provider store={store}>
          <App {...props} />
        </Provider>,
      );

      await waitFor(() => {
        const { data: formData } = store.getState().form;
        expect(formData.locations).to.deep.equal([{ issues: [] }]);
        expect(formData.providerFacility).to.deep.equal([]);
      });
    });
  });
});
