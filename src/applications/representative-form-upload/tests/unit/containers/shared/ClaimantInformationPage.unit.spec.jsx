import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { claimantInformationPage } from '../../../../containers/shared/claimantInformation';

describe('claimantInformationPage', () => {
  const subject = () => render(<claimantInformationPage />);

  it('renders successfully', () => {
    const { container } = subject();
    expect(container).to.exist;
  });
});
