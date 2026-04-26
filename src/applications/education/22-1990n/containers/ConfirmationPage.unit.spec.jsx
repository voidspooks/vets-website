import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import formConfig from '../config/form';
import { ConfirmationPage } from './ConfirmationPage';

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
      },
    },
    form: {
      formId: formConfig.formId,
      loadedStatus: 'success',
      savedStatus: '',
      loadedData: { metadata: {} },
      data: {
        veteranFullName: { first: 'John', last: 'Doe' },
      },
      submission: {
        response: { confirmationNumber: '1234567890' },
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

const mockRoute = { formConfig };

describe('ConfirmationPage', () => {
  it('renders without throwing', () => {
    const store = createMockStore();
    expect(() =>
      render(
        <Provider store={store}>
          <ConfirmationPage route={mockRoute} />
        </Provider>,
      ),
    ).to.not.throw();
  });

  it('renders a va-alert element', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <ConfirmationPage route={mockRoute} />
      </Provider>,
    );
    const alerts = container.querySelectorAll('va-alert');
    expect(alerts.length).to.be.greaterThan(0);
  });

  it('renders the confirmation number when present', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <ConfirmationPage route={mockRoute} />
      </Provider>,
    );
    expect(getByText('1234567890')).to.exist;
  });

  it('renders a print button', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <ConfirmationPage route={mockRoute} />
      </Provider>,
    );
    const buttons = container.querySelectorAll('va-button, button');
    expect(buttons.length).to.be.greaterThan(0);
  });
});