import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import GetFormHelp from './GetFormHelp';

describe('GetFormHelp component', () => {
  it('renders without throwing', () => {
    expect(() => render(<GetFormHelp />)).to.not.throw();
  });

  it('renders the Need help heading', () => {
    const { getByText } = render(<GetFormHelp />);
    expect(getByText('Need help?')).to.exist;
  });

  it('renders telephone elements', () => {
    const { container } = render(<GetFormHelp />);
    const phoneElements = container.querySelectorAll('va-telephone');
    expect(phoneElements.length).to.be.greaterThan(0);
  });
});