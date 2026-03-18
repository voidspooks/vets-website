import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import StatusAlertBanner from '../../../components/shared/StatusAlertBanner';

describe('StatusAlertBanner', () => {
  it('renders without errors', () => {
    const screen = render(<StatusAlertBanner />);
    expect(screen).to.exist;
  });

  it('renders the child in the data-testid', () => {
    const screen = render(
      <StatusAlertBanner testId="test-banner">Test message</StatusAlertBanner>,
    );
    const banner = screen.getByTestId('test-banner');
    expect(banner).to.contain.text('Test message');
  });
});
