import React from 'react';

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
          <a
            href="/find-locations?facilityType=health&serviceType=UrgentCare"
            target="_blank"
            rel="noopener noreferrer"
          >
            urgent care facility
          </a>
        </li>
      </ul>
    </div>
  );
};

export default UrgentCommunicationsBlock;
