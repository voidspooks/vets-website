import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { $ } from 'platform/forms-system/src/js/utilities/ui';
import IntroductionPage from '../../../components/IntroductionPage';
import formConfig from '../../../config/form';

const getData = ({
  loggedIn = true,
  verified = false,
  savedForm = false,
  ratingToggle = false,
} = {}) => ({
  props: {
    loggedIn,
    route: {
      formConfig: {
        prefillEnabled: true,
        formId: formConfig.formId,
      },
      pageList: [{ path: '/introduction' }, { path: '/next', formConfig }],
    },
    location: {
      basename: '/foo',
    },
  },
  mockStore: {
    getState: () => ({
      user: {
        login: {
          currentlyLoggedIn: loggedIn,
        },
        profile: {
          savedForms: savedForm
            ? [{ form: formConfig.formId, metadata: { expiresAt: 9999999999 } }]
            : [],
          prefillsAvailable: [],
          verified,
        },
      },
      form: {
        formId: formConfig.formId,
        loadedStatus: 'success',
        savedStatus: '',
        loadedData: {
          metadata: {},
        },
        data: {},
      },
      featureToggles: {
        loading: false,
        [`pension_rating_alert_logging_enabled`]: ratingToggle,
      },
    }),
    subscribe: () => {},
    dispatch: () => {},
  },
});

describe('<IntroductionPage />', () => {
  it('should render', () => {
    const { props, mockStore } = getData({ loggedIn: false });
    const { container } = render(
      <Provider store={mockStore}>
        <IntroductionPage {...props} />
      </Provider>,
    );
    expect($('h1', container)).to.exist;
    expect($('h1', container).textContent).to.eql(
      'Apply for Veterans Pension benefits',
    );
    // logged in false, verified false, saved form false
    expect($('va-alert-sign-in[variant="signInOptional"]', container)).to.exist;
  });

  it('renders continue app button when logged in & with saved form', () => {
    // logged in true, verified false, saved form true
    const { props, mockStore } = getData({ savedForm: true });
    const { container } = render(
      <Provider store={mockStore}>
        <IntroductionPage {...props} />
      </Provider>,
    );
    expect($('[data-testid="continue-your-application"]', container)).to.exist;
  });

  it('renders the verify alert (logged in, not verified, no in progress)', () => {
    // logged in true, verified false, saved form false
    const { props, mockStore } = getData();
    const { container } = render(
      <Provider store={mockStore}>
        <IntroductionPage {...props} />
      </Provider>,
    );
    expect($('va-alert-sign-in[variant="verifyIdMe"]', container)).to.exist;
  });

  it('renders the continue app button (logged in, not verified & has in progress)', () => {
    // logged in true, verified false, saved form true
    const { props, mockStore } = getData({ savedForm: true });
    const { container } = render(
      <Provider store={mockStore}>
        <IntroductionPage {...props} />
      </Provider>,
    );
    expect($('[data-testid="continue-your-application"]', container)).to.exist;
  });

  it('renders continue app button when logged in, with saved form & verified', () => {
    // logged in true, verified true, saved form true
    const { props, mockStore } = getData({
      savedForm: true,
      verified: true,
    });
    const { container } = render(
      <Provider store={mockStore}>
        <IntroductionPage {...props} />
      </Provider>,
    );
    expect($('[data-testid="continue-your-application"]', container)).to.exist;
  });

  it('renders start action link when logged in', () => {
    // logged in true, verified true, saved form false
    const { props, mockStore } = getData({
      loggedIn: true,
      verified: true,
      savedForm: false,
    });
    const { container } = render(
      <Provider store={mockStore}>
        <IntroductionPage {...props} />
      </Provider>,
    );
    expect($('va-link-action, .vads-c-action-link--green', container)).to.exist;
  });

  it('renders rating info alert when logged in & no saved form', () => {
    // logged in false, ratingToggle true
    const { props, mockStore } = getData({
      loggedIn: false,
      ratingToggle: true,
    });
    const { container } = render(
      <Provider store={mockStore}>
        <IntroductionPage {...props} />
      </Provider>,
    );
    expect($('va-alert[status="info"]', container)).to.not.exist;
  });
});
