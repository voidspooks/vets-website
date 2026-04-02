import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';

import VassDowntimeMessage from './VassDowntimeMessage';
import { VASS_PHONE_NUMBER } from '../utils/constants';

describe('VASS Component: VassDowntimeMessage', () => {
  it('should render the warning alert when status is down', () => {
    const { getByTestId, getByRole } = render(
      <VassDowntimeMessage status="down">
        <div>children</div>
      </VassDowntimeMessage>,
    );

    const alert = getByTestId('vass-downtime-message');
    expect(alert).to.exist;
    expect(alert.getAttribute('status')).to.equal('warning');
    expect(alert.getAttribute('visible')).to.not.be.null;

    const heading = getByRole('heading', { level: 2 });
    expect(heading).to.exist;
    expect(heading.textContent).to.contain(
      "We're working on this scheduling tool right now",
    );
  });

  it('should display both paragraphs with the correct text', () => {
    const { getByTestId } = render(
      <VassDowntimeMessage status="down">
        <div>children</div>
      </VassDowntimeMessage>,
    );

    const alert = getByTestId('vass-downtime-message');
    expect(alert.textContent).to.contain(
      "You can't access the VA Solid Start scheduling tool right now",
    );
    expect(alert.textContent).to.contain('Check back soon');
    expect(alert.textContent).to.contain(
      "We're here Monday through Friday, 8:00 a.m. to 9:00 p.m. ET",
    );
  });

  it('should render a va-telephone with the correct contact number', () => {
    const { getByTestId } = render(
      <VassDowntimeMessage status="down">
        <div>children</div>
      </VassDowntimeMessage>,
    );

    const alert = getByTestId('vass-downtime-message');
    const telephone = alert.querySelector('va-telephone');
    expect(telephone).to.exist;
    expect(telephone.getAttribute('contact')).to.equal(VASS_PHONE_NUMBER);
  });

  it('should render children when status is not down', () => {
    const { getByText, queryByTestId } = render(
      <VassDowntimeMessage status="ok">
        <div>child content</div>
      </VassDowntimeMessage>,
    );

    expect(getByText('child content')).to.exist;
    expect(queryByTestId('vass-downtime-message')).to.not.exist;
  });

  it('should render children when status is undefined', () => {
    const { getByText, queryByTestId } = render(
      <VassDowntimeMessage>
        <div>child content</div>
      </VassDowntimeMessage>,
    );

    expect(getByText('child content')).to.exist;
    expect(queryByTestId('vass-downtime-message')).to.not.exist;
  });
});
