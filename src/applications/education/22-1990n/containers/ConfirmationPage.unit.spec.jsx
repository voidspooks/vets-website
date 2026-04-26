import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ConfirmationPage } from './ConfirmationPage';
import formConfig from '../config/form';

const createMockStore = (overrides = {}) => ({
  getState: () => ({
    user: {
      login: { currentlyLoggedIn: true },
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
      data: {
        personalInformation: {
          applicantFirstName: 'Jane',
          applicantLastName: 'Smith',
        },
      },
      submission: {
        response: {
          confirmationNumber: '1234567890',
        },
        timestamp: new Date('2024-01-15'),
      },
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

const defaultRoute = { formConfig };

describe('containers/ConfirmationPage', () => {
  it('renders without crashing', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <ConfirmationPage route={defaultRoute} />
      </Provider>,
    );
    expect(container).to.exist;
  });

  it('displays the confirmation number', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <ConfirmationPage route={defaultRoute} />
      </Provider>,
    );
    expect(container.textContent).to.include('1234567890');
  });

  it('renders submission confirmation content', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <ConfirmationPage route={defaultRoute} />
      </Provider>,
    );
    expect(container.textContent).to.include(
      "We've received your application",
    );
  });
});