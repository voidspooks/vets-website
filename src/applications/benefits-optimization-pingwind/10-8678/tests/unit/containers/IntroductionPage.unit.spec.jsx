import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import formConfig from '../../../config/form';
import IntroductionPage from '../../../containers/IntroductionPage';
import { FORM_10_8678 } from '../../../definitions/constants';

const mockStore = {
  getState: () => ({
    user: {
      login: {
        currentlyLoggedIn: false,
      },
      profile: {
        savedForms: [],
        prefillsAvailable: [],
        loa: {
          current: 3,
          highest: 3,
        },
        verified: true,
        dob: '2000-01-01',
        claims: {
          appeals: false,
        },
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
};

const props = {
  route: {
    path: 'introduction',
    pageList: [],
    formConfig,
  },
};

describe('IntroductionPage', () => {
  it('renders the introduction content', () => {
    const { container, getByText } = render(
      <Provider store={mockStore}>
        <IntroductionPage {...props} />
      </Provider>,
    );

    expect(container).to.exist;
    getByText(FORM_10_8678.INTRODUCTION.FORM_TITLE);
    getByText(FORM_10_8678.INTRODUCTION.FORM_SUBTITLE);
    expect(container.querySelector('va-process-list')).to.exist;
  });
});
