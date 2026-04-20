import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';

import ChampvaClosedAlert from '../../../components/claim-status-tab/ChampvaClosedAlert';

const buildClaim = ({ closeDate = null, closedAlert = {} } = {}) => ({
  id: '1',
  attributes: {
    closeDate,
    claimStatusMeta: {
      closedAlert,
    },
  },
});

describe('<ChampvaClosedAlert>', () => {
  context('when closeDate is null', () => {
    it('renders the title without a date', () => {
      const claim = buildClaim({
        closedAlert: { title: 'We made a decision on your application on' },
      });
      const { queryByText } = render(<ChampvaClosedAlert claim={claim} />);
      expect(queryByText('We made a decision on your application on')).to.exist;
    });

    it('renders description when provided', () => {
      const claim = buildClaim({
        closedAlert: {
          title: 'We made a decision on your application on',
          description:
            "We'll send you a decision letter for each applicant by mail.",
        },
      });
      const { queryByText } = render(<ChampvaClosedAlert claim={claim} />);
      expect(
        queryByText(
          "We'll send you a decision letter for each applicant by mail.",
        ),
      ).to.exist;
    });
  });

  context('when closeDate is provided', () => {
    it('appends the formatted date to the title', () => {
      const claim = buildClaim({
        closeDate: '2024-10-18',
        closedAlert: { title: 'We made a decision on your application on' },
      });
      const { queryByText } = render(<ChampvaClosedAlert claim={claim} />);
      expect(
        queryByText(
          'We made a decision on your application on October 18, 2024',
        ),
      ).to.exist;
    });
  });

  context('when claimStatusMeta.closedAlert is empty', () => {
    it('renders with fallback title', () => {
      const claim = buildClaim();
      const { queryByText } = render(<ChampvaClosedAlert claim={claim} />);
      expect(queryByText('We made a decision on your application')).to.exist;
    });
  });

  it('renders a va-alert with info status', () => {
    const claim = buildClaim({
      closedAlert: { title: 'We made a decision on your application on' },
    });
    const { container } = render(<ChampvaClosedAlert claim={claim} />);
    const alert = container.querySelector('va-alert');
    expect(alert).to.exist;
    expect(alert.getAttribute('status')).to.eq('info');
  });
});
