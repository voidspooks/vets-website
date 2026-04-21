import React from 'react';
import { Provider } from 'react-redux';
import { render, cleanup } from '@testing-library/react';
import { expect } from 'chai';
import formConfig from '../../../config/form';
import IntroductionPage from '../../../containers/IntroductionPage';

const defaultProps = {
  route: {
    path: 'introduction',
    pageList: [],
    formConfig,
  },
};

const generateStore = ({ loggedIn = false, loaCurrent = 3 } = {}) => ({
  getState: () => ({
    user: {
      login: { currentlyLoggedIn: loggedIn },
      profile: {
        savedForms: [],
        prefillsAvailable: [],
        loa: { current: loaCurrent, highest: 3 },
        verified: loaCurrent === 3,
        dob: '2000-01-01',
        claims: { appeals: false },
      },
    },
    form: {
      formId: formConfig.formId,
      loadedStatus: 'success',
      savedStatus: '',
      loadedData: { metadata: {} },
      data: {},
    },
    scheduledDowntime: {
      globalDowntime: null,
      isReady: true,
      isPending: false,
      serviceMap: { get() {} },
      dismissedDowntimeWarnings: [],
    },
  }),
  subscribe: () => {},
  dispatch: () => {},
});

describe('21-0788 IntroductionPage', () => {
  afterEach(() => cleanup());

  it('renders the process-list scaffolding', () => {
    const store = generateStore();
    const { container } = render(
      <Provider store={store}>
        <IntroductionPage {...defaultProps} />
      </Provider>,
    );
    expect(container.querySelector('va-process-list')).to.exist;
    expect(container.querySelectorAll('va-process-list-item').length).to.equal(
      3,
    );
  });

  it('renders each "what you need" item with a <strong> label', () => {
    const store = generateStore({ loggedIn: true, loaCurrent: 3 });
    const { container } = render(
      <Provider store={store}>
        <IntroductionPage {...defaultProps} />
      </Provider>,
    );
    const strongs = container.querySelectorAll('strong');
    expect(strongs.length).to.be.greaterThan(0);
    expect(container).to.contain.text('Veteran information');
    expect(container).to.contain.text('Claimant information');
  });

  it('renders readBefore items as <li> entries', () => {
    const store = generateStore();
    const { container } = render(
      <Provider store={store}>
        <IntroductionPage {...defaultProps} />
      </Provider>,
    );
    const lis = container.querySelectorAll('va-process-list-item ul li');
    expect(lis.length).to.be.greaterThan(0);
  });

  it('still renders when the user is logged in but not LOA3 (hideSipIntro branch)', () => {
    const store = generateStore({ loggedIn: true, loaCurrent: 1 });
    const { container } = render(
      <Provider store={store}>
        <IntroductionPage {...defaultProps} />
      </Provider>,
    );
    expect(container).to.exist;
  });
});
