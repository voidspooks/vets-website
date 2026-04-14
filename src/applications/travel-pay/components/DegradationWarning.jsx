import React from 'react';
import PropTypes from 'prop-types';
import {
  DowntimeNotification,
  externalServices,
  externalServiceStatus,
} from '@department-of-veterans-affairs/platform-monitoring/DowntimeNotification';

const DegradationWarning = ({ warningType = 'submitting' }) => {
  return (
    <DowntimeNotification
      appTitle="Travel Pay"
      dependencies={[externalServices.travelPayWarning]}
      render={({ status }) => {
        if (status === externalServiceStatus.down) {
          return (
            <va-alert status="warning">
              <h2 slot="headline">
                You may have trouble {warningType} a claim right now
              </h2>
              <p>
                Some Veterans have reported problems {warningType} travel
                reimbursement claims. We’re working to fix the issue now.
              </p>
              <p>
                If you have trouble {warningType} a claim, try again later. Or
                you can call the Beneficiary Travel Self Service System (BTSSS)
                call center at
                <va-telephone contact="8555747292" /> (
                <va-telephone tty contact="711" />
                ). We’re here Monday through Friday, 8:00 a.m. to 8:00 p.m. ET.
              </p>
            </va-alert>
          );
        }
        return null;
      }}
    />
  );
};

DegradationWarning.propTypes = {
  warningType: PropTypes.oneOf(['starting', 'submitting']).isRequired,
};

export default DegradationWarning;
