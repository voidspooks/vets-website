import React from 'react';

export default function FacilityCodeAdditionalInfo() {
  return (
    <va-additional-info trigger="What to do if this name or address looks incorrect">
      <p>
        After you have verified the facility code is correctly entered, if
        either the facility name or address is incorrect, please contact your
        Education Liaison Representative (ELR) at{' '}
        <va-link
          href="mailto:Federal.Approvals@va.gov"
          text="Federal.Approvals@va.gov"
        />
      </p>
    </va-additional-info>
  );
}
