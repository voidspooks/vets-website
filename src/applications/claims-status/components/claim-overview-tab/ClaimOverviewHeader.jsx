import React from 'react';
import PropTypes from 'prop-types';
import { useFeatureToggle } from '~/platform/utilities/feature-toggles';

import { getShowEightPhases, isPensionClaim } from '../../utils/helpers';

export default function ClaimOverviewHeader({
  claimTypeCode,
  claimStatusMeta,
}) {
  const { TOGGLE_NAMES, useToggleValue } = useFeatureToggle();
  const cstClaimPhasesEnabled = useToggleValue(TOGGLE_NAMES.cstClaimPhases);
  const showEightPhases = getShowEightPhases(
    claimTypeCode,
    cstClaimPhasesEnabled,
  );
  const configuredOverview = claimStatusMeta?.overview;

  const headerText = () => {
    if (configuredOverview?.description) {
      return configuredOverview.description;
    }
    if (showEightPhases && isPensionClaim(claimTypeCode)) {
      return 'There are 8 steps in the claim process. You may need to repeat steps 3 to 6 if we need more information.';
    }
    if (showEightPhases) {
      return `There are 8 steps in the claim process. It’s common for claims to repeat steps 3 to 6 if we need more information.`;
    }
    return 'Learn about the VA claim process and what happens after you file your claim.';
  };
  return (
    <div className="claim-overview-header-container">
      <h2 className="tab-header vads-u-margin-y--0">
        {configuredOverview?.title ||
          (isPensionClaim(claimTypeCode)
            ? 'Veterans Pension benefits claim process'
            : 'Overview of the claim process')}
      </h2>
      <p className="vads-u-margin-top--1 vads-u-margin-bottom--4 va-introtext">
        {headerText()}
      </p>
    </div>
  );
}

ClaimOverviewHeader.propTypes = {
  claimTypeCode: PropTypes.string,
  claimStatusMeta: PropTypes.object,
};
