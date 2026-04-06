import React from 'react';
import { Provider } from 'react-redux';
import { render, cleanup } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';

import formConfig from '../../../../config/form';
import ConfirmationPage from '../../../../containers/shared/ConfirmationPage';

const TEST_URL = 'https://dev.va.gov/form-upload/21-686c/confirmation';
const config = formConfig;

const veteranFullName = {
  first: 'John',
  last: 'Veteran',
};
const storeBase = {
  form: {
    formId: config.formId,
    submission: {
      response: {
        confirmationNumber: '123456',
      },
      timestamp: Date.now(),
    },
    data: {
      name: veteranFullName,
      claimantId: 'abc123',
    },
  },
  featureToggles: {
    // eslint-disable-next-line camelcase
    accredited_representative_portal_claimant_details: true,
  },
};

describe('Confirmation page', () => {
  beforeEach(() => {
    window.location = new URL(TEST_URL);
  });

  afterEach(() => {
    cleanup();
  });

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  it('throws error if state.form is undefined', () => {
    const storeWithUndefinedForm = {
      ...storeBase,
      form: undefined,
    };

    expect(() => {
      render(
        <Provider store={mockStore(storeWithUndefinedForm)}>
          <ConfirmationPage />
        </Provider>,
      );
    }).to.throw();
  });

  it('throws error when state.form is empty', () => {
    const storeWithEmptyForm = {
      ...storeBase,
      form: {},
    };

    expect(() => {
      render(
        <Provider store={mockStore(storeWithEmptyForm)}>
          <ConfirmationPage />
        </Provider>,
      );
    }).to.throw();
  });
});
