import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import * as uiUtils from 'platform/utilities/ui';
import formConfig from '../config/form';
import { IntroductionPage } from './IntroductionPage';

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

const mockRoute = {
  formConfig,
  pageList: [{ path: '/introduction' }, { path: '/applicant-information/personal-information' }],
};

describe('IntroductionPage', () => {
  let scrollStub;
  let focusStub;

  beforeEach(() => {
    scrollStub = sinon.stub(uiUtils, 'scrollToTop');
    focusStub = sinon.stub(uiUtils, 'focusElement');
  });

  afterEach(() => {
    scrollStub.restore();
    focusStub.restore();
  });

  it('renders without throwing', () => {
    const store = createMockStore();
    expect(() =>
      render(
        <Provider store={store}>
          <IntroductionPage route={mockRoute} />
        </Provider>,
      ),
    ).to.not.throw();
  });

  it('renders the form title', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <IntroductionPage route={mockRoute} />
      </Provider>,
    );
    expect(
      getByText(
        'Apply for VA Education Benefits Under the National Call to Service Program',
      ),
    ).to.exist;
  });

  it('renders va-omb-info element', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <IntroductionPage route={mockRoute} />
      </Provider>,
    );
    expect(container.querySelector('va-omb-info')).to.exist;
  });

  it('calls scrollToTop on mount', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <IntroductionPage route={mockRoute} />
      </Provider>,
    );
    expect(scrollStub.called).to.be.true;
  });
});