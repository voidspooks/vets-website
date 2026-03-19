import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { ConfirmationPageView } from '../../../components/ConfirmationPageView';

const getStore = () =>
  createStore(() => ({
    featureToggles: {
      // eslint-disable-next-line camelcase
      accredited_representative_portal_claimant_details: true,
    },
  }));
describe('ConfirmationPageView', () => {
  it('shows status success and the correct confirmation number and submitted date', () => {
    const confirmationNumber = '123456';
    const submitDate = new Date(2025, 4, 21);
    const formNumber = '21-686c';
    const name = {
      first: 'John',
      last: 'Doe',
    };
    const claimantId = 'abc123';
    const { getByText, container } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <ConfirmationPageView
            name={name}
            claimantId={claimantId}
            confirmationNumber={confirmationNumber}
            submitDate={submitDate}
            formNumber={formNumber}
            childContent={null}
          />
        </MemoryRouter>
      </Provider>,
    );

    expect(container.querySelector('va-alert')).to.have.attr(
      'status',
      'success',
    );
    expect(getByText('Your confirmation number is:')).to.exist;
    expect(getByText('123456')).to.exist;
    expect(getByText('You submitted the form and supporting evidence on')).to
      .exist;
    expect(getByText(/May 21, 2025/)).to.exist;
  });
});
