import React from 'react';
import PropTypes from 'prop-types';
import NewTabAnchor from '../../components/NewTabAnchor';

const ccFacilityHref =
  '/COMMUNITYCARE/providers/Care-Coordination-Facilities.asp';

const FindCommunityCareOfficeLink = ({ newTab }) => {
  if (newTab) {
    return (
      <NewTabAnchor
        href={ccFacilityHref}
        data-testid="referral-community-care-office"
      >
        Find your community care office (opens in new tab)
      </NewTabAnchor>
    );
  }

  return (
    <va-link
      href={ccFacilityHref}
      text="Find your community care office"
      data-testid="referral-community-care-office"
    />
  );
};

FindCommunityCareOfficeLink.propTypes = {
  newTab: PropTypes.bool,
};

export default FindCommunityCareOfficeLink;
