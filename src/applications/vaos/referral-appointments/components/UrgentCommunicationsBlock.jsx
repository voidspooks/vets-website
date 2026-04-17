import React from 'react';
import NewTabAnchor from '../../components/NewTabAnchor';

const UrgentCommunicationsBlock = () => {
  return (
    <div className="vads-u-margin-top--2">
      <p className="vads-u-font-weight--bold">
        If you need care sooner, use one of these urgent communications options:
      </p>
      <ul>
        <li>
          Call <va-telephone contact="911" />, <strong>or</strong>
        </li>
        <li>
          Call <va-telephone contact="988" /> and select 1 for the Veterans
          Crisis Line, <strong>or</strong>
        </li>
        <li>
          Go to your nearest emergency room or{' '}
          <NewTabAnchor href="/find-locations?facilityType=health&serviceType=UrgentCare">
            urgent care facility (opens in new tab)
          </NewTabAnchor>
        </li>
      </ul>
    </div>
  );
};

export default UrgentCommunicationsBlock;
