import React from 'react';
import ReferralLayout from '../components/ReferralLayout';
import ProviderSelectionCard from '../components/ProviderSelectionCard';
import { mockProviderDetails } from '../utils/mocks';
import FindCCFacilityLink from '../components/FindCCFacilityLink';

export default function ProviderSelection() {
  const providers = Array(5).fill(mockProviderDetails);
  const moreProviders = 5;
  const facilityDetails = {
    name: 'Portland VA Medical Center',
    phone: '###-###-####',
    tty: '###',
  };
  return (
    <ReferralLayout
      hasEyebrow
      heading="Which provider or clinic do you want to schedule with?"
    >
      <div>
        <p>
          You can schedule into VA or CC care within 25 miles of your home
          address.
        </p>
        <ul className="usa-unstyled-list vaos-appts__list">
          {providers.map((provider, index) => (
            <ProviderSelectionCard
              key={index}
              provider={provider}
              index={index}
            />
          ))}
        </ul>
        {moreProviders > 0 && (
          <va-button
            class="vads-u-margin-top--4"
            data-testid="show-more-providers-button"
            secondary
            text={`Show ${moreProviders} more providers`}
          />
        )}
        <div
          className="vads-u-margin-top--4"
          data-testid="different-provider-section"
        >
          <h3 className="vads-u-margin--0 vads-u-margin-bottom--1">
            If you want to schedule with a different provider
          </h3>
          <p className="vads-u-margin--0">
            For appointments at a VA health facility, call us at{' '}
            {facilityDetails.phone} (TTY: {facilityDetails.tty}
            ).
          </p>
          <p className="vads-u-margin--0">
            We’re here Monday through Friday, 8:00 a.m. to 8:00 p.m. ET.
          </p>
          <p className="vads-u-margin-top--4 vads-u-margin-bottom--0">
            For appointments at a community care facility, contact your
            community care provider.
          </p>
          <FindCCFacilityLink />
        </div>
      </div>
    </ReferralLayout>
  );
}
