import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';

import OtherWaysToSendYourDocuments from '../../../components/claim-files-tab-v2/OtherWaysToSendYourDocuments';
import {
  MAILING_ADDRESS,
  CONTACT_INFO,
  LINKS,
  ANCHOR_LINKS,
} from '../../../constants';

describe('<OtherWaysToSendYourDocuments>', () => {
  let getByText;
  let container;

  beforeEach(() => {
    const result = render(<OtherWaysToSendYourDocuments />);
    getByText = result.getByText;
    container = result.container;
  });

  describe('Main Structure', () => {
    it('should render the main heading', () => {
      expect(getByText('Other ways to send your documents')).to.exist;
    });

    it('should render the main heading with correct id', () => {
      const heading = container.querySelector('h2#other-ways-to-send');
      expect(heading).to.exist;
      expect(heading.getAttribute('id')).to.equal(
        ANCHOR_LINKS.otherWaysToSendDocuments,
      );
    });

    it('should render the general instructions', () => {
      expect(
        getByText(
          'Print a copy of each document and write your Social Security number on the first page. Then resubmit by mail or in person.',
        ),
      ).to.exist;
    });

    it('should have the scroll-anchor class for accessibility', () => {
      const mainDiv = container.querySelector('#other-ways-to-send-documents');
      expect(mainDiv).to.exist;
      expect(mainDiv).to.have.class('scroll-anchor');
    });
  });

  describe('Mail Section', () => {
    it('should render the mail section heading', () => {
      expect(getByText('Option 1: By mail')).to.exist;
    });

    it('should render the Option 1 general instructions', () => {
      expect(getByText('Mail the document to this address:')).to.exist;
    });

    it('should render the Option 1 mailing address', () => {
      expect(container.textContent).to.include(MAILING_ADDRESS.organization);
    });
  });

  describe('In-Person Section', () => {
    it('should render the in-person section heading', () => {
      expect(getByText('Option 2: In person')).to.exist;
    });

    it('should render the Option 2 general instructions', () => {
      expect(getByText('Bring the document to a VA regional office.')).to.exist;
    });

    it('should render the Option 2 link to find a VA regional office', () => {
      const link = container.querySelector(
        `va-link[href="${LINKS.findVaLocations}"]`,
      );
      expect(link).to.exist;
      expect(link.getAttribute('text')).to.equal(
        'Find a VA regional office near you',
      );
    });
  });

  describe('Confirmation Section', () => {
    it('should render the confirmation section heading', () => {
      expect(getByText('How to confirm we\u2019ve received your documents')).to
        .exist;
    });

    it('should render the confirmation section instructions', () => {
      expect(
        getByText(
          `To confirm we\u2019ve received a document you submitted by mail or in person, call us at ${
            CONTACT_INFO.phone
          } (TTY: ${CONTACT_INFO.tty}). We\u2019re here ${CONTACT_INFO.hours}.`,
        ),
      ).to.exist;
    });
  });

  describe('Custom claimStatusMeta rendering', () => {
    const buildClaim = filesMeta => ({
      attributes: { claimStatusMeta: { files: filesMeta } },
    });

    describe('option1 link', () => {
      it('renders an internal va-link-action when linkExternal is false', () => {
        const claim = buildClaim({
          options: {
            option1: {
              title: 'By mail',
              linkText: 'Submit online',
              linkUrl: 'https://va.gov/submit',
              linkExternal: false,
            },
          },
        });
        const { container: c } = render(
          <OtherWaysToSendYourDocuments claim={claim} />,
        );
        const link = c.querySelector(
          'va-link-action[href="https://va.gov/submit"]',
        );
        expect(link).to.exist;
        expect(link.getAttribute('target')).to.be.null;
        expect(link.getAttribute('rel')).to.be.null;
      });

      it('renders an external va-link-action with aria label and onClick when linkExternal is true', () => {
        const claim = buildClaim({
          options: {
            option1: {
              title: 'By mail',
              linkText: 'Submit online',
              linkUrl: 'https://va.gov/submit',
              linkExternal: true,
            },
          },
        });
        const { container: c } = render(
          <OtherWaysToSendYourDocuments claim={claim} />,
        );
        const link = c.querySelector(
          'va-link-action[href="https://va.gov/submit"]',
        );
        expect(link).to.exist;
        expect(link.getAttribute('message-aria-describedby')).to.equal(
          'Opens in a new tab',
        );
      });

      it('does not render a link when linkText or linkUrl is missing', () => {
        const claim = buildClaim({
          options: { option1: { title: 'By mail', linkText: 'Submit' } },
        });
        const { container: c } = render(
          <OtherWaysToSendYourDocuments claim={claim} />,
        );
        expect(c.querySelector('va-link-action')).to.not.exist;
      });
    });

    describe('option3 fax block', () => {
      it('renders when option3 is present', () => {
        const claim = buildClaim({
          options: {
            option3: {
              title: 'Option 3: By fax',
              description: 'Fax your documents.',
            },
          },
        });
        const { getByText: gbt } = render(
          <OtherWaysToSendYourDocuments claim={claim} />,
        );
        expect(gbt('Option 3: By fax')).to.exist;
        expect(gbt('Fax your documents.')).to.exist;
      });

      it('renders option3 noteText when present', () => {
        const claim = buildClaim({
          options: {
            option3: {
              title: 'Option 3: By fax',
              noteText: 'Only send copies, not originals.',
            },
          },
        });
        const { getByText: gbt } = render(
          <OtherWaysToSendYourDocuments claim={claim} />,
        );
        expect(gbt('Only send copies, not originals.')).to.exist;
      });

      it('does not render the fax section when option3 is absent', () => {
        const claim = buildClaim({
          options: { option1: { title: 'By mail' } },
        });
        const { container: c } = render(
          <OtherWaysToSendYourDocuments claim={claim} />,
        );
        expect(c.querySelector('.other-ways-fax-section')).to.not.exist;
      });
    });

    describe('confirmation section with custom meta', () => {
      it('renders confirmation.description instead of default text', () => {
        const claim = buildClaim({
          confirmation: { description: 'Call us to confirm receipt.' },
        });
        const { getByText: gbt, container: c } = render(
          <OtherWaysToSendYourDocuments claim={claim} />,
        );
        expect(gbt('Call us to confirm receipt.')).to.exist;
        expect(c.querySelector('va-telephone')).to.not.exist;
      });

      it('renders confirmation.descriptionNote when present', () => {
        const claim = buildClaim({
          confirmation: {
            description: 'Call us to confirm receipt.',
            descriptionNote: 'Response times may vary.',
          },
        });
        const { getByText: gbt } = render(
          <OtherWaysToSendYourDocuments claim={claim} />,
        );
        expect(gbt('Call us to confirm receipt.')).to.exist;
        expect(gbt('Response times may vary.')).to.exist;
      });

      it('does not render descriptionNote when absent', () => {
        const claim = buildClaim({
          confirmation: { description: 'Call us to confirm receipt.' },
        });
        const { container: c } = render(
          <OtherWaysToSendYourDocuments claim={claim} />,
        );
        expect(
          c.querySelectorAll('.other-ways-confirmation-section p').length,
        ).to.equal(1);
      });
    });
  });
});
