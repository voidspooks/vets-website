import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { format } from 'date-fns';
import { createInitialState } from '@department-of-veterans-affairs/platform-forms-system/state/helpers';
import formConfig from '../../config/form';
import ConfirmationPage from '../../containers/ConfirmationPage';
import testData from '../e2e/fixtures/data/maximal-test.json';

describe('ConfirmationPage', () => {
  const initialState = {
    form: {
      ...createInitialState(formConfig),
      testData,
      submission: {
        response: {
          confirmationNumber: '1234567890',
          referenceNumber: '9876543210',
        },
        timestamp: new Date('2022-01-01T00:00:00Z'),
      },
    },
  };

  const createMockStore = (state = initialState) => {
    return configureStore({
      reducer: {
        form: () => state.form,
      },
      preloadedState: state,
    });
  };

  it('renders the confirmation page with the submission date and reference number', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <ConfirmationPage route={{ formConfig }} />
      </Provider>,
    );

    const timestamp = new Date('2022-01-01T00:00:00Z');
    expect(getByText(format(timestamp, 'MMMM d, yyyy'), { exact: false })).to
      .exist;
    expect(getByText(/9876543210/)).to.exist;
  });

  it('renders the submission alert title and includes the reference number', () => {
    const store = createMockStore();
    const { container, getByText } = render(
      <Provider store={store}>
        <ConfirmationPage route={{ formConfig }} />
      </Provider>,
    );
    const alert = container.querySelector('va-alert');
    expect(alert).to.have.attr('status', 'success');
    expect(getByText(/Your form submission was succesful/)).to.exist;
    expect(getByText(/9876543210/)).to.exist;
  });

  it('renders a va-telephone component in the submission alert', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <ConfirmationPage route={{ formConfig }} />
      </Provider>,
    );
    const vaTelephone = container.querySelector('va-telephone');
    expect(vaTelephone).to.exist;
    expect(vaTelephone.getAttribute('contact')).to.equal('8778273702');
  });

  it('renders the rejected status alert content with reference number', () => {
    const mockState = {
      form: {
        ...createInitialState(formConfig),
        testData,
        submission: {
          response: {
            confirmationNumber: '1234567890',
            referenceNumber: '9876543210',
            status: 'REJECTED',
          },
          timestamp: new Date('2022-01-01T00:00:00Z'),
        },
      },
    };
    const store = createMockStore(mockState);
    const { getByText, container } = render(
      <Provider store={store}>
        <ConfirmationPage route={{ formConfig }} />
      </Provider>,
    );

    expect(getByText(/We received your application, but there was a problem/))
      .to.exist;
    expect(getByText(/For more information, contact us at/)).to.exist;
    expect(getByText(/9876543210/)).to.exist;

    const vaTelephone = container.querySelector('va-telephone');
    expect(vaTelephone).to.exist;
    expect(vaTelephone.getAttribute('contact')).to.equal('8778273702');
  });

  it('renders the duplicate status alert content without reference number', () => {
    const mockState = {
      form: {
        ...createInitialState(formConfig),
        testData,
        submission: {
          response: {
            confirmationNumber: '1234567890',
            referenceNumber: '9876543210',
            status: 'DUPLICATE',
          },
          timestamp: new Date('2022-01-01T00:00:00Z'),
        },
      },
    };
    const store = createMockStore(mockState);
    const { getByText, container } = render(
      <Provider store={store}>
        <ConfirmationPage route={{ formConfig }} />
      </Provider>,
    );

    expect(
      getByText(
        /We received your application, but we already have an existing housing grant application from you on file/,
      ),
    ).to.exist;
    const vaTelephone = container.querySelector('va-telephone');
    expect(vaTelephone).to.exist;
    expect(vaTelephone.getAttribute('contact')).to.equal('8778273702');
  });

  it('should select form from state when state.form is defined', () => {
    const submitDate = new Date();
    const mockState = {
      form: {
        ...createInitialState(formConfig),
        testData,
        submission: {
          timestamp: submitDate,
          response: { referenceNumber: '1234' },
        },
      },
    };
    const store = createMockStore(mockState);

    const { getByText } = render(
      <Provider store={store}>
        <ConfirmationPage route={{ formConfig }} />
      </Provider>,
    );

    const formattedDate = format(submitDate, 'MMMM d, yyyy');
    expect(getByText(new RegExp(formattedDate))).to.exist;
    expect(getByText(/1234/)).to.exist;
  });

  it('should throw error when state.form is undefined', () => {
    const store = configureStore({
      reducer: {
        form: () => ({
          ...createInitialState(formConfig),
          submission: undefined,
        }),
      },
    });

    expect(() => {
      render(
        <Provider store={store}>
          <ConfirmationPage route={{ formConfig }} />
        </Provider>,
      );
    }).to.throw();
  });
});
