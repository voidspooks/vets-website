import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';

import IntentToFileCardLoadingSkeleton from '../../components/IntentToFileCardLoadingSkeleton';

describe('<IntentToFileCardLoadingSkeleton>', () => {
  it('renders the loading skeleton with correct screen reader label', () => {
    const screen = render(<IntentToFileCardLoadingSkeleton />);
    screen.getByText(/Loading your intents to file/);
  });

  it('renders the skeleton container with the correct test id', () => {
    const screen = render(<IntentToFileCardLoadingSkeleton />);
    expect(screen.getByTestId('itf-card-loading-skeleton')).to.exist;
  });

  it('announces loaded state to screen readers when isLoading is false', () => {
    const screen = render(
      <IntentToFileCardLoadingSkeleton isLoading={false} />,
    );
    screen.getByText('Intents to file have loaded');
  });
});
