import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { ConfirmationPageViewITF } from '../../../components/ConfirmationPageViewITF';

const veteranFullName = {
  first: 'John',
  middle: '',
  last: 'Veteran',
};
const address = {
  city: 'Boston',
  state: 'MA',
  postalCode: '12345',
};
const claimantId = 'abc123';

const getStore = () =>
  createStore(() => ({
    featureToggles: {
      // eslint-disable-next-line camelcase
      accredited_representative_portal_claimant_details: true,
    },
  }));
describe('ConfirmationPageViewITF', () => {
  it('shows status success and the correct confirmation number and submitted date', () => {
    const submitDate = new Date(2024, 4, 21);
    const expirationDate = new Date(2025, 4, 21);

    const { getByText, container } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <ConfirmationPageViewITF
            submitDate={submitDate}
            expirationDate={expirationDate}
            benefitType="compensation"
            childContent={null}
            name={veteranFullName}
            address={address}
            claimantId={claimantId}
          />
        </MemoryRouter>
      </Provider>,
    );

    expect(container.querySelector('va-alert')).to.have.attr(
      'status',
      'success',
    );
    expect(
      getByText('This information was recorded for the new intent to file.'),
    ).to.exist;
    expect(getByText('May 21, 2025 at 12:00 a.m. ET')).to.exist;
  });
});
