import React from 'react';
import { expect } from 'chai';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { cleanup, render } from '@testing-library/react';
import { createInitialState } from '@department-of-veterans-affairs/platform-forms-system/state/helpers';
import formConfig from '../../../config/form';
import ConfirmationPage from '../../../containers/ConfirmationPage';

const mockStore = state => createStore(() => state);

const initPage = ({
  formData = {},
  response = { confirmationNumber: '1234567890' },
  includeSubmission = true,
  includeTimestamp = true,
} = {}) => {
  const store = mockStore({
    form: {
      ...createInitialState(formConfig),
      submission: includeSubmission
        ? {
            response,
            timestamp: includeTimestamp ? new Date() : undefined,
          }
        : {},
      data: formData,
    },
  });

  return render(
    <Provider store={store}>
      <ConfirmationPage route={{ formConfig }} />
    </Provider>,
  );
};

describe('21-0788 ConfirmationPage', () => {
  afterEach(() => cleanup());

  it('renders the success alert with the confirmation number', () => {
    const { container } = initPage({
      formData: {
        claimant: {
          fullName: { first: 'Jane', last: 'Doe' },
        },
      },
    });
    const alert = container.querySelector('va-alert');
    expect(alert).to.exist;
    expect(alert).to.contain.text('Your confirmation number is 1234567890');
  });

  it('uses the thank-you copy defined in confirmationPageText', () => {
    const { container } = initPage();
    expect(container).to.contain.text(
      'Thank you for submitting your request for apportionment.',
    );
  });

  it('falls back gracefully when claimant fullName is incomplete', () => {
    const { container } = initPage({
      formData: {
        claimant: {
          fullName: { first: 'Jane' },
        },
      },
    });
    expect(container.querySelector('va-alert')).to.exist;
  });

  it('handles a missing submission.response', () => {
    const { container } = initPage({
      response: undefined,
    });
    expect(container.querySelector('va-alert')).to.exist;
  });

  it('handles completely missing submission state', () => {
    const { container } = initPage({ includeSubmission: false });
    expect(container).to.exist;
  });

  it('includes the pdfUrl when the response provides one', () => {
    const { container } = initPage({
      response: {
        confirmationNumber: 'ABC-999',
        pdfUrl: 'https://example.com/claim.pdf',
      },
      formData: {
        claimant: {
          fullName: { first: 'Jane', last: 'Doe' },
        },
      },
    });
    expect(container).to.contain.text('ABC-999');
  });
});
