import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { veteranInformationPage } from '../../../../containers/form526ez/526ezVeteranInformation';

describe('veteranInformationPage', () => {
  const subject = () => render(<veteranInformationPage />);

  it('renders successfully', () => {
    const { container } = subject();
    expect(container).to.exist;
  });
});
