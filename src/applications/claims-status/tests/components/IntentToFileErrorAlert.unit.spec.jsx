import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';

import IntentToFileErrorAlert from '../../components/IntentToFileErrorAlert';

describe('<IntentToFileErrorAlert>', () => {
  it('renders a warning alert with the correct headline and body copy', () => {
    const screen = render(<IntentToFileErrorAlert />);
    const alert = screen.getByTestId('itf-error-alert');
    expect(alert).to.exist;
    expect(alert).to.have.attr('status', 'warning');
    expect(screen.getByText(/We can.t access your intents to file right now/))
      .to.exist;
    expect(
      screen.getByText(
        /We.re sorry\. There.s a problem with our system\. Refresh this page or try again later\./,
      ),
    ).to.exist;
    expect(screen.getByText(/If it still doesn.t work, call us at/)).to.exist;
  });

  it('renders the phone number and TTY components', () => {
    const screen = render(<IntentToFileErrorAlert />);
    const phones = screen.container.querySelectorAll('va-telephone');
    expect(phones).to.have.length(2);
    expect(phones[0]).to.have.attr('contact', '8008271000');
    expect(phones[1]).to.have.attr('contact', '711');
    expect(phones[1]).to.have.attr('tty', 'true');
  });
});
