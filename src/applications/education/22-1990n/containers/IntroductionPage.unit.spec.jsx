import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { IntroductionPage } from './IntroductionPage';
import formConfig from '../config/form';

// Stub platform/utilities/ui
let scrollStub;
let focusStub;

const createMockStore = (overrides = {}) => ({
  getState: () => ({
    user: {
      login: { currentlyLoggedIn: false },
      profile: {
        savedForms: [],
        prefillsAvailable: [],
        loa: { current: 3, highest: 3 },
        verified: true,
        dob: '1990-01-01',
        claims: { appeals: false },
        ...overrides.user?.profile,
      },
      ...overrides.user,
    },
    form: {
      formId: formConfig.formId,
      loadedStatus: 'success',
      savedStatus: '',
      loadedData: { metadata: {} },
      data: {},
      ...overrides.form,
    },
    scheduledDowntime: {
      globalDowntime: null,
      isReady: true,
      isPending: false,
      serviceMap: { get() {} },
      dismissedDowntimeWarnings: [],
    },
    ...overrides,
  }),
  subscribe: () => {},
  dispatch: () => {},
});

const defaultRoute = {
  formConfig,
  pageList: [{ path: '/introduction' }, { path: '/eligibility' }],
};

describe('containers/IntroductionPage', () => {
  beforeEach(() => {
    // SaveInProgressIntro may call scrollToTop / focusElement
    scrollStub = sinon.stub();
    focusStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('renders the form title', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <IntroductionPage
          route={defaultRoute}
          userLoggedIn={false}
          userIdVerified={false}
        />
      </Provider>,
    );
    // FormTitle renders title text
    expect(container.textContent).to.include(
      'Apply for VA Education Benefits Under the National Call to Service Program',
    );
  });

  it('renders eligibility requirements section', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <IntroductionPage
          route={defaultRoute}
          userLoggedIn={false}
          userIdVerified={false}
        />
      </Provider>,
    );
    expect(container.textContent).to.include('Eligibility requirements');
  });

  it('renders OMB control number', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <IntroductionPage
          route={defaultRoute}
          userLoggedIn={false}
          userIdVerified={false}
        />
      </Provider>,
    );
    expect(container.textContent).to.include('2900-0154');
  });

  it('does not render identity verification alert when user is verified', () => {
    const store = createMockStore();
    const { queryByText } = render(
      <Provider store={store}>
        <IntroductionPage
          route={defaultRoute}
          userLoggedIn
          userIdVerified
        />
      </Provider>,
    );
    expect(queryByText('Verify your identity to apply')).to.be.null;
  });

  it('renders identity verification alert when user is logged in but not verified', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <IntroductionPage
          route={defaultRoute}
          userLoggedIn
          userIdVerified={false}
        />
      </Provider>,
    );
    expect(container.textContent).to.include('Verify your identity to apply');
  });
});