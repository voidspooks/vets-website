import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { $$ } from '@department-of-veterans-affairs/platform-forms-system/ui';

import ChampvaNextSteps from '../../../components/claim-status-tab/ChampvaNextSteps';

const buildClaim = ({ nextSteps = {} } = {}) => ({
  id: '1',
  attributes: {
    closeDate: '2024-10-18',
    claimStatusMeta: {
      nextSteps,
    },
  },
});

const defaultNextSteps = {
  title: 'Next steps',
  items: [
    {
      boldText: 'If you agree with our decision',
      text: ", you don't need to do anything.",
    },
    {
      boldText:
        'If you disagree with our decision or have new information to submit',
      text: ', you can request a decision review.',
      linkText: 'Learn how to choose a decision review option',
      linkUrl: '/resources/choosing-a-decision-review-option/',
    },
    {
      boldText: "If you're newly enrolled",
      text: ' you can learn about the services we cover through CHAMPVA.',
      linkText: 'Learn about getting care through CHAMPVA',
      linkUrl:
        'https://www.va.gov/health-care/family-caregiver-benefits/champva/',
    },
  ],
};

describe('<ChampvaNextSteps>', () => {
  it('renders the section title', () => {
    const claim = buildClaim({ nextSteps: defaultNextSteps });
    const { queryByText } = render(<ChampvaNextSteps claim={claim} />);
    expect(queryByText('Next steps')).to.exist;
  });

  it('renders all item texts', () => {
    const claim = buildClaim({ nextSteps: defaultNextSteps });
    const { container } = render(<ChampvaNextSteps claim={claim} />);
    expect(container.textContent).to.include('If you agree with our decision,');
    expect(container.textContent).to.include("you don't need to do anything.");
    expect(container.textContent).to.include(
      'If you disagree with our decision',
    );
  });

  it('renders boldText inside a strong element', () => {
    const claim = buildClaim({ nextSteps: defaultNextSteps });
    const { container } = render(<ChampvaNextSteps claim={claim} />);
    const strongs = container.querySelectorAll('strong');
    expect(strongs.length).to.eq(3);
    expect(strongs[0].textContent).to.eq('If you agree with our decision');
  });

  it('renders va-link elements for items with linkText and linkUrl', () => {
    const claim = buildClaim({ nextSteps: defaultNextSteps });
    const { container } = render(<ChampvaNextSteps claim={claim} />);
    const links = $$('va-link', container);
    expect(links.length).to.eq(2);
  });

  it('does not render va-link for items without link data', () => {
    const claim = buildClaim({
      nextSteps: {
        title: 'Next steps',
        items: [{ text: 'No link here.' }],
      },
    });
    const { container } = render(<ChampvaNextSteps claim={claim} />);
    const links = $$('va-link', container);
    expect(links.length).to.eq(0);
  });

  it('returns null when items array is empty', () => {
    const claim = buildClaim({
      nextSteps: { title: 'Next steps', items: [] },
    });
    const { container } = render(<ChampvaNextSteps claim={claim} />);
    expect(container.firstChild).to.be.null;
  });

  context('when nextSteps is not present in claimStatusMeta', () => {
    it('returns null', () => {
      const claim = buildClaim();
      const { container } = render(<ChampvaNextSteps claim={claim} />);
      expect(container.firstChild).to.be.null;
    });
  });

  context('URL safety guard', () => {
    it('does not render va-link for an unsafe non-http URL', () => {
      const claim = buildClaim({
        nextSteps: {
          title: 'Next steps',
          items: [
            {
              text: 'Click here.',
              linkText: 'Unsafe link',
              linkUrl: 'data:text/html,<script>alert(1)</script>',
            },
          ],
        },
      });
      const { container } = render(<ChampvaNextSteps claim={claim} />);
      expect($$('va-link', container).length).to.eq(0);
    });

    it('renders va-link for a safe https URL', () => {
      const claim = buildClaim({
        nextSteps: {
          title: 'Next steps',
          items: [
            {
              text: 'Visit our site.',
              linkText: 'Go',
              linkUrl: 'https://va.gov/example',
            },
          ],
        },
      });
      const { container } = render(<ChampvaNextSteps claim={claim} />);
      const links = $$('va-link', container);
      expect(links.length).to.eq(1);
      expect(links[0].getAttribute('href')).to.eq('https://va.gov/example');
    });
  });
});
