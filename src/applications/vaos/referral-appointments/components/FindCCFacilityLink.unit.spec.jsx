import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';

import FindCommunityCareOfficeLink from './FindCCFacilityLink';

describe('VAOS Component: FindCommunityCareOfficeLink', () => {
  it('should render the community care office link with correct attributes', () => {
    const screen = render(<FindCommunityCareOfficeLink />);

    const link = screen.getByTestId('referral-community-care-office');

    expect(link).to.exist;
    expect(link.getAttribute('href')).to.equal(
      '/COMMUNITYCARE/providers/Care-Coordination-Facilities.asp',
    );
    expect(link.getAttribute('text')).to.equal(
      'Find your community care office',
    );
  });

  it('should render as a va-link element', () => {
    const screen = render(<FindCommunityCareOfficeLink />);

    const link = screen.getByTestId('referral-community-care-office');

    expect(link.tagName.toLowerCase()).to.equal('va-link');
  });

  it('should render as a NewTabAnchor when newTab prop is true', () => {
    const screen = render(<FindCommunityCareOfficeLink newTab />);

    const link = screen.getByTestId('referral-community-care-office');

    expect(link.tagName.toLowerCase()).to.equal('a');
    expect(link.getAttribute('href')).to.equal(
      '/COMMUNITYCARE/providers/Care-Coordination-Facilities.asp',
    );
    expect(link.getAttribute('target')).to.equal('_blank');
    expect(link.getAttribute('rel')).to.equal('noopener noreferrer');
    expect(link.textContent).to.equal('Find your community care office');
  });
});
