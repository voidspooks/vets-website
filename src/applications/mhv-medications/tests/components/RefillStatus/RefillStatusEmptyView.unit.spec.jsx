import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import RefillStatusEmptyView from '../../../components/RefillStatus/RefillStatusEmptyView';

describe('RefillStatusEmptyView Component', () => {
  const setup = () => render(<RefillStatusEmptyView />);

  it('renders the correct content', () => {
    const screen = setup();
    const { container } = screen;

    // "You don't have any..." section
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /You don’t have any refill requests in progress/,
      }),
    ).to.exist;
    expect(
      screen.getByText(
        /You don’t have any prescription refills requested, in progress, or being shipped/,
      ),
    ).to.exist;

    // Process list content
    expect(screen.getByText('How the refill process works on VA.gov')).to.exist;
    const processListItems = container.querySelectorAll('va-process-list-item');
    expect(processListItems.length).to.equal(3);
    expect(processListItems[0]).to.have.attribute(
      'header',
      'You request a refill',
    );
    expect(processListItems[1]).to.have.attribute(
      'header',
      'We process your refill request',
    );
    expect(processListItems[2]).to.have.attribute(
      'header',
      'We ship your refill to you',
    );
  });
});
