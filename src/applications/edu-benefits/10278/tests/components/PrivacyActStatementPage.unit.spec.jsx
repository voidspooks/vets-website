import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';

import PrivacyActStatementPage from '../../components/PrivacyActStatementPage';

describe('22-10278 <PrivacyActStatementPage>', () => {
  it('renders the page with the Privacy Act Statement heading', () => {
    const { getByText } = render(<PrivacyActStatementPage />);
    expect(getByText('Privacy Act Statement')).to.exist;
  });

  it('renders the privacy act statement content', () => {
    const { getByTestId } = render(<PrivacyActStatementPage />);
    expect(getByTestId('privacy-act-notice')).to.exist;
  });
});
