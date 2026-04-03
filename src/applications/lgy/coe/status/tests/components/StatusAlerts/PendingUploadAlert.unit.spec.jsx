import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { $ } from 'platform/forms-system/src/js/utilities/ui';
import { PendingUploadAlert } from '../../../components/StatusAlerts/PendingUploadAlert';

const defaultProps = {
  referenceNumber: '18959346',
  requestDate: 1722543158000,
};

describe('PendingUploadAlert', () => {
  it('should display reference number and request date', () => {
    const { container } = render(<PendingUploadAlert {...defaultProps} />);
    const alert = $('va-alert', container);
    expect(alert).to.exist;
    expect(alert.getAttribute('status')).to.equal('warning');
    expect(container.textContent).to.contain('18959346');
    expect(container.textContent).to.contain('August 1, 2024');
  });

  it('should display the correct headline', () => {
    const { container } = render(<PendingUploadAlert {...defaultProps} />);
    const headline = $('h2', container);
    expect(headline).to.exist;
    expect(headline.textContent).to.contain(
      'We need more information from you',
    );
  });

  it('should prompt the user to upload documents', () => {
    const { container } = render(<PendingUploadAlert {...defaultProps} />);
    expect(container.textContent).to.contain(
      'You’ll need to upload the documents so we can make a decision on your COE request.',
    );
  });
});
